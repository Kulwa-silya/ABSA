from rest_framework import serializers
from django.contrib.auth.models import User
from ..models import Post, Comment, Aspect

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

class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, required=False)
    user = serializers.PrimaryKeyRelatedField(read_only=True)  # Add this line
    username = serializers.CharField(source='user.username', read_only=True)  # Optional: add this if you want to include username

    class Meta:
        model = Post
        fields = ['id', 'caption', 'source', 'created_at', 'comments', 'user', 'username']
        read_only_fields = ['user']  # Add this line to make it explicit

    def create(self, validated_data):
        comments_data = validated_data.pop('comments', [])
        post = Post.objects.create(**validated_data)

        for comment_data in comments_data:
            aspects_data = comment_data.pop('aspects', [])
            comment = Comment.objects.create(post=post, **comment_data)

            for aspect_data in aspects_data:
                Aspect.objects.create(comment=comment, **aspect_data)

        return post
