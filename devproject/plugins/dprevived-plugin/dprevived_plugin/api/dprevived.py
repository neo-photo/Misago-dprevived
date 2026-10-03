from django.db import connection
#from rest_framework.response import Response
from django.http import JsonResponse
from devproject import settings
# AJ 03.10.26: Misago treats posts older than the readtracker cutoff as read, so they need no row
from misago.readtracker.cutoffdate import get_cutoff_date

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
    
def mark_read( thread_pk, cursor, request):
        # AJ 03.10.26: skip posts older than the readtracker cutoff, whole forum is then ~400 inserts instead of ~102000
        cursor.execute("SELECT  id, category_id from misago_threads_post WHERE thread_id=%s AND posted_on > %s", [int(thread_pk), get_cutoff_date(request.settings, request.user)])
        rows = cursor.fetchall()
        lines = 0
        for one in rows:
            cursor.execute("insert into misago_readtracker_postread( last_read_on, post_id ,category_id, thread_id, user_id) values (NOW(), %s ,%s, %s, %s) ON CONFLICT DO NOTHING"%(one[0],one[1],int(thread_pk), request.user.id ))
            lines +=1
        # AJ 03.10.26: move the watched thread marker to the last post, else user_has_other_unread_posts() suppresses the next reply notification and its e-mail
        cursor.execute("UPDATE misago_notifications_watchedthread w SET read_at = t.last_post_on FROM misago_threads_thread t WHERE t.id = %s AND w.thread_id = t.id AND w.user_id = %s AND w.read_at < t.last_post_on"%(int(thread_pk), request.user.id))
        return lines

def mark_thread_read(request, thread_pk):
    lines = -1
    with connection.cursor() as cursor:
        lines = mark_read( thread_pk, cursor, request) 
        cursor.execute("update  misago_notifications_notification set is_read=true where thread_id = %s and user_id = %s"%(int(thread_pk),request.user.id))
        cursor.execute("SELECT category_id FROM misago_threads_thread where id = %s"%int(thread_pk))
        cat = cursor.fetchall()[0][0]       
        if (cat==1):
            cursor.execute("SELECT count(distinct misago_threads_post.thread_id) FROM misago_threads_post left join misago_threads_threadparticipant on misago_threads_threadparticipant.thread_id = misago_threads_post.thread_id WHERE misago_threads_post.category_id = '1' and misago_threads_threadparticipant.user_id = %s and misago_threads_post.id not in (SELECT post_id FROM misago_readtracker_postread WHERE category_id = '1' AND user_id = '%s' )"%(request.user.id,request.user.id))
            nr = cursor.fetchall()[0][0]
            cursor.execute("update misago_users_user set unread_private_threads = %s where id = %s"%(nr ,request.user.id))
        else:
            cursor.execute("SELECT count(*) FROM misago_notifications_notification  where is_read=false and user_id = %s"%request.user.id)
            nr = cursor.fetchall()[0][0]
            cursor.execute("update misago_users_user set unread_notifications = %s where id = %s"%(nr,request.user.id))
    return JsonResponse({"read":lines, "user": request.user.id})


def mark_category_read(request, category_pk):
    # AJ 03.10.26: both were -1, so the counts came back one too low, and "read" was -1 when nothing needed marking
    lines = 0
    threads = 0
    with connection.cursor() as cursor:
        # AJ 03.10.26: the category itself plus all its descendants in one query; the old level branching crashed on level 1, and marked nothing for the root or for a category without children
        cursor.execute("SELECT c.id FROM misago_categories_category c, misago_categories_category p WHERE p.id = %s AND c.tree_id = p.tree_id AND c.lft >= p.lft AND c.rght <= p.rght"%int(category_pk))
        cats = cursor.fetchall()
        for x in cats:
            # AJ 03.10.26: in the private threads category only the user's own threads, the query above now reaches category 1 where the old code marked nothing
            if int(x[0])==1:
                cursor.execute("SELECT t.id from misago_threads_thread t, misago_threads_threadparticipant p WHERE t.category_id = 1 AND p.thread_id = t.id AND p.user_id = %s"%request.user.id)
            else:
                cursor.execute("SELECT id from misago_threads_thread WHERE category_id=%s"%int(x[0]))
            rows = cursor.fetchall()
            for one in rows:
                threads += 1
                lines += mark_read( one[0], cursor, request) 
                # AJ 03.10.26: was thread_pk, which does not exist in this function (NameError on the first thread)
                cursor.execute("update  misago_notifications_notification set is_read=true where thread_id = %s and user_id = %s"%(int(one[0]),request.user.id))
        if (int(category_pk)==1):
            cursor.execute("update misago_users_user set unread_private_threads = 0 where id = %s"%(request.user.id))
        else:
            cursor.execute("SELECT count(*) FROM misago_notifications_notification  where is_read=false and user_id = %s"%request.user.id)
            nr = cursor.fetchall()[0][0]
            cursor.execute("update misago_users_user set unread_notifications = %s where id = %s"%(nr,request.user.id))
    return JsonResponse({"read":lines, "threads":threads,"user": request.user.id})
