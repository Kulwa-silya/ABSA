# backend/config/settings.py
import os
from pathlib import Path

# Determine environment
ENV = os.getenv('DJANGO_ENV', 'development')

if ENV == 'production':
    from .settings_prod import *
else:
    try:
        from .settings_local import *
    except ImportError:
        from .settings_base import *
