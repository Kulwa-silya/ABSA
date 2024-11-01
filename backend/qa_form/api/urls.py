# backend/qa_form/api/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import PostViewSet, CommentViewSet, AspectViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'aspects', AspectViewSet)

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
]