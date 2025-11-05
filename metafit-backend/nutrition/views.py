# nutrition/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, date
import logging

from .database import FoodDatabase, UserFoodLogDatabase, PresetMealDatabase
from .serializers import (
    FoodSerializer, FoodSearchSerializer, UserFoodLogSerializer,
    BulkFoodLogSerializer, DailySummarySerializer, PresetMealSerializer,
    DateRangeSerializer, MealTypeFilterSerializer, PresetWithFoodsSerializer
)

logger = logging.getLogger(__name__)


class FoodListView(APIView):
    """
    GET: List all foods with optional search
    POST: Create new food
    """
    
    def get(self, request):
        try:
            search = request.query_params.get('search', '')
            limit = int(request.query_params.get('limit', 100))
            offset = int(request.query_params.get('offset', 0))
            
            foods = FoodDatabase.get_all_foods(search, limit, offset)
            
            return Response({
                'success': True,
                'count': len(foods),
                'data': foods
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching foods: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = FoodSerializer(data=request.data)
            
            if serializer.is_valid():
                food_id = FoodDatabase.create_food(serializer.validated_data)
                
                # Fetch the created food
                new_food = FoodDatabase.get_food_by_id(food_id)
                
                return Response({
                    'success': True,
                    'message': 'Food created successfully',
                    'data': new_food
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating food: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FoodDetailView(APIView):
    """
    GET: Retrieve food by ID
    PUT: Update food
    DELETE: Delete food
    """
    
    def get(self, request, food_id):
        try:
            food = FoodDatabase.get_food_by_id(food_id)
            
            if not food:
                return Response({
                    'success': False,
                    'error': 'Food not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'data': food
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching food: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, food_id):
        try:
            # Check if food exists
            existing_food = FoodDatabase.get_food_by_id(food_id)
            if not existing_food:
                return Response({
                    'success': False,
                    'error': 'Food not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = FoodSerializer(data=request.data)
            
            if serializer.is_valid():
                rows_affected = FoodDatabase.update_food(food_id, serializer.validated_data)
                
                if rows_affected > 0:
                    updated_food = FoodDatabase.get_food_by_id(food_id)
                    return Response({
                        'success': True,
                        'message': 'Food updated successfully',
                        'data': updated_food
                    }, status=status.HTTP_200_OK)
                
                return Response({
                    'success': False,
                    'error': 'Update failed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating food: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, food_id):
        try:
            # Check if food exists
            existing_food = FoodDatabase.get_food_by_id(food_id)
            if not existing_food:
                return Response({
                    'success': False,
                    'error': 'Food not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            rows_affected = FoodDatabase.delete_food(food_id)
            
            if rows_affected > 0:
                return Response({
                    'success': True,
                    'message': 'Food deleted successfully'
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'error': 'Delete failed'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error deleting food: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FoodSearchView(APIView):
    """
    GET: Search foods by name or brand
    """
    
    def get(self, request):
        try:
            search_term = request.query_params.get('q', '').strip()
            limit = int(request.query_params.get('limit', 50))
            
            # If no search term, return empty result (don't throw error)
            if not search_term:
                return Response({
                    'success': True,
                    'count': 0,
                    'data': []
                }, status=status.HTTP_200_OK)
            
            foods = FoodDatabase.search_foods(search_term, limit)
            
            return Response({
                'success': True,
                'count': len(foods),
                'data': foods
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error searching foods: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserFoodLogListView(APIView):
    """
    GET: List user food logs with optional date filtering
    POST: Create new food log
    """
    
    def get(self, request):
        try:
            user_id = int(request.query_params.get('user_id'))
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            # Convert date strings to date objects
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None
            
            logs = UserFoodLogDatabase.get_user_logs(user_id, start_date_obj, end_date_obj)
            
            return Response({
                'success': True,
                'count': len(logs),
                'data': logs
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'success': False,
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error fetching logs: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = UserFoodLogSerializer(data=request.data)
            
            if serializer.is_valid():
                log_id = UserFoodLogDatabase.create_log(serializer.validated_data)
                
                # Fetch the created log
                new_log = UserFoodLogDatabase.get_log_by_id(log_id)
                
                return Response({
                    'success': True,
                    'message': 'Food log created successfully',
                    'data': new_log
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating log: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserFoodLogDetailView(APIView):
    """
    GET: Retrieve log by ID
    PUT: Update log
    DELETE: Delete log
    """
    
    def get(self, request, log_id):
        try:
            log = UserFoodLogDatabase.get_log_by_id(log_id)
            
            if not log:
                return Response({
                    'success': False,
                    'error': 'Log not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'data': log
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching log: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, log_id):
        try:
            existing_log = UserFoodLogDatabase.get_log_by_id(log_id)
            if not existing_log:
                return Response({
                    'success': False,
                    'error': 'Log not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = UserFoodLogSerializer(data=request.data)
            
            if serializer.is_valid():
                rows_affected = UserFoodLogDatabase.update_log(log_id, serializer.validated_data)
                
                if rows_affected > 0:
                    updated_log = UserFoodLogDatabase.get_log_by_id(log_id)
                    return Response({
                        'success': True,
                        'message': 'Log updated successfully',
                        'data': updated_log
                    }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating log: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, log_id):
        try:
            existing_log = UserFoodLogDatabase.get_log_by_id(log_id)
            if not existing_log:
                return Response({
                    'success': False,
                    'error': 'Log not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            rows_affected = UserFoodLogDatabase.delete_log(log_id)
            
            if rows_affected > 0:
                return Response({
                    'success': True,
                    'message': 'Log deleted successfully'
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error deleting log: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BulkFoodLogView(APIView):
    """
    POST: Log multiple foods at once
    """
    
    def post(self, request):
        try:
            serializer = BulkFoodLogSerializer(data=request.data)
            
            if serializer.is_valid():
                user_id = serializer.validated_data['UserID']
                meal_type = serializer.validated_data['MealType']
                log_datetime = serializer.validated_data['LogDateTime']
                foods = serializer.validated_data['foods']
                
                created_logs = []
                
                for food in foods:
                    log_data = {
                        'UserID': user_id,
                        'FoodID': food['FoodID'],
                        'Quantity': food['Quantity'],
                        'Unit': food.get('Unit', 'g'),
                        'MealType': meal_type,
                        'LogDateTime': log_datetime
                    }
                    
                    log_id = UserFoodLogDatabase.create_log(log_data)
                    created_log = UserFoodLogDatabase.get_log_by_id(log_id)
                    created_logs.append(created_log)
                
                return Response({
                    'success': True,
                    'message': f'{len(created_logs)} food logs created successfully',
                    'data': created_logs
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating bulk logs: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DailySummaryView(APIView):
    """
    GET: Get daily nutrition summary for a user
    """
    
    def get(self, request):
        try:
            user_id = int(request.query_params.get('user_id'))
            log_date_str = request.query_params.get('date', datetime.now().strftime('%Y-%m-%d'))
            
            log_date = datetime.strptime(log_date_str, '%Y-%m-%d').date()
            
            summary = UserFoodLogDatabase.get_daily_summary(user_id, log_date)
            
            return Response({
                'success': True,
                'date': log_date_str,
                'data': summary
            }, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response({
                'success': False,
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error fetching daily summary: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MealTypeLogsView(APIView):
    """
    GET: Get logs filtered by meal type
    """
    
    def get(self, request):
        try:
            user_id = int(request.query_params.get('user_id'))
            meal_type = request.query_params.get('meal_type')
            log_date_str = request.query_params.get('date')
            
            if meal_type not in ['Breakfast', 'Lunch', 'Dinner', 'Snack']:
                return Response({
                    'success': False,
                    'error': 'Invalid meal type'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            log_date = None
            if log_date_str:
                log_date = datetime.strptime(log_date_str, '%Y-%m-%d').date()
            
            logs = UserFoodLogDatabase.get_logs_by_meal_type(user_id, meal_type, log_date)
            
            return Response({
                'success': True,
                'count': len(logs),
                'data': logs
            }, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response({
                'success': False,
                'error': 'Invalid date format. Use YYYY-MM-DD'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error fetching meal type logs: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PresetMealListView(APIView):
    """
    GET: List user preset meals
    POST: Create new preset meal with foods
    """
    
    def get(self, request):
        try:
            user_id = int(request.query_params.get('user_id'))
            
            presets = PresetMealDatabase.get_user_presets(user_id)
            
            return Response({
                'success': True,
                'count': len(presets),
                'data': presets
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching presets: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = PresetWithFoodsSerializer(data=request.data)
            
            if serializer.is_valid():
                user_id = serializer.validated_data['UserID']
                preset_name = serializer.validated_data['Name']
                meal_type = serializer.validated_data['MealType']
                foods = serializer.validated_data['foods']
                
                # Create preset with foods
                preset_id = PresetMealDatabase.create_preset_with_foods(
                    user_id, 
                    preset_name, 
                    meal_type, 
                    foods
                )
                
                # Fetch and return the created preset with foods
                new_preset = PresetMealDatabase.get_preset_by_id(preset_id)
                
                return Response({
                    'success': True,
                    'message': 'Preset meal created successfully',
                    'data': new_preset
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating preset: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PresetMealDetailView(APIView):
    """
    GET: Retrieve preset by ID with foods
    PUT: Update preset
    DELETE: Delete preset and its foods
    """
    
    def get(self, request, preset_id):
        try:
            preset = PresetMealDatabase.get_preset_by_id(preset_id)
            
            if not preset:
                return Response({
                    'success': False,
                    'error': 'Preset not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'success': True,
                'data': preset
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching preset: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, preset_id):
        try:
            existing_preset = PresetMealDatabase.get_preset_by_id(preset_id)
            if not existing_preset:
                return Response({
                    'success': False,
                    'error': 'Preset not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = PresetMealSerializer(data=request.data)
            
            if serializer.is_valid():
                rows_affected = PresetMealDatabase.update_preset(preset_id, serializer.validated_data)
                
                if rows_affected > 0:
                    updated_preset = PresetMealDatabase.get_preset_by_id(preset_id)
                    return Response({
                        'success': True,
                        'message': 'Preset updated successfully',
                        'data': updated_preset
                    }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating preset: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, preset_id):
        try:
            existing_preset = PresetMealDatabase.get_preset_by_id(preset_id)
            if not existing_preset:
                return Response({
                    'success': False,
                    'error': 'Preset not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            rows_affected = PresetMealDatabase.delete_preset(preset_id)
            
            if rows_affected > 0:
                return Response({
                    'success': True,
                    'message': 'Preset deleted successfully'
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'error': 'Delete failed'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error deleting preset: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)