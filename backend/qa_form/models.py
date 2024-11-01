# backend/qa_form/models.py
from django.db import models

class Post(models.Model):
    caption = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post {self.id}"

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
    aspect_name = models.CharField(max_length=100)  # Free text field for aspect name
    aspect_text = models.TextField(blank=True)      # Optional field to store the specific text that indicates this aspect
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES)
    
    # Optional fields for additional analysis

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.aspect_name} - {self.sentiment}"