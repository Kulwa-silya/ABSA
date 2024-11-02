# backend/qa_form/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, AspectViewSet, SourceViewSet
# from .auth import login_view, logout_view, user_view, get_csrf_token

router = DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'aspects', AspectViewSet)
router.register(r'sources', SourceViewSet)

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
]
