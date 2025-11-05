# users/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from django.db import connection
import hashlib
import logging
from django.contrib.auth.hashers import check_password
import re

logger = logging.getLogger(__name__)


class DatabaseHelper:
    """Helper class for database operations"""
    
    @staticmethod
    def execute_query(query, params=None, fetch_one=False):
        """Execute SELECT query"""
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params or ())
                if fetch_one:
                    result = cursor.fetchone()
                    if result:
                        columns = [col[0] for col in cursor.description]
                        return dict(zip(columns, result))
                    return None
                
                results = cursor.fetchall()
                if results:
                    columns = [col[0] for col in cursor.description]
                    return [dict(zip(columns, row)) for row in results]
                return []
        except Exception as e:
            logger.error(f"Query error: {e}")
            return None if fetch_one else []
    
    @staticmethod
    def execute_update(query, params=None):
        """Execute INSERT, UPDATE, DELETE"""
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.rowcount
        except Exception as e:
            logger.error(f"Update error: {e}")
            return 0

    
    @staticmethod
    def execute_insert(query, params=None):
        """Execute INSERT and return last ID"""
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.lastrowid
        except Exception as e:
            logger.error(f"Insert error: {e}")
            return None


from django.contrib.auth.hashers import make_password, check_password
import hashlib

class LoginView(APIView):
    """Handle user login"""
    
    def post(self, request):
        try:
            username = request.data.get('username', '').strip()
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '').strip()
            
            if not password:
                return Response({
                    'success': False,
                    'message': 'Password is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Find user by username or email
            if username:
                query = """
                    SELECT UserID, Username, Email, Name, PasswordHash 
                    FROM userdetails 
                    WHERE Username = %s
                """
                user_data = DatabaseHelper.execute_query(query, (username,), fetch_one=True)
            elif email:
                query = """
                    SELECT UserID, Username, Email, Name, PasswordHash 
                    FROM userdetails 
                    WHERE Email = %s
                """
                user_data = DatabaseHelper.execute_query(query, (email,), fetch_one=True)
            else:
                return Response({
                    'success': False,
                    'message': 'Username or email is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not user_data:
                return Response({
                    'success': False,
                    'message': 'Invalid username or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # SHA256 hashing (matches your registration)
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            if password_hash == user_data['PasswordHash']:
                # Update last login
                update_query = "UPDATE userdetails SET LastLogin = NOW() WHERE UserID = %s"
                DatabaseHelper.execute_update(update_query, (user_data['UserID'],))
                
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'data': {
                        'UserID': user_data['UserID'],
                        'Username': user_data['Username'],
                        'Email': user_data['Email'],
                        'Name': user_data['Name']
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid username or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            logger.error(f"Login error: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterView(APIView):
    """Handle user registration"""
    
    def post(self, request):
        try:
            username = request.data.get('username', '').strip()
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '').strip()
            name = request.data.get('name', '').strip()
            
            # Validate inputs
            if not all([username, email, password, name]):
                return Response({
                    'success': False,
                    'message': 'All fields are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if len(password) < 6:
                return Response({
                    'success': False,
                    'message': 'Password must be at least 6 characters'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user exists
            check_query = """
                SELECT UserID FROM userdetails 
                WHERE Username = %s OR Email = %s
            """
            existing_user = DatabaseHelper.execute_query(check_query, (username, email), fetch_one=True)
            
            if existing_user:
                return Response({
                    'success': False,
                    'message': 'Username or email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Hash password with SHA256
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Create user
            insert_query = """
                INSERT INTO userdetails (Username, Email, Name, PasswordHash, CreatedAt, UpdatedAt)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
            """
            user_id = DatabaseHelper.execute_insert(insert_query, (username, email, name, password_hash))
            
            if user_id:
                return Response({
                    'success': True,
                    'message': 'User registered successfully',
                    'data': {
                        'UserID': user_id,
                        'Username': username,
                        'Email': email,
                        'Name': name
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to create user'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            logger.error(f"Register error: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDetailView(APIView):
    """Get user profile details"""
    
    def get(self, request, user_id):
        try:
            query = """
                SELECT UserID, Username, Email, Name, ProfilePicture, CreatedAt 
                FROM userdetails 
                WHERE UserID = %s
            """
            user_data = DatabaseHelper.execute_query(query, (user_id,), fetch_one=True)
            
            if not user_data:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'data': user_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching user: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CheckUsernameView(APIView):
    """Check if username is available"""
    
    def post(self, request):
        try:
            username = request.data.get('username', '').strip()
            
            if not username:
                return Response({
                    'success': False,
                    'available': False,
                    'message': 'Username is required'
                }, status=status.HTTP_200_OK)
            
            if len(username) < 3:
                return Response({
                    'success': False,
                    'available': False,
                    'message': 'Username must be at least 3 characters'
                }, status=status.HTTP_200_OK)
            
            if len(username) > 50:
                return Response({
                    'success': False,
                    'available': False,
                    'message': 'Username must be less than 50 characters'
                }, status=status.HTTP_200_OK)
            
            # Check if username contains only alphanumeric, underscore, and hyphen
            if not re.match(r'^[a-zA-Z0-9_-]+$', username):
                return Response({
                    'success': False,
                    'available': False,
                    'message': 'Username can only contain letters, numbers, underscores, and hyphens'
                }, status=status.HTTP_200_OK)
            
            # Check if username exists in database (case-insensitive)
            query = "SELECT UserID FROM userdetails WHERE LOWER(Username) = LOWER(%s) LIMIT 1"
            with connection.cursor() as cursor:
                cursor.execute(query, (username,))
                result = cursor.fetchone()
            
            if result:
                return Response({
                    'success': True,
                    'available': False,
                    'message': 'Username already taken'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': True,
                    'available': True,
                    'message': 'Username available'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Username check error: {e}")
            return Response({
                'success': False,
                'available': None,
                'message': 'Error checking username'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CheckEmailView(APIView):
    """Check if email is available"""
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip()
            
            if not email:
                return Response({
                    'success': False,
                    'valid': False,
                    'available': False,
                    'message': 'Email is required'
                }, status=status.HTTP_200_OK)
            
            # Proper email validation regex
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            
            if not re.match(email_regex, email):
                return Response({
                    'success': True,
                    'valid': False,
                    'available': False,
                    'message': 'Invalid email format'
                }, status=status.HTTP_200_OK)
            
            if len(email) > 100:
                return Response({
                    'success': True,
                    'valid': False,
                    'available': False,
                    'message': 'Email is too long'
                }, status=status.HTTP_200_OK)
            
            # Check if email exists in database (case-insensitive)
            query = "SELECT UserID FROM userdetails WHERE LOWER(Email) = LOWER(%s) LIMIT 1"
            with connection.cursor() as cursor:
                cursor.execute(query, (email,))
                result = cursor.fetchone()
            
            if result:
                return Response({
                    'success': True,
                    'valid': True,
                    'available': False,
                    'message': 'Email already registered'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': True,
                    'valid': True,
                    'available': True,
                    'message': 'Email available'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Email check error: {e}")
            return Response({
                'success': False,
                'valid': None,
                'available': None,
                'message': 'Error checking email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)