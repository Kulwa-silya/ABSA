from django.db import models
from django.contrib.auth.models import User

class Source(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)
    usage_count = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        # Convert name to uppercase before saving
        self.name = self.name.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Post(models.Model):
    caption = models.TextField()
    source = models.ForeignKey(Source, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')

    def __str__(self):
        return f"Post {self.id} from {self.source} by {self.user.username}"

class Comment(models.Model):
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    general_sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment {self.id} on {self.post}"

class Aspect(models.Model):
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ]

    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='aspects')
    aspect_name = models.CharField(max_length=100)
    aspect_text = models.TextField(blank=True)
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.aspect_name} - {self.sentiment}"
