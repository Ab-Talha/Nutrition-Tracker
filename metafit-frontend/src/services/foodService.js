import { nutritionApi } from './api';

export const foodService = {
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
  }
};