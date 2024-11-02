# backend/qa_form/admin.py
from django.contrib import admin
from .models import Post, Comment, Aspect, Source

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

@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'usage_count', 'created_at', 'last_used']
    list_filter = ['created_at', 'last_used']
    search_fields = ['name']
    readonly_fields = ['usage_count', 'created_at', 'last_used']
    ordering = ['-usage_count', '-last_used']
