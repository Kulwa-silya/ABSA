# backend/qa_form/admin.py
from django.contrib import admin
from .models import Post, Comment, Aspect

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'caption', 'created_at']
    search_fields = ['caption']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'text', 'general_sentiment', 'created_at']
    list_filter = ['general_sentiment', 'created_at']
    search_fields = ['text']

@admin.register(Aspect)
class AspectAdmin(admin.ModelAdmin):
    list_display = ['id', 'comment', 'aspect_name', 'sentiment']
    list_filter = ['sentiment']
    search_fields = ['aspect_name']