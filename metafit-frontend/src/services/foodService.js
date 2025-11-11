import { nutritionApi } from './api';

export const foodService = {
  // ============================================
  // FOOD ENDPOINTS
  // ============================================
  
  getAllFoods: async (limit = 500) => {
    try {
      const response = await nutritionApi.get('/foods/', {
        params: { limit, format: 'json' }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Fetch foods error:', error);
      return [];
    }
  },

  getFoodById: async (foodId) => {
    try {
      const response = await nutritionApi.get(`/foods/${foodId}/`, {
        params: { format: 'json' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Fetch food error:', error);
      return null;
    }
  },

  searchFoods: async (query) => {
    try {
      const response = await nutritionApi.get('/foods/search/', {
        params: { q: query, format: 'json' }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Search foods error:', error);
      return [];
    }
  },

  // ============================================
  // MEAL LOG ENDPOINTS
  // ============================================

  logMeal: async (userId, mealType, logDateTime, foods) => {
    try {
      const response = await nutritionApi.post('/logs/bulk/', {
        UserID: userId,
        MealType: mealType,
        LogDateTime: logDateTime,
        foods
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to log meal';
    }
  },

  // Get all logs for a user
  getUserLogs: async (userId) => {
    try {
      const response = await nutritionApi.get('/logs/', {
        params: {
          user_id: userId,
          format: 'json'
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Fetch user logs error:', error);
      return [];
    }
  },

  // Get single log detail
  getLogDetail: async (logId) => {
    try {
      const response = await nutritionApi.get(`/logs/${logId}/`, {
        params: { format: 'json' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Fetch log detail error:', error);
      return null;
    }
  },

  // Update a single food log
  updateFoodLog: async (logId, updatedData) => {
    try {
      const response = await nutritionApi.put(`/logs/${logId}/`, updatedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to update log';
    }
  },

  // Delete a single food log
  deleteFoodLog: async (logId) => {
    try {
      const response = await nutritionApi.delete(`/logs/${logId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete log';
    }
  },

  // Get daily summary (grouped by meal type)
  getDailySummary: async (userId, date) => {
    try {
      const response = await nutritionApi.get('/logs/summary/', {
        params: {
          user_id: userId,
          date,
          format: 'json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Summary error:', error);
      return null;
    }
  },

  // Get logs by meal type for a specific day
  getMealTypeLogs: async (userId, mealType, date) => {
    try {
      const response = await nutritionApi.get('/logs/meal-type/', {
        params: {
          user_id: userId,
          meal_type: mealType,
          date,
          format: 'json'
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Fetch meal type logs error:', error);
      return [];
    }
  },

  // ============================================
  // PRESET MEAL ENDPOINTS
  // ============================================

  getPresets: async (userId) => {
    try {
      const response = await nutritionApi.get('/presets/', {
        params: {
          user_id: userId,
          format: 'json'
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Fetch presets error:', error);
      return [];
    }
  },

  getPresetById: async (presetId) => {
    try {
      const response = await nutritionApi.get(`/presets/${presetId}/`, {
        params: { format: 'json' }
      });
      return response.data.data;
    } catch (error) {
      console.error('Fetch preset error:', error);
      return null;
    }
  },

  createPreset: async (userId, name, mealType, foods) => {
    try {
      const response = await nutritionApi.post('/presets/', {
        UserID: userId,
        Name: name,
        MealType: mealType,
        foods
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to create preset';
    }
  },

  deletePreset: async (presetId) => {
    try {
      const response = await nutritionApi.delete(`/presets/${presetId}/`, {
        params: { format: 'json' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete preset';
    }
  },

  // ============================================
  // HELPER METHODS FOR NUTRITION CALCULATIONS
  // ============================================

  // Calculate nutrition for a single food log entry
  calculateNutritionForLog: (foodData, quantity) => {
    if (!foodData) return { protein: 0, carbs: 0, fat: 0, calories: 0 };
    
    const baseQuantity = foodData.Quantity || 100;
    const multiplier = quantity / baseQuantity;

    return {
      protein: (parseFloat(foodData.Protein) * multiplier).toFixed(1),
      carbs: (parseFloat(foodData.Carbs) * multiplier).toFixed(1),
      fat: (parseFloat(foodData.Fat) * multiplier).toFixed(1),
      calories: (parseFloat(foodData.Calories) * multiplier).toFixed(0)
    };
  },

  // Calculate total nutrition from multiple logs
  calculateTotalNutrition: (logsWithFoodData) => {
    return logsWithFoodData.reduce((acc, log) => {
      const nutrition = foodService.calculateNutritionForLog(log.foodData, log.Quantity);
      return {
        protein: (parseFloat(acc.protein) + parseFloat(nutrition.protein)).toFixed(1),
        carbs: (parseFloat(acc.carbs) + parseFloat(nutrition.carbs)).toFixed(1),
        fat: (parseFloat(acc.fat) + parseFloat(nutrition.fat)).toFixed(1),
        calories: (parseFloat(acc.calories) + parseFloat(nutrition.calories)).toFixed(0)
      };
    }, { protein: 0, carbs: 0, fat: 0, calories: 0 });
  }
};