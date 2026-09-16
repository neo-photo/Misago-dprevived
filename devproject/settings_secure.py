# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    "default": {
        # Misago requires PostgreSQL to run
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "xxx",
        "USER": "xxx",
        "PASSWORD": "xxx",
        "HOST": "127.0.0.1",
        "PORT": 5432,
    }
}
# If either of these settings is empty, Django won't attempt authentication.

EMAIL_HOST_USER = ""
EMAIL_HOST_PASSWORD = ""

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "xxx"
