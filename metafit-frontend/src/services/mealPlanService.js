// src/services/mealPlanService.js

const API_BASE = process.env.REACT_APP_NUTRITION_API || 'http://localhost:8000/api/nutrition';

export const mealPlanService = {
  /**
   * Generate a 7-day meal plan
   * 
   * @param {number} userId - User ID
   * @param {number} calorieTarget - Daily calorie target (1000-5000)
   * @param {string} gender - 'male' or 'female'
   * @param {object} customMacros - Optional custom macro targets
   *   { protein: 150, carbs: 300, fat: 83 }
   * 
   * @returns {Promise} - Meal plan result
   */
  generateMealPlan: async (userId, calorieTarget, gender, customMacros = null) => {
    try {
      const url = `${API_BASE}/meal-plans/generate/`;
      
      const payload = {
        user_id: userId,
        calorie_target: calorieTarget,
        gender: gender.toLowerCase()
      };

      // Add custom macros if provided
      if (customMacros && typeof customMacros === 'object') {
        payload.custom_macros = customMacros;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate meal plan');
      }

      return data;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
  },

  /**
   * Validate meal plan parameters before sending to backend
   * 
   * @returns {object} - { valid: boolean, errors: [] }
   */
  validateParams: (calorieTarget, gender, customMacros = null) => {
    const errors = [];

    // Validate calorie target
    if (!calorieTarget || calorieTarget < 1000 || calorieTarget > 5000) {
      errors.push('Calorie target must be between 1000 and 5000');
    }

    // Validate gender
    if (!gender || !['male', 'female'].includes(gender.toLowerCase())) {
      errors.push('Gender must be either male or female');
    }

    // Validate custom macros if provided
    if (customMacros) {
      if (customMacros.protein && (customMacros.protein < 30 || customMacros.protein > 500)) {
        errors.push('Protein must be between 30g and 500g');
      }
      if (customMacros.carbs && (customMacros.carbs < 50 || customMacros.carbs > 600)) {
        errors.push('Carbs must be between 50g and 600g');
      }
      if (customMacros.fat && (customMacros.fat < 20 || customMacros.fat > 300)) {
        errors.push('Fat must be between 20g and 300g');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};