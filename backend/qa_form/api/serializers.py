# backend/qa_form/api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import Post, Comment, Aspect, Source
from django.db import models, transaction

class AspectSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Aspect
        fields = ['id', 'aspect_name', 'aspect_text', 'sentiment']

    def update(self, instance, validated_data):
        instance.aspect_name = validated_data.get('aspect_name', instance.aspect_name)
        instance.aspect_text = validated_data.get('aspect_text', instance.aspect_text)
        instance.sentiment = validated_data.get('sentiment', instance.sentiment)
        instance.save()
        return instance

class CommentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    aspects = AspectSerializer(many=True)

    class Meta:
        model = Comment
        fields = ['id', 'text', 'general_sentiment', 'created_at', 'aspects']

    def update(self, instance, validated_data):
        # Handle aspects update
        aspects_data = validated_data.pop('aspects', [])

        # Update comment fields
        instance.text = validated_data.get('text', instance.text)
        instance.general_sentiment = validated_data.get('general_sentiment', instance.general_sentiment)
        instance.save()

        # Track existing aspects
        existing_aspects = {aspect.id: aspect for aspect in instance.aspects.all()}

        # Process aspects
        updated_aspects = []
        for aspect_data in aspects_data:
            aspect_id = aspect_data.get('id')
            if aspect_id and aspect_id in existing_aspects:
                # Update existing aspect
                aspect = existing_aspects[aspect_id]
                AspectSerializer().update(aspect, aspect_data)
                updated_aspects.append(aspect.id)
            else:
                # Create new aspect
                aspect = Aspect.objects.create(comment=instance, **aspect_data)
                updated_aspects.append(aspect.id)

        # Remove aspects that weren't included in the update
        instance.aspects.exclude(id__in=updated_aspects).delete()

        return instance

class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ['id', 'name', 'usage_count']
        read_only_fields = ['usage_count']

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)
    source = serializers.CharField()
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True)
    reviewed_by = serializers.PrimaryKeyRelatedField(read_only=True)
    reviewed_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'caption', 'source', 'created_at', 'comments', 'user',
                 'username', 'status', 'reviewed_by', 'reviewed_at']
        read_only_fields = ['user', 'username']

    def get_username(self, obj):
        return obj.user.username if obj.user else None

    @transaction.atomic
    def update(self, instance, validated_data):
        # Handle comments update
        comments_data = validated_data.pop('comments', [])

        # Update source if provided
        if 'source' in validated_data:
            source_name = validated_data.pop('source').upper()
            source, created = Source.objects.get_or_create(name=source_name)
            if not created:
                source.usage_count = models.F('usage_count') + 1
                source.save()
            instance.source = source

        # Update other post fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Track existing comments
        existing_comments = {comment.id: comment for comment in instance.comments.all()}

        # Process comments
        updated_comments = []
        for comment_data in comments_data:
            comment_id = comment_data.get('id')
            if comment_id and comment_id in existing_comments:
                # Update existing comment
                comment = existing_comments[comment_id]
                CommentSerializer().update(comment, comment_data)
                updated_comments.append(comment.id)
            else:
                # Create new comment
                comment_data['post'] = instance
                comment = Comment.objects.create(**{k: v for k, v in comment_data.items()
                                                  if k != 'aspects'})
                # Handle aspects for new comment
                for aspect_data in comment_data.get('aspects', []):
                    Aspect.objects.create(comment=comment, **aspect_data)
                updated_comments.append(comment.id)

        # Remove comments that weren't included in the update
        instance.comments.exclude(id__in=updated_comments).delete()

        return instance
