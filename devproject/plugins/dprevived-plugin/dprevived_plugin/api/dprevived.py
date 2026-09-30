from django.db import connection
from django.db.models import F, OuterRef, Subquery
#from rest_framework.response import Response
from django.http import Http404, JsonResponse
from devproject import settings
from misago.categories import PRIVATE_THREADS_ROOT_NAME
from misago.categories.models import Category
from misago.notifications.models import Notification, WatchedThread
from misago.readtracker.cutoffdate import get_cutoff_date
from misago.readtracker.signals import thread_read
from misago.threads.models import Thread, ThreadParticipant
from misago.threads.permissions import can_see_private_thread, can_see_thread

def dictfetchall(cursor):
    """
    Return all rows from a cursor as a dict.
    Assume the column names are unique.
    """
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
def set_post_limit(request, post_limit):    
    try:
        post_limit =int(post_limit)
    except ValueError:
        post_limit = -1
    if post_limit == 0:
        del request.session["posts_per_page"]
    elif post_limit>0 and post_limit<51:
        request.session["posts_per_page"] = post_limit
    else:
        return JsonResponse({"error":1 })
    return JsonResponse({"error":0 })
    
def check_free_space(request):
    max_space_kb = settings.MISAGO_MAX_SPACE_USER * 1024
    max_space = (max_space_kb * 1024)
    used = max_space
    free = 0
    with connection.cursor() as cursor:
        cursor.execute("select sum(size),count(id) from misago_threads_attachment where uploader_id = %s"%(int(request.user.id)))
        (usedSpace, filesCount) = cursor.fetchone()
        #print(filesCount, usedSpace)
        if filesCount==0:
            usedSpace = 0
        else:
            try:
                usedSpace = int(usedSpace)
            except ValueError:
                usedSpace = 100000000000
        free = (max_space - usedSpace)
        if free<0: free = 0
    #print(free,usedSpace )
    used_kb = int(usedSpace / 1024.0 )
    free_kb = max_space_kb - used_kb
    free_pct = int(((free/max_space) * 100))
    used_pct = int(((usedSpace/max_space) * 100))
    return JsonResponse({"max":max_space_kb , "used": used_kb,"free":free_kb,"usedp": used_pct ,"freep":free_pct })
    
# Marks every post of the given threads/categories as read for the user, the way Misago's
# readtracker stores it: one misago_readtracker_postread row per post. Posts older than the
# readtracker cutoff are read by definition. Only the missing rows are inserted, in one
# statement; NOT EXISTS, so it doesn't rely on the (hand-made) readtracker_read unique index.
MARK_READ_SQL = """
    INSERT INTO misago_readtracker_postread (user_id, category_id, thread_id, post_id, last_read_on)
    SELECT %(user)s, p.category_id, p.thread_id, p.id, NOW()
    FROM misago_threads_post p
    WHERE p.{column} = ANY(%(ids)s) AND p.posted_on > %(cutoff)s
    AND NOT EXISTS (
        SELECT 1 FROM misago_readtracker_postread r WHERE r.user_id = %(user)s AND r.post_id = p.id
    )
"""

def mark_read(request, column, ids):
    cutoff = get_cutoff_date(request.settings, request.user)
    with connection.cursor() as cursor:
        cursor.execute(
            MARK_READ_SQL.format(column=column),
            {"user": request.user.id, "ids": list(ids), "cutoff": cutoff},
        )
        return cursor.rowcount

# What Misago also does when a user reads posts (misago/threads/api/postendpoints/read.py),
# for every thread in `threads`:
# - mark their notifications read and recount the user's unread notifications (the badge);
# - move the watched-thread marker to the last post. Misago notifies only about the first
#   unread reply: while the user has posts newer than read_at
#   (notifications.threads.user_has_other_unread_posts) a new reply creates no notification
#   and sends no e-mail, so without this a thread marked read stays silent.
def update_read_state(user, threads):
    notifications = Notification.objects.filter(user=user, is_read=False, thread__in=threads)
    if notifications.update(is_read=True):
        user.unread_notifications = Notification.objects.filter(user=user, is_read=False).count()
        user.save(update_fields=["unread_notifications"])
    WatchedThread.objects.filter(
        user=user, thread__in=threads, read_at__lt=F("thread__last_post_on")
    ).update(
        read_at=Subquery(Thread.objects.filter(pk=OuterRef("thread_id")).values("last_post_on")[:1])
    )

# Response for both endpoints. The navbar counters, in the form the frontend keeps them
# (users/serializers/auth.py), so the page can update its badges without a reload.
def read_response(request, **data):
    data.update({
        "user": request.user.id,
        "unreadNotifications": request.user.get_unread_notifications_for_display(),
        "unread_private_threads": request.user.unread_private_threads,
    })
    return JsonResponse(data)

def mark_thread_read(request, thread_pk):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "not signed in"}, status=403)
    thread = Thread.objects.select_related("category").filter(pk=thread_pk).first()
    if thread is None:
        raise Http404()
    if thread.category.special_role == PRIVATE_THREADS_ROOT_NAME:
        is_participant = ThreadParticipant.objects.filter(thread=thread, user=request.user).exists()
        can_see = can_see_private_thread(request.user_acl, thread, is_participant)
    else:
        can_see = can_see_thread(request.user_acl, thread)
    if not can_see:
        raise Http404()
    lines = mark_read(request, "thread_id", [thread.pk])
    update_read_state(request.user, Thread.objects.filter(pk=thread.pk))
    if lines:
        # the thread had unread posts; lowers the unread private threads count
        thread_read.send(request.user, thread=thread)
    return read_response(request, read=lines)

def mark_category_read(request, category_pk):
    # The category itself and everything below it; the root category ("all threads")
    # covers the whole public tree. Limited to the categories the user may browse.
    # The private threads list sends its own root: the user's private threads.
    if not request.user.is_authenticated:
        return JsonResponse({"error": "not signed in"}, status=403)
    if int(category_pk) == Category.objects.private_threads().pk:
        return mark_private_threads_read(request)
    category = Category.objects.all_categories(include_root=True).filter(pk=category_pk).first()
    if category is None:
        raise Http404()
    browseable = set(request.user_acl["browseable_categories"])
    cats = [
        pk for pk in category.get_descendants(include_self=True).values_list("pk", flat=True)
        if pk in browseable
    ]
    lines = mark_read(request, "category_id", cats) if cats else 0
    if cats:
        update_read_state(request.user, Thread.objects.filter(category_id__in=cats))
    return read_response(request, read=lines, categories=len(cats))

def mark_private_threads_read(request):
    threads = Thread.objects.filter(
        category=Category.objects.private_threads(), threadparticipant__user=request.user
    )
    ids = list(threads.values_list("pk", flat=True))
    lines = mark_read(request, "thread_id", ids) if ids else 0
    if ids:
        update_read_state(request.user, Thread.objects.filter(pk__in=ids))
    # every private thread the user takes part in is read now
    if request.user.unread_private_threads or request.user.sync_unread_private_threads:
        request.user.unread_private_threads = 0
        request.user.sync_unread_private_threads = False
        request.user.save(update_fields=["unread_private_threads", "sync_unread_private_threads"])
    return read_response(request, read=lines, threads=len(ids))
