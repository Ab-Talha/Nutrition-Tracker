# nutrition/serializers.py

from rest_framework import serializers
from datetime import datetime


class FoodSerializer(serializers.Serializer):
    """Serializer for Food items"""
    FoodID = serializers.IntegerField(read_only=True)
    FoodName = serializers.CharField(max_length=255, required=True)
    BrandName = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    Unit = serializers.CharField(max_length=50, default='g')
    Quantity = serializers.DecimalField(max_digits=10, decimal_places=2, default=100)
    Calories = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    Carbs = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    Protein = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    Fat = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    Sugar = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    Fiber = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    CreatedAt = serializers.DateTimeField(read_only=True)

    def validate_FoodName(self, value):
        """Validate food name is not empty"""
        if not value or value.strip() == '':
            raise serializers.ValidationError("Food name cannot be empty")
        return value.strip()

    def validate_Quantity(self, value):
        """Validate quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value


class FoodSearchSerializer(serializers.Serializer):
    """Serializer for food search requests"""
    search = serializers.CharField(required=False, allow_blank=True)
    limit = serializers.IntegerField(default=50, min_value=1, max_value=200)
    offset = serializers.IntegerField(default=0, min_value=0)


class UserFoodLogSerializer(serializers.Serializer):
    """Serializer for User Food Log"""
    LogID = serializers.IntegerField(read_only=True)
    UserID = serializers.IntegerField(required=True)
    FoodID = serializers.IntegerField(required=True)
    Quantity = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    Unit = serializers.CharField(max_length=50, default='g')
    MealType = serializers.ChoiceField(
        choices=['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        default='Breakfast'
    )
    LogDateTime = serializers.DateTimeField(default=datetime.now)
    
    # Read-only fields from joined table
    FoodName = serializers.CharField(read_only=True)
    BrandName = serializers.CharField(read_only=True)
    Calories = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    Carbs = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    Protein = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    Fat = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    Sugar = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    Fiber = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    def validate_UserID(self, value):
        """Validate UserID is positive"""
        if value <= 0:
            raise serializers.ValidationError("Invalid UserID")
        return value

    def validate_Quantity(self, value):
        """Validate quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value


class BulkFoodLogSerializer(serializers.Serializer):
    """Serializer for logging multiple foods at once"""
    UserID = serializers.IntegerField(required=True)
    MealType = serializers.ChoiceField(
        choices=['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        required=True
    )
    LogDateTime = serializers.DateTimeField(required=True)
    foods = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )

    def validate_foods(self, value):
        """Validate each food item in the list"""
        for food in value:
            if 'FoodID' not in food or 'Quantity' not in food:
                raise serializers.ValidationError(
                    "Each food must have FoodID and Quantity"
                )
            if food['Quantity'] <= 0:
                raise serializers.ValidationError(
                    "Quantity must be greater than 0"
                )
        return value


class DailySummarySerializer(serializers.Serializer):
    """Serializer for daily nutrition summary"""
    TotalCalories = serializers.DecimalField(max_digits=10, decimal_places=2)
    TotalProtein = serializers.DecimalField(max_digits=10, decimal_places=2)
    TotalCarbs = serializers.DecimalField(max_digits=10, decimal_places=2)
    TotalFat = serializers.DecimalField(max_digits=10, decimal_places=2)
    TotalSugar = serializers.DecimalField(max_digits=10, decimal_places=2)
    TotalFiber = serializers.DecimalField(max_digits=10, decimal_places=2)


class PresetMealSerializer(serializers.Serializer):
    """Serializer for Preset Meals"""
    PresetID = serializers.IntegerField(read_only=True)
    UserID = serializers.IntegerField(required=True)
    PresetName = serializers.CharField(max_length=100, required=True)
    MealType = serializers.ChoiceField(
        choices=['Breakfast', 'Lunch', 'Dinner', 'Extra Meal'],
        default='Breakfast'
    )
    CreatedAt = serializers.DateTimeField(read_only=True)

    def validate_PresetName(self, value):
        """Validate preset name is not empty"""
        if not value or value.strip() == '':
            raise serializers.ValidationError("Preset name cannot be empty")
        return value.strip()


class PresetWithFoodsSerializer(serializers.Serializer):
    """Serializer for creating preset with foods"""
    UserID = serializers.IntegerField(required=True)
    Name = serializers.CharField(max_length=100, required=True)  # Changed from PresetName to Name
    MealType = serializers.ChoiceField(
        choices=['Breakfast', 'Lunch', 'Dinner', 'Extra Meal'],
        required=True
    )
    foods = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )

    def validate_Name(self, value):
        """Validate preset name is not empty"""
        if not value or value.strip() == '':
            raise serializers.ValidationError("Preset name cannot be empty")
        return value.strip()

    def validate_foods(self, value):
        """Validate each food item in the preset"""
        for food in value:
            if 'FoodID' not in food or 'Quantity' not in food:
                raise serializers.ValidationError(
                    "Each food must have FoodID and Quantity"
                )
            if food['Quantity'] <= 0:
                raise serializers.ValidationError(
                    "Quantity must be greater than 0"
                )
        return value


class DateRangeSerializer(serializers.Serializer):
    """Serializer for date range queries"""
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    user_id = serializers.IntegerField(required=True)

    def validate(self, data):
        """Validate date range"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                "start_date must be before or equal to end_date"
            )
        return data


class MealTypeFilterSerializer(serializers.Serializer):
    """Serializer for filtering by meal type"""
    user_id = serializers.IntegerField(required=True)
    meal_type = serializers.ChoiceField(
        choices=['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        required=True
    )
    log_date = serializers.DateField(required=False)