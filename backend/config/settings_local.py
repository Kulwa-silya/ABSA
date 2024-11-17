# backend/config/settings_local.py
import os
import sys
from .settings_base import *

# Development specific settings
DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "*"  # For development convenience
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",
]

# Development specific logging if needed
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    }
}
