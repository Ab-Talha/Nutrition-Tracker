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


class PhysicalInfoSerializer(serializers.Serializer):
    """Serializer for physical information"""
    PhysicalInfoID = serializers.IntegerField(read_only=True)
    UserID = serializers.IntegerField(read_only=True)
    DOB = serializers.DateField()
    Gender = serializers.CharField()
    Height = serializers.DecimalField(max_digits=5, decimal_places=2)
    ActivityLevel = serializers.CharField()
    Goal = serializers.CharField()
    TargetWeight = serializers.DecimalField(max_digits=5, decimal_places=2)
    BodyFat = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    Lifestyle = serializers.CharField(allow_null=True)
    CurrentWeight = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)


class UserProfileSerializer(serializers.Serializer):
    """Serializer for combined user and physical info"""
    user = serializers.SerializerMethodField()
    physicalInfo = serializers.SerializerMethodField()
    bmi = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        return {
            'UserID': obj['user']['UserID'],
            'Name': obj['user']['Name'],
            'Username': obj['user']['Username'],
            'Email': obj['user']['Email']
        }
    
    def get_physicalInfo(self, obj):
        return obj['physicalInfo']
    
    def get_bmi(self, obj):
        """Calculate BMI from height and weight"""
        height = float(obj['physicalInfo'].get('Height', 0))
        weight = float(obj['physicalInfo'].get('CurrentWeight', 0))
        
        if height > 0 and weight > 0:
            height_m = height / 100
            bmi = weight / (height_m * height_m)
            return round(bmi, 1)
        return None