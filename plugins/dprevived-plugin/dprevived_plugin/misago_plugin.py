from django.db import connection
#from rest_framework.response import Response
from django.http import JsonResponse
from settings import settings

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
        cursor.execute("SELECT  id, category_id from misago_threads_post WHERE thread_id=%s"%(int(thread_pk)))
        rows = cursor.fetchall()
        lines = 0
        for one in rows:
            cursor.execute("insert into misago_readtracker_postread( last_read_on, post_id ,category_id, thread_id, user_id) values (NOW(), %s ,%s, %s, %s) ON CONFLICT DO NOTHING"%(one[0],one[1],int(thread_pk), request.user.id ))
            lines +=1
        return lines

def mark_thread_read(request, thread_pk):
    lines = -1
    with connection.cursor() as cursor:
        lines = mark_read( thread_pk, cursor, request) 
    return JsonResponse({"read":lines, "user": request.user.id})


def mark_category_read(request, category_pk):
    lines = -1
    threads = -1
    with connection.cursor() as cursor:
        cursor.execute("SELECT level from misago_categories_category WHERE id=%s"%int(category_pk))
        res = cursor.fetchone()[0]
        if int(res)>2:
           cats =[[category_pk]]
        elif int(res)<1: 
            cats =[]
        else: # Level 1 und 2
            cursor.execute("SELECT id from misago_categories_category WHERE parent_id=%s"%int(category_pk))
            cats = cursor.fetchall()
            if int(res)==1:
                cursor.execute("SELECT id from misago_categories_category WHERE parent_id in ()"%(",".join(cats)))
                cats += cursor.fetchall()
                print(cats)
        for x in cats:
            cursor.execute("SELECT id from misago_threads_thread WHERE category_id=%s"%int(x[0]))
            rows = cursor.fetchall()
            for one in rows:
                threads += 1
                lines += mark_read( one[0], cursor, request) 
    return JsonResponse({"read":lines, "threads":threads,"user": request.user.id})


manifest = MisagoPlugin(
    name="Example plugin with complete manifest",
    description="This plugin has all fields in its manifest filled in.",
    license="GNU GPL v2",
    icon="fa fa-wrench",
    color="#9b59b6",
    version="0.1DEV",
    author="Rafał Pitoń",
    homepage="https://misago-project.org",
    sponsor="https://github.com/sponsors/rafalp",
    help="https://misago-project.org/c/support/30/",
    bugs="https://misago-project.org/c/bug-reports/29/",
    repo="https://github.com/rafalp/misago",
)

