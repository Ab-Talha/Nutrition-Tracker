# nutrition/database.py

from django.db import connection
from typing import List, Dict, Optional, Any
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Base class for database operations using raw SQL"""
    
    @staticmethod
    def execute_query(query: str, params: tuple = None, fetch_one: bool = False) -> Optional[Any]:
        """Execute SELECT query and return results"""
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
            logger.error(f"Query execution error: {e}")
            raise
    
    @staticmethod
    def execute_update(query: str, params: tuple = None) -> int:
        """Execute INSERT, UPDATE, DELETE and return affected rows"""
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.rowcount
        except Exception as e:
            logger.error(f"Update execution error: {e}")
            raise
    
    @staticmethod
    def execute_insert(query: str, params: tuple = None) -> int:
        """Execute INSERT and return last inserted ID"""
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.lastrowid
        except Exception as e:
            logger.error(f"Insert execution error: {e}")
            raise


class FoodDatabase(DatabaseManager):
    """Database operations for allfood table"""
    
    @staticmethod
    def get_all_foods(search: str = None, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Get all foods with optional search"""
        query = """
            SELECT FoodID, FoodName, BrandName, Unit, Quantity,
                   Calories, Carbs, Protein, Fat, Sugar, Fiber, CreatedAt
            FROM allfood
        """
        
        params = []
        if search:
            query += " WHERE FoodName LIKE %s OR BrandName LIKE %s"
            search_param = f"%{search}%"
            params.extend([search_param, search_param])
        
        query += " ORDER BY FoodName LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        return DatabaseManager.execute_query(query, tuple(params))
    
    @staticmethod
    def get_food_by_id(food_id: int) -> Optional[Dict]:
        """Get food by ID"""
        query = """
            SELECT FoodID, FoodName, BrandName, Unit, Quantity,
                   Calories, Carbs, Protein, Fat, Sugar, Fiber, CreatedAt
            FROM allfood
            WHERE FoodID = %s
        """
        return DatabaseManager.execute_query(query, (food_id,), fetch_one=True)
    
    @staticmethod
    def create_food(data: Dict) -> int:
        """Create new food entry"""
        query = """
            INSERT INTO allfood 
            (FoodName, BrandName, Unit, Quantity, Calories, Carbs, Protein, Fat, Sugar, Fiber, CreatedAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        params = (
            data.get('FoodName'),
            data.get('BrandName', ''),
            data.get('Unit', 'g'),
            data.get('Quantity', 100),
            data.get('Calories', 0),
            data.get('Carbs', 0),
            data.get('Protein', 0),
            data.get('Fat', 0),
            data.get('Sugar', 0),
            data.get('Fiber', 0),
        )
        return DatabaseManager.execute_insert(query, params)
    
    @staticmethod
    def update_food(food_id: int, data: Dict) -> int:
        """Update food entry"""
        query = """
            UPDATE allfood
            SET FoodName = %s, BrandName = %s, Unit = %s, Quantity = %s,
                Calories = %s, Carbs = %s, Protein = %s, Fat = %s, Sugar = %s, Fiber = %s
            WHERE FoodID = %s
        """
        params = (
            data.get('FoodName'),
            data.get('BrandName', ''),
            data.get('Unit', 'g'),
            data.get('Quantity', 100),
            data.get('Calories', 0),
            data.get('Carbs', 0),
            data.get('Protein', 0),
            data.get('Fat', 0),
            data.get('Sugar', 0),
            data.get('Fiber', 0),
            food_id
        )
        return DatabaseManager.execute_update(query, params)
    
    @staticmethod
    def delete_food(food_id: int) -> int:
        """Delete food entry"""
        query = "DELETE FROM allfood WHERE FoodID = %s"
        return DatabaseManager.execute_update(query, (food_id,))
    
    @staticmethod
    def search_foods(search_term: str, limit: int = 50) -> List[Dict]:
        """Search foods by name or brand"""
        query = """
            SELECT FoodID, FoodName, BrandName, Unit, Quantity,
                   Calories, Carbs, Protein, Fat, Sugar, Fiber
            FROM allfood
            WHERE FoodName LIKE %s OR BrandName LIKE %s
            ORDER BY FoodName
            LIMIT %s
        """
        search_param = f"%{search_term}%"
        return DatabaseManager.execute_query(query, (search_param, search_param, limit))


class UserFoodLogDatabase(DatabaseManager):
    """Database operations for userfoodlog table"""
    
    @staticmethod
    def get_user_logs(user_id: int, start_date: date = None, end_date: date = None) -> List[Dict]:
        """Get user food logs with optional date filtering"""
        query = """
            SELECT ufl.LogID, ufl.UserID, ufl.FoodID, ufl.Quantity, ufl.Unit,
                   ufl.MealType, ufl.LogDateTime,
                   af.FoodName, af.BrandName, af.Calories, af.Carbs, af.Protein,
                   af.Fat, af.Sugar, af.Fiber
            FROM userfoodlog ufl
            INNER JOIN allfood af ON ufl.FoodID = af.FoodID
            WHERE ufl.UserID = %s
        """
        
        params = [user_id]
        
        if start_date:
            query += " AND DATE(ufl.LogDateTime) >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND DATE(ufl.LogDateTime) <= %s"
            params.append(end_date)
        
        query += " ORDER BY ufl.LogDateTime DESC"
        
        return DatabaseManager.execute_query(query, tuple(params))
    
    @staticmethod
    def get_log_by_id(log_id: int) -> Optional[Dict]:
        """Get specific food log by ID"""
        query = """
            SELECT ufl.LogID, ufl.UserID, ufl.FoodID, ufl.Quantity, ufl.Unit,
                   ufl.MealType, ufl.LogDateTime,
                   af.FoodName, af.BrandName
            FROM userfoodlog ufl
            INNER JOIN allfood af ON ufl.FoodID = af.FoodID
            WHERE ufl.LogID = %s
        """
        return DatabaseManager.execute_query(query, (log_id,), fetch_one=True)
    
    @staticmethod
    def create_log(data: Dict) -> int:
        """Create new food log entry"""
        query = """
            INSERT INTO userfoodlog 
            (UserID, FoodID, Quantity, Unit, MealType, LogDateTime)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (
            data.get('UserID'),
            data.get('FoodID'),
            data.get('Quantity', 100),
            data.get('Unit', 'g'),
            data.get('MealType', 'Breakfast'),
            data.get('LogDateTime', datetime.now()),
        )
        return DatabaseManager.execute_insert(query, params)
    
    @staticmethod
    def update_log(log_id: int, data: Dict) -> int:
        """Update food log entry"""
        query = """
            UPDATE userfoodlog
            SET FoodID = %s, Quantity = %s, Unit = %s, MealType = %s, LogDateTime = %s
            WHERE LogID = %s
        """
        params = (
            data.get('FoodID'),
            data.get('Quantity', 100),
            data.get('Unit', 'g'),
            data.get('MealType', 'Breakfast'),
            data.get('LogDateTime'),
            log_id
        )
        return DatabaseManager.execute_update(query, params)
    
    @staticmethod
    def delete_log(log_id: int) -> int:
        """Delete food log entry"""
        query = "DELETE FROM userfoodlog WHERE LogID = %s"
        return DatabaseManager.execute_update(query, (log_id,))
    
    @staticmethod
    def get_daily_summary(user_id: int, log_date: date) -> Dict:
        """Get daily nutrition summary for a user"""
        query = """
            SELECT 
                SUM((ufl.Quantity / af.Quantity) * af.Calories) as TotalCalories,
                SUM((ufl.Quantity / af.Quantity) * af.Protein) as TotalProtein,
                SUM((ufl.Quantity / af.Quantity) * af.Carbs) as TotalCarbs,
                SUM((ufl.Quantity / af.Quantity) * af.Fat) as TotalFat,
                SUM((ufl.Quantity / af.Quantity) * af.Sugar) as TotalSugar,
                SUM((ufl.Quantity / af.Quantity) * af.Fiber) as TotalFiber
            FROM userfoodlog ufl
            INNER JOIN allfood af ON ufl.FoodID = af.FoodID
            WHERE ufl.UserID = %s AND DATE(ufl.LogDateTime) = %s
        """
        result = DatabaseManager.execute_query(query, (user_id, log_date), fetch_one=True)
        
        # Handle None values
        if result:
            for key in result:
                if result[key] is None:
                    result[key] = 0
        return result or {}
    
    @staticmethod
    def get_logs_by_meal_type(user_id: int, meal_type: str, log_date: date = None) -> List[Dict]:
        """Get logs filtered by meal type"""
        query = """
            SELECT ufl.LogID, ufl.FoodID, ufl.Quantity, ufl.Unit, ufl.LogDateTime,
                   af.FoodName, af.BrandName, af.Calories, af.Protein, af.Carbs, af.Fat
            FROM userfoodlog ufl
            INNER JOIN allfood af ON ufl.FoodID = af.FoodID
            WHERE ufl.UserID = %s AND ufl.MealType = %s
        """
        
        params = [user_id, meal_type]
        
        if log_date:
            query += " AND DATE(ufl.LogDateTime) = %s"
            params.append(log_date)
        
        query += " ORDER BY ufl.LogDateTime DESC"
        
        return DatabaseManager.execute_query(query, tuple(params))


class PresetMealDatabase(DatabaseManager):
    """Database operations for presetmeals table"""
    
    @staticmethod
    def get_user_presets(user_id: int) -> List[Dict]:
        """Get all preset meals for a user with their foods"""
        # First, get all presets
        presets_query = """
            SELECT PresetID, UserID, PresetName, MealType, CreatedAt
            FROM presetmeals
            WHERE UserID = %s
            ORDER BY CreatedAt DESC
        """
        presets = DatabaseManager.execute_query(presets_query, (user_id,))
        
        # For each preset, get its foods
        result = []
        for preset in presets:
            foods_query = """
                SELECT FoodID, Quantity
                FROM presetfooditems
                WHERE PresetID = %s
            """
            foods = DatabaseManager.execute_query(foods_query, (preset['PresetID'],))
            
            result.append({
                'id': preset['PresetID'],
                'Name': preset['PresetName'],
                'MealType': preset['MealType'],
                'UserID': preset['UserID'],
                'CreatedAt': preset['CreatedAt'],
                'Foods': foods if foods else []
            })
        
        return result
    
    @staticmethod
    def get_preset_by_id(preset_id: int) -> Optional[Dict]:
        """Get preset meal by ID with its foods"""
        # Get preset details
        preset_query = """
            SELECT PresetID, UserID, PresetName, MealType, CreatedAt
            FROM presetmeals
            WHERE PresetID = %s
        """
        preset = DatabaseManager.execute_query(preset_query, (preset_id,), fetch_one=True)
        
        if not preset:
            return None
        
        # Get foods for this preset
        foods_query = """
            SELECT FoodID, Quantity
            FROM presetfooditems
            WHERE PresetID = %s
        """
        foods = DatabaseManager.execute_query(foods_query, (preset_id,))
        
        return {
            'id': preset['PresetID'],
            'Name': preset['PresetName'],
            'MealType': preset['MealType'],
            'UserID': preset['UserID'],
            'CreatedAt': preset['CreatedAt'],
            'Foods': foods if foods else []
        }
    
    @staticmethod
    def create_preset(data: Dict) -> int:
        """Create new preset meal"""
        query = """
            INSERT INTO presetmeals (UserID, PresetName, MealType, CreatedAt)
            VALUES (%s, %s, %s, NOW())
        """
        params = (
            data.get('UserID'),
            data.get('PresetName'),
            data.get('MealType', 'Breakfast'),
        )
        return DatabaseManager.execute_insert(query, params)
    
    @staticmethod
    def create_preset_with_foods(user_id: int, preset_name: str, meal_type: str, foods: List[Dict]) -> int:
        """Create preset meal with foods"""
        # Create preset
        preset_id = PresetMealDatabase.create_preset({
            'UserID': user_id,
            'PresetName': preset_name,
            'MealType': meal_type
        })
        
        # Add foods to preset
        if foods:
            query = """
                INSERT INTO presetfooditems (PresetID, FoodID, Quantity)
                VALUES (%s, %s, %s)
            """
            with connection.cursor() as cursor:
                for food in foods:
                    cursor.execute(query, (
                        preset_id,
                        food.get('FoodID'),
                        food.get('Quantity', 100)
                    ))
        
        return preset_id
    
    @staticmethod
    def update_preset(preset_id: int, data: Dict) -> int:
        """Update preset meal"""
        query = """
            UPDATE presetmeals
            SET PresetName = %s, MealType = %s
            WHERE PresetID = %s
        """
        params = (
            data.get('PresetName'),
            data.get('MealType'),
            preset_id
        )
        return DatabaseManager.execute_update(query, params)
    
    @staticmethod
    def delete_preset(preset_id: int) -> int:
        """Delete preset meal and its foods"""
        # Delete foods first (due to foreign key constraint)
        foods_query = "DELETE FROM presetfooditems WHERE PresetID = %s"
        DatabaseManager.execute_update(foods_query, (preset_id,))
        
        # Then delete preset
        preset_query = "DELETE FROM presetmeals WHERE PresetID = %s"
        return DatabaseManager.execute_update(preset_query, (preset_id,))