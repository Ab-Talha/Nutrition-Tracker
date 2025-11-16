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
    """Handle user registration with complete profile data"""
    
    def post(self, request):
        try:
            # ========== EXTRACT ALL FIELDS FROM REQUEST ==========
            username = request.data.get('username', '').strip()
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '').strip()
            name = request.data.get('name', '').strip()
            
            # Physical info fields
            dob = request.data.get('dob', '').strip()
            gender = request.data.get('gender', '').strip()
            height = request.data.get('height')
            weight = request.data.get('weight')
            goal = request.data.get('goal', '').strip()
            activity_level = request.data.get('activityLevel', '').strip()
            
            # ========== VALIDATE BASIC FIELDS ==========
            if not all([username, email, password, name]):
                return Response({
                    'success': False,
                    'message': 'Basic fields required: username, email, password, name'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate password length
            if len(password) < 6:
                return Response({
                    'success': False,
                    'message': 'Password must be at least 6 characters'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # ========== VALIDATE PHYSICAL INFO FIELDS ==========
            if not all([dob, gender, height, weight, goal, activity_level]):
                return Response({
                    'success': False,
                    'message': 'Physical info required: dob, gender, height, weight, goal, activityLevel'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate height range (2-8 feet)
            try:
                height_float = float(height)
                if height_float < 2 or height_float > 8:
                    return Response({
                        'success': False,
                        'message': 'Height must be between 2 and 8 feet'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({
                    'success': False,
                    'message': 'Height must be a valid number'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate weight range (30-300 kg)
            try:
                weight_float = float(weight)
                if weight_float < 30 or weight_float > 300:
                    return Response({
                        'success': False,
                        'message': 'Weight must be between 30 and 300 kg'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({
                    'success': False,
                    'message': 'Weight must be a valid number'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate gender
            valid_genders = ['Male', 'Female', 'Other']
            if gender not in valid_genders:
                return Response({
                    'success': False,
                    'message': f'Gender must be one of: {", ".join(valid_genders)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate goal
            valid_goals = ['Weight Gain', 'Weight Loss', 'Maintain Weight', 'Muscle Gain']
            if goal not in valid_goals:
                return Response({
                    'success': False,
                    'message': f'Goal must be one of: {", ".join(valid_goals)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate activity level
            valid_activity_levels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active']
            if activity_level not in valid_activity_levels:
                return Response({
                    'success': False,
                    'message': f'Activity level must be one of: {", ".join(valid_activity_levels)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # ========== CHECK IF USER ALREADY EXISTS ==========
            check_query = """
                SELECT UserID FROM userdetails 
                WHERE LOWER(Username) = LOWER(%s) OR LOWER(Email) = LOWER(%s)
            """
            with connection.cursor() as cursor:
                cursor.execute(check_query, (username, email))
                result = cursor.fetchone()
            
            if result:
                return Response({
                    'success': False,
                    'message': 'Username or email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # ========== HASH PASSWORD ==========
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # ========== BEGIN TRANSACTION: INSERT USER DATA ==========
            try:
                with connection.cursor() as cursor:
                    # Step 1: Insert into userdetails
                    insert_user_query = """
                        INSERT INTO userdetails 
                        (Username, Email, Name, PasswordHash, CreatedAt, UpdatedAt)
                        VALUES (%s, %s, %s, %s, NOW(), NOW())
                    """
                    cursor.execute(insert_user_query, (username, email, name, password_hash))
                    user_id = cursor.lastrowid
                    
                    # Step 2: Insert into userphysicalinfo
                    insert_physical_query = """
                        INSERT INTO userphysicalinfo 
                        (UserID, DOB, Gender, Height, ActivityLevel, Goal, TargetWeight)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(insert_physical_query, (
                        user_id,
                        dob,
                        gender,
                        height_float,
                        activity_level,
                        goal,
                        weight_float  # Initial weight as target for now
                    ))
                    physical_info_id = cursor.lastrowid
                    
                    # Step 3: Insert into userweight (track initial weight)
                    insert_weight_query = """
                        INSERT INTO userweight 
                        (UserID, DateTime, Weight, Notes)
                        VALUES (%s, NOW(), %s, %s)
                    """
                    cursor.execute(insert_weight_query, (
                        user_id,
                        weight_float,
                        'Initial weight entry during signup'
                    ))
                    
                    # Commit is automatic with connection.cursor() context manager
                
                # ========== FETCH COMPLETE DATA ==========
                fetch_query = """
                    SELECT 
                        ud.UserID,
                        ud.Username,
                        ud.Email,
                        ud.Name,
                        upi.PhysicalInfoID,
                        upi.DOB,
                        upi.Gender,
                        upi.Height,
                        upi.ActivityLevel,
                        upi.Goal,
                        upi.TargetWeight
                    FROM userdetails ud
                    JOIN userphysicalinfo upi ON ud.UserID = upi.UserID
                    WHERE ud.UserID = %s
                """
                
                with connection.cursor() as cursor:
                    cursor.execute(fetch_query, (user_id,))
                    result = cursor.fetchone()
                    
                    if result:
                        columns = [col[0] for col in cursor.description]
                        user_data = dict(zip(columns, result))
                    else:
                        user_data = None
                
                return Response({
                    'success': True,
                    'message': 'User registered successfully',
                    'data': {
                        'UserID': user_data['UserID'],
                        'Username': user_data['Username'],
                        'Email': user_data['Email'],
                        'Name': user_data['Name'],
                        'DOB': str(user_data['DOB']),
                        'Gender': user_data['Gender'],
                        'Height': float(user_data['Height']),
                        'ActivityLevel': user_data['ActivityLevel'],
                        'Goal': user_data['Goal'],
                        'CurrentWeight': float(weight_float),
                        'PhysicalInfoID': user_data['PhysicalInfoID']
                    }
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.error(f"Transaction error during registration: {e}")
                return Response({
                    'success': False,
                    'message': 'Failed to create user account',
                    'error': str(e)
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
            
            if len(username) < 2:
                return Response({
                    'success': False,
                    'available': False,
                    'message': 'Username must be at least 2 characters'
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
        
# Add at the end of users/views.py

# users/views.py - Physical Info Views (Corrected for proper table structure)

class PhysicalInfoView(APIView):
    """Handle physical information retrieval and updates"""
    
    def get(self, request, user_id):
        """Get physical info for user with latest weight"""
        try:
            # Get physical info from userphysicalinfo table
            query = """
                SELECT PhysicalInfoID, UserID, DOB, Gender, Height, 
                       ActivityLevel, Goal, TargetWeight, BodyFat, Lifestyle
                FROM userphysicalinfo
                WHERE UserID = %s
            """
            physical_info = DatabaseHelper.execute_query(query, (user_id,), fetch_one=True)
            
            if not physical_info:
                return Response({
                    'success': False,
                    'message': 'Physical information not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get latest weight from userweight table
            weight_query = """
                SELECT Weight, DateTime, Notes
                FROM userweight
                WHERE UserID = %s
                ORDER BY DateTime DESC
                LIMIT 1
            """
            latest_weight = DatabaseHelper.execute_query(weight_query, (user_id,), fetch_one=True)
            
            # Format response with proper type conversions
            response_data = {
                'PhysicalInfoID': physical_info['PhysicalInfoID'],
                'UserID': physical_info['UserID'],
                'DOB': str(physical_info['DOB']) if physical_info.get('DOB') else None,
                'Gender': physical_info['Gender'],
                'Height': float(physical_info['Height']) if physical_info.get('Height') else None,
                'CurrentWeight': float(latest_weight['Weight']) if latest_weight and latest_weight.get('Weight') else None,
                'WeightLastUpdated': str(latest_weight['DateTime']) if latest_weight and latest_weight.get('DateTime') else None,
                'TargetWeight': float(physical_info['TargetWeight']) if physical_info.get('TargetWeight') else None,
                'ActivityLevel': physical_info['ActivityLevel'],
                'Goal': physical_info['Goal'],
                'BodyFat': float(physical_info['BodyFat']) if physical_info.get('BodyFat') else None,
                'Lifestyle': physical_info.get('Lifestyle')
            }
            
            return Response({
                'success': True,
                'data': response_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching physical info: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, user_id):
        """Update physical information"""
        try:
            # Check if physical info exists
            check_query = "SELECT PhysicalInfoID FROM userphysicalinfo WHERE UserID = %s"
            existing = DatabaseHelper.execute_query(check_query, (user_id,), fetch_one=True)
            
            if not existing:
                return Response({
                    'success': False,
                    'message': 'Physical information not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Prepare update fields for userphysicalinfo table
            update_fields = []
            params = []
            
            if 'DOB' in request.data:
                update_fields.append("DOB = %s")
                params.append(request.data['DOB'])
            
            if 'Gender' in request.data:
                update_fields.append("Gender = %s")
                params.append(request.data['Gender'])
            
            if 'Height' in request.data:
                update_fields.append("Height = %s")
                params.append(request.data['Height'])
            
            if 'TargetWeight' in request.data:
                update_fields.append("TargetWeight = %s")
                params.append(request.data['TargetWeight'])
            
            if 'BodyFat' in request.data:
                update_fields.append("BodyFat = %s")
                params.append(request.data['BodyFat'])
            
            if 'ActivityLevel' in request.data:
                update_fields.append("ActivityLevel = %s")
                params.append(request.data['ActivityLevel'])
            
            if 'Goal' in request.data:
                update_fields.append("Goal = %s")
                params.append(request.data['Goal'])
            
            if 'Lifestyle' in request.data:
                update_fields.append("Lifestyle = %s")
                params.append(request.data['Lifestyle'])
            
            # Update physical info if there are fields to update
            if update_fields:
                params.append(user_id)
                update_query = f"""
                    UPDATE userphysicalinfo
                    SET {', '.join(update_fields)}
                    WHERE UserID = %s
                """
                DatabaseHelper.execute_update(update_query, params)
            
            # Handle CurrentWeight separately - insert into userweight table
            if 'CurrentWeight' in request.data:
                weight_insert_query = """
                    INSERT INTO userweight (UserID, DateTime, Weight, Notes)
                    VALUES (%s, NOW(), %s, %s)
                """
                notes = request.data.get('WeightNotes', 'Updated via API')
                DatabaseHelper.execute_insert(weight_insert_query, (user_id, request.data['CurrentWeight'], notes))
            
            if not update_fields and 'CurrentWeight' not in request.data:
                return Response({
                    'success': False,
                    'message': 'No fields to update'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Fetch updated data
            fetch_query = """
                SELECT PhysicalInfoID, UserID, DOB, Gender, Height, 
                       ActivityLevel, Goal, TargetWeight, BodyFat, Lifestyle
                FROM userphysicalinfo
                WHERE UserID = %s
            """
            updated_info = DatabaseHelper.execute_query(fetch_query, (user_id,), fetch_one=True)
            
            # Get latest weight
            weight_query = """
                SELECT Weight, DateTime, Notes
                FROM userweight
                WHERE UserID = %s
                ORDER BY DateTime DESC
                LIMIT 1
            """
            latest_weight = DatabaseHelper.execute_query(weight_query, (user_id,), fetch_one=True)
            
            # Format response
            response_data = {
                'PhysicalInfoID': updated_info['PhysicalInfoID'],
                'UserID': updated_info['UserID'],
                'DOB': str(updated_info['DOB']) if updated_info.get('DOB') else None,
                'Gender': updated_info['Gender'],
                'Height': float(updated_info['Height']) if updated_info.get('Height') else None,
                'CurrentWeight': float(latest_weight['Weight']) if latest_weight and latest_weight.get('Weight') else None,
                'WeightLastUpdated': str(latest_weight['DateTime']) if latest_weight and latest_weight.get('DateTime') else None,
                'TargetWeight': float(updated_info['TargetWeight']) if updated_info.get('TargetWeight') else None,
                'ActivityLevel': updated_info['ActivityLevel'],
                'Goal': updated_info['Goal'],
                'BodyFat': float(updated_info['BodyFat']) if updated_info.get('BodyFat') else None,
                'Lifestyle': updated_info.get('Lifestyle')
            }
            
            return Response({
                'success': True,
                'message': 'Physical information updated',
                'data': response_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error updating physical info: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, user_id):
        """Create physical information for user"""
        try:
            # Check if user exists
            user_query = "SELECT UserID FROM userdetails WHERE UserID = %s"
            user_exists = DatabaseHelper.execute_query(user_query, (user_id,), fetch_one=True)
            
            if not user_exists:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if physical info already exists
            check_query = "SELECT PhysicalInfoID FROM userphysicalinfo WHERE UserID = %s"
            existing = DatabaseHelper.execute_query(check_query, (user_id,), fetch_one=True)
            
            if existing:
                return Response({
                    'success': False,
                    'message': 'Physical information already exists for this user'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate required fields
            required_fields = ['DOB', 'Gender', 'Height', 'ActivityLevel', 'Goal', 'TargetWeight']
            missing_fields = [field for field in required_fields if field not in request.data]
            
            if missing_fields:
                return Response({
                    'success': False,
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Insert physical info into userphysicalinfo table
            insert_query = """
                INSERT INTO userphysicalinfo 
                (UserID, DOB, Gender, Height, ActivityLevel, Goal, TargetWeight, BodyFat, Lifestyle)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            params = (
                user_id,
                request.data['DOB'],
                request.data['Gender'],
                request.data['Height'],
                request.data['ActivityLevel'],
                request.data['Goal'],
                request.data['TargetWeight'],
                request.data.get('BodyFat'),
                request.data.get('Lifestyle')
            )
            
            physical_info_id = DatabaseHelper.execute_insert(insert_query, params)
            
            if not physical_info_id:
                return Response({
                    'success': False,
                    'message': 'Failed to create physical information'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Insert initial weight if provided
            if 'CurrentWeight' in request.data:
                weight_insert_query = """
                    INSERT INTO userweight (UserID, DateTime, Weight, Notes)
                    VALUES (%s, NOW(), %s, %s)
                """
                notes = request.data.get('WeightNotes', 'Initial weight entry')
                DatabaseHelper.execute_insert(weight_insert_query, (user_id, request.data['CurrentWeight'], notes))
            
            # Fetch created data
            fetch_query = """
                SELECT PhysicalInfoID, UserID, DOB, Gender, Height, 
                       ActivityLevel, Goal, TargetWeight, BodyFat, Lifestyle
                FROM userphysicalinfo
                WHERE PhysicalInfoID = %s
            """
            created_info = DatabaseHelper.execute_query(fetch_query, (physical_info_id,), fetch_one=True)
            
            # Get latest weight
            weight_query = """
                SELECT Weight, DateTime, Notes
                FROM userweight
                WHERE UserID = %s
                ORDER BY DateTime DESC
                LIMIT 1
            """
            latest_weight = DatabaseHelper.execute_query(weight_query, (user_id,), fetch_one=True)
            
            response_data = {
                'PhysicalInfoID': created_info['PhysicalInfoID'],
                'UserID': created_info['UserID'],
                'DOB': str(created_info['DOB']),
                'Gender': created_info['Gender'],
                'Height': float(created_info['Height']),
                'CurrentWeight': float(latest_weight['Weight']) if latest_weight and latest_weight.get('Weight') else None,
                'WeightLastUpdated': str(latest_weight['DateTime']) if latest_weight and latest_weight.get('DateTime') else None,
                'TargetWeight': float(created_info['TargetWeight']),
                'ActivityLevel': created_info['ActivityLevel'],
                'Goal': created_info['Goal'],
                'BodyFat': float(created_info['BodyFat']) if created_info.get('BodyFat') else None,
                'Lifestyle': created_info.get('Lifestyle')
            }
            
            return Response({
                'success': True,
                'message': 'Physical information created',
                'data': response_data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating physical info: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(APIView):
    """Get combined user and physical information"""
    
    def get(self, request, user_id):
        """Get user profile with physical info and calculated BMI"""
        try:
            # Get user details
            user_query = """
                SELECT UserID, Username, Email, Name, ProfilePicture
                FROM userdetails
                WHERE UserID = %s
            """
            user_data = DatabaseHelper.execute_query(user_query, (user_id,), fetch_one=True)
            
            if not user_data:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get physical info from userphysicalinfo table
            physical_query = """
                SELECT PhysicalInfoID, UserID, DOB, Gender, Height, 
                       ActivityLevel, Goal, TargetWeight, BodyFat, Lifestyle
                FROM userphysicalinfo
                WHERE UserID = %s
            """
            physical_data = DatabaseHelper.execute_query(physical_query, (user_id,), fetch_one=True)
            
            if not physical_data:
                return Response({
                    'success': False,
                    'message': 'Physical information not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get latest weight from userweight table
            weight_query = """
                SELECT Weight, DateTime
                FROM userweight
                WHERE UserID = %s
                ORDER BY DateTime DESC
                LIMIT 1
            """
            latest_weight = DatabaseHelper.execute_query(weight_query, (user_id,), fetch_one=True)
            
            # Calculate BMI
            height = float(physical_data.get('Height', 0)) if physical_data.get('Height') else 0
            current_weight = float(latest_weight['Weight']) if latest_weight and latest_weight.get('Weight') else 0
            
            bmi = None
            if height > 0 and current_weight > 0:
                height_m = height / 100
                bmi = round(current_weight / (height_m * height_m), 1)
            
            return Response({
                'success': True,
                'data': {
                    'user': {
                        'UserID': user_data['UserID'],
                        'Name': user_data['Name'],
                        'Username': user_data['Username'],
                        'Email': user_data['Email'],
                        'ProfilePicture': user_data.get('ProfilePicture')
                    },
                    'physicalInfo': {
                        'PhysicalInfoID': physical_data['PhysicalInfoID'],
                        'DOB': str(physical_data['DOB']) if physical_data.get('DOB') else None,
                        'Gender': physical_data['Gender'],
                        'Height': float(physical_data['Height']) if physical_data.get('Height') else None,
                        'CurrentWeight': current_weight if current_weight > 0 else None,
                        'WeightLastUpdated': str(latest_weight['DateTime']) if latest_weight and latest_weight.get('DateTime') else None,
                        'TargetWeight': float(physical_data['TargetWeight']) if physical_data.get('TargetWeight') else None,
                        'ActivityLevel': physical_data['ActivityLevel'],
                        'Goal': physical_data['Goal'],
                        'BodyFat': float(physical_data['BodyFat']) if physical_data.get('BodyFat') else None,
                        'Lifestyle': physical_data.get('Lifestyle'),
                        'BMI': bmi
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching user profile: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WeightHistoryView(APIView):
    """Handle weight history tracking"""
    
    def get(self, request, user_id):
        """Get weight history for user"""
        try:
            # Check if user exists
            user_query = "SELECT UserID FROM userdetails WHERE UserID = %s"
            user_exists = DatabaseHelper.execute_query(user_query, (user_id,), fetch_one=True)
            
            if not user_exists:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get weight history
            query = """
                SELECT WeightID, Weight, DateTime, Notes
                FROM userweight
                WHERE UserID = %s
                ORDER BY DateTime DESC
            """
            weight_history = DatabaseHelper.execute_query(query, (user_id,))
            
            # Format response
            formatted_history = []
            for entry in weight_history:
                formatted_history.append({
                    'WeightID': entry['WeightID'],
                    'Weight': float(entry['Weight']),
                    'DateTime': str(entry['DateTime']),
                    'Notes': entry.get('Notes')
                })
            
            return Response({
                'success': True,
                'data': formatted_history
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching weight history: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, user_id):
        """Add new weight entry"""
        try:
            # Check if user exists
            user_query = "SELECT UserID FROM userdetails WHERE UserID = %s"
            user_exists = DatabaseHelper.execute_query(user_query, (user_id,), fetch_one=True)
            
            if not user_exists:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Validate weight
            weight = request.data.get('Weight')
            if not weight:
                return Response({
                    'success': False,
                    'message': 'Weight is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Insert weight entry
            insert_query = """
                INSERT INTO userweight (UserID, DateTime, Weight, Notes)
                VALUES (%s, NOW(), %s, %s)
            """
            notes = request.data.get('Notes', '')
            weight_id = DatabaseHelper.execute_insert(insert_query, (user_id, weight, notes))
            
            if weight_id:
                # Fetch created entry
                fetch_query = """
                    SELECT WeightID, Weight, DateTime, Notes
                    FROM userweight
                    WHERE WeightID = %s
                """
                created_entry = DatabaseHelper.execute_query(fetch_query, (weight_id,), fetch_one=True)
                
                return Response({
                    'success': True,
                    'message': 'Weight entry added',
                    'data': {
                        'WeightID': created_entry['WeightID'],
                        'Weight': float(created_entry['Weight']),
                        'DateTime': str(created_entry['DateTime']),
                        'Notes': created_entry.get('Notes')
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to add weight entry'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            logger.error(f"Error adding weight entry: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, user_id):
        """Delete a weight entry"""
        try:
            weight_id = request.data.get('WeightID')
            if not weight_id:
                return Response({
                    'success': False,
                    'message': 'WeightID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify the weight entry belongs to this user
            check_query = "SELECT UserID FROM userweight WHERE WeightID = %s"
            weight_entry = DatabaseHelper.execute_query(check_query, (weight_id,), fetch_one=True)
            
            if not weight_entry:
                return Response({
                    'success': False,
                    'message': 'Weight entry not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if weight_entry['UserID'] != user_id:
                return Response({
                    'success': False,
                    'message': 'Unauthorized'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Delete the entry
            delete_query = "DELETE FROM userweight WHERE WeightID = %s"
            row_count = DatabaseHelper.execute_update(delete_query, (weight_id,))
            
            if row_count > 0:
                return Response({
                    'success': True,
                    'message': 'Weight entry deleted'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to delete weight entry'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            logger.error(f"Error deleting weight entry: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Add this to your users/views.py - FIXED UserProfileView

class UserProfileView(APIView):
    """Get combined user and physical information"""
    
    def get(self, request, user_id):
        """Get user profile with physical info and calculated BMI"""
        try:
            # Get user details
            user_query = """
                SELECT UserID, Username, Email, Name, ProfilePicture
                FROM userdetails
                WHERE UserID = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(user_query, (user_id,))
                user_result = cursor.fetchone()
                
                if not user_result:
                    return Response({
                        'success': False,
                        'message': 'User not found'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                user_columns = [col[0] for col in cursor.description]
                user_data = dict(zip(user_columns, user_result))
            
            # Get physical info
            physical_query = """
                SELECT PhysicalInfoID, UserID, DOB, Gender, Height, 
                       ActivityLevel, Goal, TargetWeight, BodyFat, Lifestyle
                FROM userphysicalinfo
                WHERE UserID = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(physical_query, (user_id,))
                physical_result = cursor.fetchone()
                
                if not physical_result:
                    return Response({
                        'success': False,
                        'message': 'Physical information not found for this user'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                physical_columns = [col[0] for col in cursor.description]
                physical_data = dict(zip(physical_columns, physical_result))
            
            # Get latest weight
            weight_query = """
                SELECT Weight, DateTime
                FROM userweight
                WHERE UserID = %s
                ORDER BY DateTime DESC
                LIMIT 1
            """
            with connection.cursor() as cursor:
                cursor.execute(weight_query, (user_id,))
                weight_result = cursor.fetchone()
                
                latest_weight = None
                if weight_result:
                    weight_columns = [col[0] for col in cursor.description]
                    latest_weight = dict(zip(weight_columns, weight_result))
            
            # Calculate BMI
            height = float(physical_data.get('Height', 0)) if physical_data.get('Height') else 0
            current_weight = float(latest_weight['Weight']) if latest_weight and latest_weight.get('Weight') else 0
            
            bmi = None
            if height > 0 and current_weight > 0:
                # Convert feet to centimeters: feet * 30.48
                height_cm = height * 30.48
                height_m = height_cm / 100
                bmi = round(current_weight / (height_m * height_m), 1)
            
            return Response({
                'success': True,
                'data': {
                    'user': {
                        'UserID': user_data['UserID'],
                        'Name': user_data['Name'],
                        'Username': user_data['Username'],
                        'Email': user_data['Email'],
                        'ProfilePicture': user_data.get('ProfilePicture')
                    },
                    'physicalInfo': {
                        'PhysicalInfoID': physical_data['PhysicalInfoID'],
                        'DOB': str(physical_data['DOB']) if physical_data.get('DOB') else None,
                        'Gender': physical_data['Gender'],
                        'Height': float(physical_data['Height']) if physical_data.get('Height') else None,
                        'CurrentWeight': float(latest_weight['Weight']) if latest_weight and latest_weight.get('Weight') else None,
                        'WeightLastUpdated': str(latest_weight['DateTime']) if latest_weight and latest_weight.get('DateTime') else None,
                        'TargetWeight': float(physical_data['TargetWeight']) if physical_data.get('TargetWeight') else None,
                        'ActivityLevel': physical_data['ActivityLevel'],
                        'Goal': physical_data['Goal'],
                        'BodyFat': float(physical_data['BodyFat']) if physical_data.get('BodyFat') else None,
                        'Lifestyle': physical_data.get('Lifestyle'),
                        'BMI': bmi
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching user profile: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)