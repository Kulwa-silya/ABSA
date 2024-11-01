# backend/qa_form/api/views.py
import json
import csv
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from ..models import Post, Comment, Aspect
from .serializers import PostSerializer, CommentSerializer, AspectSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="qa_data_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['post', 'comment', 'aspects_and_sentiments', 'general_sentiment'])
        
        posts = Post.objects.all().prefetch_related('comments', 'comments__aspects')
        
        for post in posts:
            for comment in post.comments.all():
                # Collect all aspects for this comment
                aspects_data = {
                    aspect.aspect_name: aspect.sentiment 
                    for aspect in comment.aspects.all()
                }
                
                writer.writerow([
                    post.caption,
                    comment.text,
                    json.dumps(aspects_data),  # Convert aspects dict to JSON string
                    comment.general_sentiment
                ])
        
        return response

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def get_queryset(self):
        queryset = Comment.objects.all()
        post_id = self.request.query_params.get('post', None)
        if post_id is not None:
            queryset = queryset.filter(post_id=post_id)
        return queryset

class AspectViewSet(viewsets.ModelViewSet):
    queryset = Aspect.objects.all()
    serializer_class = AspectSerializer

    def get_queryset(self):
        queryset = Aspect.objects.all()
        comment_id = self.request.query_params.get('comment', None)
        if comment_id is not None:
            queryset = queryset.filter(comment_id=comment_id)
        return queryset