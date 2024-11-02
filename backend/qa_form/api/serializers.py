from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import Post, Comment, Aspect, Source
from django.db import models

class AspectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aspect
        fields = ['id', 'aspect_name', 'aspect_text', 'sentiment']

class CommentSerializer(serializers.ModelSerializer):
    aspects = AspectSerializer(many=True, required=False)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'general_sentiment', 'created_at', 'aspects']

    def create(self, validated_data):
        aspects_data = validated_data.pop('aspects', [])
        comment = Comment.objects.create(**validated_data)

        for aspect_data in aspects_data:
            Aspect.objects.create(comment=comment, **aspect_data)

        return comment

class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ['id', 'name', 'usage_count']
        read_only_fields = ['usage_count']

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, required=False)
    source = serializers.CharField()  # We'll handle source creation/lookup in create method
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.SerializerMethodField()  # Add this line

    class Meta:
        model = Post
        fields = ['id', 'caption', 'source', 'created_at', 'comments', 'user', 'username']
        read_only_fields = ['user', 'username']

    def get_username(self, obj):  # Add this method
        return obj.user.username if obj.user else None

    def create(self, validated_data):
        source_name = validated_data.pop('source').upper()
        comments_data = validated_data.pop('comments', [])

        # Get or create source
        source, created = Source.objects.get_or_create(name=source_name)
        if not created:
            # Update usage count and last_used (auto_now handles last_used)
            source.usage_count = models.F('usage_count') + 1
            source.save()

        # Create post with source
        post = Post.objects.create(source=source, **validated_data)

        # Create comments and aspects
        for comment_data in comments_data:
            aspects_data = comment_data.pop('aspects', [])
            comment = Comment.objects.create(post=post, **comment_data)

            for aspect_data in aspects_data:
                Aspect.objects.create(comment=comment, **aspect_data)

        return post
