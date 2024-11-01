# backend/qa_form/apps.py
from django.apps import AppConfig

class QAFormConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'qa_form'
    verbose_name = 'Social Media QA Form'