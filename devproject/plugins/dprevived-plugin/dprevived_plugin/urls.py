from django.urls import path
import dprevived_plugin.api.dprevived as dprevived

app_name = "dprevived_plugin"

urlpatterns = [
    path("api/mark-read-thread/<int:thread_pk>/",dprevived.mark_thread_read),
    path("api/mark-read-category/<int:category_pk>/",dprevived.mark_category_read),
    path("api/check-free-space/",dprevived.check_free_space),
    path("api/set-post-limit/<int:post_limit>/",dprevived.set_post_limit)
]