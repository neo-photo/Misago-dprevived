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
# Email configuration
# https://docs.djangoproject.com/en/1.11/ref/settings/#email-backend

MAILERS = {
    "default": {
        "BACKEND": "django.core.mail.backends.smtp.EmailBackend",
        "OPTIONS": {
            "host": "localhost",
            "username": "",
            "password":""
        },	
    },
}

#MAILERS["default"]["OPTIONS"]["username"] = ""
#MAILERS["default"]["OPTIONS"]["password"] = ""

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "xxx"
