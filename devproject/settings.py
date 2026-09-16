from split_settings.tools import optional, include
import os

from misago import discover_plugins
from misago.settings import *


include(
    'settings_secure.py',
    'settings_base.py',
    optional('settings_local.py')
)

