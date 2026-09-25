#from misago.threads.models import Post, Thread, Attachment
#from django.contrib.auth import get_user_model
#User = get_user_model()
from django.db import connection
from devproject import settings

__version__ = "6"

def dictfetchall(cursor):
    """
    Return all rows from a cursor as a dict.
    Assume the column names are unique.
    """
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
def make_entry(row):
    res = {"submenu" : {}}
    for (key,value) in row.items():
        res[key] = value
    if  (res["read"]==True):
        res["outline"] ="_outline"
    else:
        res["outline"] =""
    return res

def dprevived_context(request):
    import time
    start_time = time.time()
    CT = {}
    body_class = request.COOKIES.get('dpreviedBGSet',"light").split("+",1)[0]
    #print(dir(settings))
    CT["dprevived"] ={"MAX_SPACE_USER":settings.MISAGO_MAX_SPACE_USER,
                        "Version":__version__,
                        "BodyClass":body_class,
                        "usersonline":0,
                        "Time":0,
                        "log":"",
                        "menu": {},
                        "uploads":0,
                        "attachments":0,
                        "threads":0,
                        "posts":0,
                        "users":0,
                        }
    with connection.cursor() as cursor:
        # Stats on Homepage
        if (request.path == "/"):
            cursor.execute("select count(id), sum(size)/1024.0/1024 from misago_threads_attachment")
            res = cursor.fetchone()
            CT["dprevived"]["uploads"] = "{:,}".format(int(res[1]))
            CT["dprevived"]["attachments"] =  "{:,}".format(res[0])
            cursor.execute("select count(id) from misago_threads_thread")
            CT["dprevived"]["threads"] =  "{:,}".format(cursor.fetchone()[0])
            cursor.execute("select count(id) from misago_threads_post")
            CT["dprevived"]["posts"] = "{:,}".format(cursor.fetchone()[0])
            cursor.execute("select count(id) from misago_users_user")
            CT["dprevived"]["users"] = "{:,}".format(cursor.fetchone()[0])
            from django.contrib.sessions.models import Session
            from django.utils import timezone
            #CT["dprevived"]["usersonline"] = len(Session.objects.filter(expire_date__gte=timezone.now()))
            cursor.execute("select count(user_id) from misago_users_online where last_click::date=now()::date")
            CT["dprevived"]["usersonline"] = cursor.fetchone()[0]
        menu = {}
        sub_hash = {}
        #print(request.user_acl["visible_categories"])
        catlist = ",".join(map(str,request.user_acl["visible_categories"]))
        if request.user.is_authenticated:
            uid = int(request.user.id)
            sql = "select misago_categories_category.last_post_on<=misago_readtracker_postread.last_read_on as read ,misago_categories_category.id,name,slug,description,is_closed,threads,posts, short_name, level, color,parent_id from misago_categories_category left join misago_readtracker_postread on misago_categories_category.id=misago_readtracker_postread.category_id and misago_readtracker_postread.thread_id = misago_categories_category.last_thread_id and misago_readtracker_postread.user_id=%s where level>0 and misago_categories_category.id in (%s)order by level, short_name" %(uid,catlist)
            ##print(sql)
            cursor.execute(sql)
        else:
            cursor.execute("select False as read , misago_categories_category.id,name,slug,description,is_closed,threads,posts, short_name, level, color,parent_id from misago_categories_category where level>0 and misago_categories_category.id in (%s) order by level, short_name"%(catlist))
        res = dictfetchall(cursor)
        for one in res:
            if one["level"] == 1:
                menu[one["id"]] = make_entry(one)
            elif one["level"] == 2:
                menu[one["parent_id"]]["submenu"][one["id"]] = make_entry(one)
                sub_hash[one["id"]] = one["parent_id"]
            elif one["level"] == 3:
                parent_id = sub_hash[one["parent_id"]]
                menu[parent_id]["submenu"][one["parent_id"]]["submenu"][one["id"]] = make_entry(one)
        CT["dprevived"]["menu"] = menu
        """for (k,i) in menu.items():
            if i["read"]!=None: print(i["name"],i["read"])
            for (k2,i2) in i["submenu"].items():
                if i2["read"]!=None: print(i2["name"],i2["read"])
                for (k3,i3) in i["submenu"].items():
                    if i2["read"]!=None: print(i3["name"],i3["read"])"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR',"none")                    
    CT["dprevived"]["log"] = ip
    if (request.META.get("QUERY_STRING","").endswith("time")):
      CT["dprevived"]["Time"] = "%.08f"%(time.time() - start_time)
     
    return CT
    

