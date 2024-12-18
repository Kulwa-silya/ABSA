# backend/qa_form/api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import datetime, timedelta
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.db import transaction
import json
import csv
from ..models import Post, Comment, Aspect, Source
from .serializers import PostSerializer, CommentSerializer, AspectSerializer, SourceSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(user=self.request.user)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Handle post verification status
        if instance.status == 'reviewed' and not request.user.is_staff:
            return Response(
                {"detail": "Cannot modify a reviewed post"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    @transaction.atomic
    def review(self, request, pk=None):
        post = self.get_object()

        if post.status == 'reviewed':
            return Response(
                {"detail": "Post is already reviewed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update post data if provided
        if request.data:
            serializer = self.get_serializer(
                post,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

        # Mark as reviewed
        post.status = 'reviewed'
        post.reviewed_by = request.user
        post.reviewed_at = timezone.now()
        post.save()

        return Response(self.get_serializer(post).data)

    @action(detail=False, methods=['GET'])
    def unreviewed(self, request):
        queryset = self.get_queryset().filter(status='unreviewed')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def reviewed(self, request):
        queryset = self.get_queryset().filter(status='reviewed')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="qa_data_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'post_id',
            'source',
            'caption',
            'comment',
            'aspects_and_sentiments',
            'general_sentiment',
            'collector',
            'created_at'
        ])

        posts = self.get_queryset().prefetch_related(
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
                    post.id,
                    post.source,
                    post.caption,
                    comment.text,
                    json.dumps(aspects_data),
                    comment.general_sentiment,
                    post.user.username,
                    post.created_at.strftime('%Y-%m-%d %H:%M:%S')
                ])

        return response

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        # Get user's posts
        user_posts = Post.objects.filter(user=request.user)

        # Get distinct sources for this user
        user_sources = (
            Source.objects
            .filter(post__user=request.user)
            .distinct()  # This ensures we only count each source once
        )

        # Get top sources with correct counts
        top_sources = (
            Source.objects
            .filter(post__user=request.user)
            .annotate(count=Count('post'))
            .order_by('-count')[:5]
            .values('name', 'count')
        )

        # Calculate date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=6)

        # Get daily post counts
        daily_counts = (
            user_posts
            .filter(created_at__date__gte=start_date)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        # Fill in missing dates
        date_counts = {
            (start_date + timedelta(days=i)): 0
            for i in range(7)
        }
        for entry in daily_counts:
            date_counts[entry['date']] = entry['count']

        return Response({
            'totalPosts': user_posts.count(),
            'totalComments': Comment.objects.filter(post__user=request.user).count(),
            'sourcesCount': user_sources.count(),
            'lastSevenDays': [
                {
                    'date': date.strftime('%Y-%m-%d'),
                    'count': count
                }
                for date, count in date_counts.items()
            ],
            'topSources': list(top_sources)
        })


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Comment.objects.filter(post__user=self.request.user)
        post_id = self.request.query_params.get('post', None)
        if post_id is not None:
            queryset = queryset.filter(post_id=post_id)
        return queryset


class AspectViewSet(viewsets.ModelViewSet):
    queryset = Aspect.objects.all()
    serializer_class = AspectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Aspect.objects.filter(comment__post__user=self.request.user)
        comment_id = self.request.query_params.get('comment', None)
        if comment_id is not None:
            queryset = queryset.filter(comment_id=comment_id)
        return queryset


class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '').upper()
        sources = Source.objects.filter(name__startswith=query).order_by('-usage_count')[:5]
        serializer = self.get_serializer(sources, many=True)
        return Response(serializer.data)
