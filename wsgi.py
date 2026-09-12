"""
WSGI config for devproject project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "devproject.settings")
os.environ.setdefault("POSTGRES_HOST","127.0.0.1")
os.environ.setdefault("POSTGRES_USER","dprdevel")
os.environ.setdefault("POSTGRES_DB","dprdevelxxx")
os.environ.setdefault("POSTGRES_PASSWORD","xxx")

application = get_wsgi_application()