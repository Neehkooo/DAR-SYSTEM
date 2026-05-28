from django.contrib.auth.models import User, Group
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password', 'role', 'is_active')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def get_role(self, obj):
        if obj.groups.filter(name='Admin').exists():
            return 'Admin'
        if obj.groups.filter(name='Employee').exists():
            return 'Employee'
        return 'User'

    def create(self, validated_data):
        role = self.context['request'].data.get('role', 'Employee')
        password = validated_data.pop('password', 'password123')
        # We assume username is email if not provided, or provided from frontend
        username = validated_data.get('username')
        if not username:
            validated_data['username'] = validated_data.get('email', f"user_{User.objects.count()}")
            
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)
        
        if role == 'Admin':
            user.is_staff = True
            user.is_superuser = True
            user.save()
            
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
            
        role = self.context['request'].data.get('role')
        if role:
            instance.groups.clear()
            group, _ = Group.objects.get_or_create(name=role)
            instance.groups.add(group)
            
            if role == 'Admin':
                instance.is_staff = True
                instance.is_superuser = True
            else:
                instance.is_staff = False
                instance.is_superuser = False
        
        return super().update(instance, validated_data)
