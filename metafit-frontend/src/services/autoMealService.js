// src/services/autoMealService.js

const API_BASE = process.env.REACT_APP_NUTRITION_API || 'http://localhost:8000/api/nutrition';

export const autoMealService = {
  // Fetch all foods with pagination
  getAllFoods: async (limit = 100, offset = 0, search = '') => {
    try {
      let url = `${API_BASE}/foods/?limit=${limit}&offset=${offset}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch foods');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching foods:', error);
      throw error;
    }
  },

  // Search for specific foods
  searchFoods: async (query, limit = 50) => {
    try {
      const url = `${API_BASE}/foods/search/?q=${encodeURIComponent(query)}&limit=${limit}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }
      
      return data;
    } catch (error) {
      console.error('Error searching foods:', error);
      throw error;
    }
  },

  // Fetch user's preset meals
  getPresetMeals: async (userId) => {
    try {
      const url = `${API_BASE}/presets/?user_id=${userId}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch presets');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching presets:', error);
      throw error;
    }
  },

  // Create a new preset meal
  createPresetMeal: async (userId, presetName, mealType, foods) => {
    try {
      const url = `${API_BASE}/presets/`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserID: userId,
          Name: presetName,
          MealType: mealType,
          foods: foods
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create preset');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating preset:', error);
      throw error;
    }
  },

  // Log multiple foods at once (bulk)
  bulkLogFoods: async (userId, mealType, logDateTime, foods) => {
    try {
      const url = `${API_BASE}/logs/bulk/`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserID: userId,
          MealType: mealType,
          LogDateTime: logDateTime,
          foods: foods
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to log foods');
      }
      
      return data;
    } catch (error) {
      console.error('Error logging foods:', error);
      throw error;
    }
  }
};