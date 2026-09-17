
DATABASES["default"]["NAME"] = "misago392"
DATABASES["default"]["USER"] = "spirito"
DATABASES["default"]["PASSWORD"] = "spirito"
    
MEDIA_ROOT = os.path.join(BASE_DIR, "../../media")

LOGGING["handlers"]["file"]["filename"] = "../general.log"
LOGGING["loggers"]["django"]["level"] = "DEBUG"
# LOGLEVEL: DEBUG INFO WARNING ERROR CRITICAL
