from django.db import connection
#from rest_framework.response import Response
from django.http import Http404, JsonResponse
from devproject import settings
from misago.categories import PRIVATE_THREADS_ROOT_NAME
from misago.categories.models import Category
from misago.readtracker.cutoffdate import get_cutoff_date
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
# readtracker cutoff are read by definition, and the table has no unique constraint, so only
# the missing rows are inserted - one statement, no duplicates on repeated clicks.
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
    return JsonResponse({"read": lines, "user": request.user.id})

def mark_category_read(request, category_pk):
    # The category itself and everything below it; the root category ("all threads")
    # covers the whole public tree. Limited to the categories the user may browse.
    if not request.user.is_authenticated:
        return JsonResponse({"error": "not signed in"}, status=403)
    category = Category.objects.all_categories(include_root=True).filter(pk=category_pk).first()
    if category is None:
        raise Http404()
    browseable = set(request.user_acl["browseable_categories"])
    cats = [
        pk for pk in category.get_descendants(include_self=True).values_list("pk", flat=True)
        if pk in browseable
    ]
    lines = mark_read(request, "category_id", cats) if cats else 0
    return JsonResponse({"read": lines, "categories": len(cats), "user": request.user.id})
