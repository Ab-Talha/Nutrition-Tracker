from django.urls import path
from .views import (
    FoodListView, FoodDetailView, FoodSearchView,
    UserFoodLogListView, UserFoodLogDetailView, BulkFoodLogView,
    DailySummaryView, MealTypeLogsView,
    PresetMealListView, PresetMealDetailView
)
from django.http import JsonResponse

app_name = 'nutrition'

# --- Root API endpoint ---
def api_root(request):
    return JsonResponse({
        "message": "Nutrition API is running",
        "endpoints": [
            "foods/",
            "foods/<int:food_id>/",
            "foods/search/",
            "logs/",
            "logs/<int:log_id>/",
            "logs/bulk/",
            "logs/summary/",
            "logs/meal-type/",
            "presets/",
            "presets/<int:preset_id>/"
        ]
    })

urlpatterns = [
    # Root endpoint
    path('', api_root, name='nutrition-root'),

    # Food endpoints
    path('foods/', FoodListView.as_view(), name='food-list'),
    path('foods/<int:food_id>/', FoodDetailView.as_view(), name='food-detail'),
    path('foods/search/', FoodSearchView.as_view(), name='food-search'),

    # Food log endpoints
    path('logs/', UserFoodLogListView.as_view(), name='log-list'),
    path('logs/<int:log_id>/', UserFoodLogDetailView.as_view(), name='log-detail'),
    path('logs/bulk/', BulkFoodLogView.as_view(), name='log-bulk'),
    path('logs/summary/', DailySummaryView.as_view(), name='daily-summary'),
    path('logs/meal-type/', MealTypeLogsView.as_view(), name='meal-type-logs'),

    # Preset meal endpoints
    path('presets/', PresetMealListView.as_view(), name='preset-list'),
    path('presets/<int:preset_id>/', PresetMealDetailView.as_view(), name='preset-detail'),


]