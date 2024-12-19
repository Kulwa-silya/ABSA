# backend/qa_form/admin.py
from django.contrib import admin
from .models import Post, Comment, Aspect, Source

class AspectInline(admin.TabularInline):  # or use StackedInline for more detailed view
    model = Aspect
    extra = 1  # Number of empty forms to display
    fields = ['aspect_name', 'sentiment']

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1
    fields = ['text', 'general_sentiment']
    show_change_link = True  # Allows clicking through to the comment detail page

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'source', 'caption', 'comment_count', 'created_at']
    list_filter = ['source', 'created_at']
    search_fields = ['caption']
    inlines = [CommentInline]

    def comment_count(self, obj):
        return obj.comments.count()
    comment_count.short_description = 'Comments'

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'truncated_text', 'post_link', 'aspect_count', 'general_sentiment', 'created_at']
    list_filter = ['general_sentiment', 'created_at', 'post__source']
    search_fields = ['text', 'post__caption']
    inlines = [AspectInline]

    def truncated_text(self, obj):
        return obj.text[:100] + '...' if len(obj.text) > 100 else obj.text
    truncated_text.short_description = 'Comment Text'

    def post_link(self, obj):
        from django.utils.html import format_html
        return format_html('<a href="{}">{}</a>',
            f'/admin/qa_form/post/{obj.post.id}/change/',
            f'Post #{obj.post.id}: {obj.post.caption[:50]}...'
        )
    post_link.short_description = 'Post'

    def aspect_count(self, obj):
        return obj.aspects.count()
    aspect_count.short_description = 'Aspects'

@admin.register(Aspect)
class AspectAdmin(admin.ModelAdmin):
    list_display = ['id', 'aspect_name', 'comment_link', 'post_link', 'sentiment']
    list_filter = ['sentiment', 'comment__general_sentiment']
    search_fields = ['aspect_name', 'comment__text', 'comment__post__caption']

    def comment_link(self, obj):
        from django.utils.html import format_html
        return format_html('<a href="{}">{}</a>',
            f'/admin/qa_form/comment/{obj.comment.id}/change/',
            f'Comment #{obj.comment.id}'
        )
    comment_link.short_description = 'Comment'

    def post_link(self, obj):
        from django.utils.html import format_html
        return format_html('<a href="{}">{}</a>',
            f'/admin/qa_form/post/{obj.comment.post.id}/change/',
            f'Post #{obj.comment.post.id}'
        )
    post_link.short_description = 'Post'

@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'usage_count', 'created_at', 'last_used']
    list_filter = ['created_at', 'last_used']
    search_fields = ['name']
    readonly_fields = ['usage_count', 'created_at', 'last_used']
    ordering = ['-usage_count', '-last_used']
