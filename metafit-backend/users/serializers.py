# users/serializers.py

from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """Serializer for login"""
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        if not data.get('username') and not data.get('email'):
            raise serializers.ValidationError("Username or email is required")
        return data


class RegisterSerializer(serializers.Serializer):
    """Serializer for registration"""
    name = serializers.CharField(max_length=100, required=True)
    username = serializers.CharField(max_length=50, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(min_length=6, write_only=True)
    
    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters")
        return value


class UserDetailSerializer(serializers.Serializer):
    """Serializer for user details"""
    UserID = serializers.IntegerField(read_only=True)
    Username = serializers.CharField()
    Email = serializers.EmailField()
    Name = serializers.CharField()
    ProfilePicture = serializers.CharField(allow_null=True)
    CreatedAt = serializers.DateTimeField(read_only=True)