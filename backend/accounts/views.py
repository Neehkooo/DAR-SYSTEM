from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        try:
            from documents.models import ActivityLog
            actor = self.request.headers.get('X-User', 'System')
            display_name = f'{instance.first_name} {instance.last_name}'.strip() or instance.username
            role = self.request.data.get('role', 'Employee')
            ActivityLog.objects.create(
                user=actor,
                action='CREATE',
                description=f'Created user account for {display_name} with role {role}'
            )
        except Exception:
            pass

    def perform_destroy(self, instance):
        try:
            from documents.models import ActivityLog
            actor = self.request.headers.get('X-User', 'System')
            display_name = f'{instance.first_name} {instance.last_name}'.strip() or instance.username
            ActivityLog.objects.create(
                user=actor,
                action='DELETE',
                description=f'Deleted user account: {display_name}'
            )
        except Exception:
            pass
        instance.delete()

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a user account (prevent login)."""
        user = self.get_object()
        try:
            user.is_active = False
            user.save()
            
            # Log the activity
            try:
                from documents.models import ActivityLog
                actor = request.headers.get('X-User', 'System')
                display_name = f'{user.first_name} {user.last_name}'.strip() or user.username
                ActivityLog.objects.create(
                    user=actor,
                    action='UPDATE',
                    description=f'Archived user account: {display_name}'
                )
            except Exception:
                pass
            
            serializer = self.get_serializer(user)
            return Response({'message': 'User archived successfully', 'user': serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to archive user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if user is not None:
        if user.is_active:
            # Write activity log
            try:
                from documents.models import ActivityLog
                display_name = f'{user.first_name} {user.last_name}'.strip() or user.username
                ActivityLog.objects.create(
                    user=display_name,
                    action='LOGIN',
                    description=f'{display_name} logged in to the system'
                )
            except Exception:
                pass  # Never break login just because logging failed

            serializer = UserSerializer(user)
            return Response(serializer.data)
        else:
            return Response({'error': 'This account is inactive'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
@api_view(['POST'])
def change_password_view(request):
    """Change the password for the authenticated user."""
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not current_password or not new_password:
        return Response({'error': 'Please provide both current and new password'}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({'error': 'New password must be at least 6 characters long'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Try to find user by X-User header (frontend sends this)
        user_header = request.headers.get('X-User')
        if user_header:
            # Try to find user by name first
            name_parts = user_header.split()
            if len(name_parts) >= 2:
                user = User.objects.filter(first_name=name_parts[0], last_name=name_parts[-1], is_active=True).first()
            elif len(name_parts) == 1:
                user = User.objects.filter(username=name_parts[0], is_active=True).first()
            else:
                user = None
        else:
            user = None

        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Verify current password
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_401_UNAUTHORIZED)

        # Set new password
        user.set_password(new_password)
        user.save()

        # Log the activity
        try:
            from documents.models import ActivityLog
            actor = request.headers.get('X-User', 'System')
            ActivityLog.objects.create(
                user=actor,
                action='UPDATE',
                description=f'{actor} changed their password'
            )
        except Exception:
            pass

        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

