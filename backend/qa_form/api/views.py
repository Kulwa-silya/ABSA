from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
import json
import csv
from ..models import Post, Comment, Aspect
from .serializers import PostSerializer, CommentSerializer, AspectSerializer


class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    queryset = Post.objects.all()

    def get_queryset(self):
        return Post.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # This automatically sets the user

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="qa_data_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'post',
            'source',
            'comment',
            'aspects_and_sentiments',
            'general_sentiment',
            'collector',
            'created_at'  # Added this for better tracking
        ])

        posts = Post.objects.filter(user=request.user).prefetch_related(
            'comments',
            'comments__aspects'
        )

        for post in posts:
            for comment in post.comments.all():
                aspects_data = {
                    aspect.aspect_name: aspect.sentiment
                    for aspect in comment.aspects.all()
                }

                writer.writerow([
                    post.caption,
                    post.source,
                    comment.text,
                    json.dumps(aspects_data),
                    comment.general_sentiment,
                    post.user.username,
                    post.created_at.strftime('%Y-%m-%d %H:%M:%S')
                ])

        return response

class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()  # Add default queryset

    def get_queryset(self):
        queryset = Comment.objects.filter(post__user=self.request.user)
        post_id = self.request.query_params.get('post', None)
        if post_id is not None:
            queryset = queryset.filter(post_id=post_id)
        return queryset


class AspectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AspectSerializer
    queryset = Aspect.objects.all()  # Add default queryset

    def get_queryset(self):
        queryset = Aspect.objects.filter(comment__post__user=self.request.user)
        comment_id = self.request.query_params.get('comment', None)
        if comment_id is not None:
            queryset = queryset.filter(comment_id=comment_id)
        return queryset
