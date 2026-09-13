from django.apps import AppConfig


class MisagoUsersOnlinePlugin(AppConfig):
    name = "dprevived_plugin"

    def ready(self):
        pass  # We will use the ready method soon!