# docker/prod/config/settings_prod.py
#
import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../backend')))
from config.settings_base import *

# Debug should be False in production
DEBUG = False

# Update allowed hosts
ALLOWED_HOSTS = ['185.137.122.217']  # Add your domain when ready

# Update CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://185.137.122.217:3000",
]
CORS_ALLOW_CREDENTIALS = True


# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = []

# Security settings
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'


# Production logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': '/app/logs/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
        },
    }
}
