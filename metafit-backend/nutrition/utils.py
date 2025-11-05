# nutrition/utils.py

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response = {
            'success': False,
            'error': response.data
        }
        response.data = custom_response
    
    else:
        # Log unhandled exceptions
        logger.error(f"Unhandled exception: {exc}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return response


def calculate_nutrition_from_quantity(base_nutrition: dict, base_quantity: float, actual_quantity: float) -> dict:
    """
    Calculate actual nutrition based on quantity
    
    Args:
        base_nutrition: Dictionary containing base nutrition values per base_quantity
        base_quantity: Base quantity (e.g., 100g)
        actual_quantity: Actual quantity consumed
    
    Returns:
        Dictionary with calculated nutrition values
    """
    multiplier = actual_quantity / base_quantity
    
    return {
        'Calories': round(float(base_nutrition.get('Calories', 0)) * multiplier, 2),
        'Protein': round(float(base_nutrition.get('Protein', 0)) * multiplier, 2),
        'Carbs': round(float(base_nutrition.get('Carbs', 0)) * multiplier, 2),
        'Fat': round(float(base_nutrition.get('Fat', 0)) * multiplier, 2),
        'Sugar': round(float(base_nutrition.get('Sugar', 0)) * multiplier, 2),
        'Fiber': round(float(base_nutrition.get('Fiber', 0)) * multiplier, 2),
    }


def validate_date_format(date_string: str) -> bool:
    """
    Validate date string format (YYYY-MM-DD)
    """
    from datetime import datetime
    try:
        datetime.strptime(date_string, '%Y-%m-%d')
        return True
    except ValueError:
        return False


def validate_datetime_format(datetime_string: str) -> bool:
    """
    Validate datetime string format (YYYY-MM-DD HH:MM:SS)
    """
    from datetime import datetime
    try:
        datetime.strptime(datetime_string, '%Y-%m-%d %H:%M:%S')
        return True
    except ValueError:
        return False