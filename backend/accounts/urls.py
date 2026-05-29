from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, login_view, change_password_view, debug_users

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('change-password/', change_password_view, name='change-password'),
    path('debug/users/', debug_users, name='debug_users'),
    path('', include(router.urls)),
]
