from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, login_view, change_password_view

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('change-password/', change_password_view, name='change-password'),
    path('', include(router.urls)),
]
