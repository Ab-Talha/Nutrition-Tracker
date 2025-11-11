import { useState, useEffect } from 'react';
import { foodService } from '../services/foodService';

/**
 * Custom hook to manage meal data fetching and updates
 * @param {number} userId - User ID
 * @param {string} mealType - Meal type (Breakfast, Lunch, Dinner, Snack)
 * @param {string} date - Date in YYYY-MM-DD format
 */
export const useMealData = (userId, mealType, date) => {
  const [mealLogs, setMealLogs] = useState([]);
  const [foodDatabase, setFoodDatabase] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all foods to build a lookup database
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const foods = await foodService.getAllFoods();
        const foodMap = {};
        foods.forEach(food => {
          foodMap[food.FoodID] = food;
        });
        setFoodDatabase(foodMap);
      } catch (err) {
        console.error('Error fetching food database:', err);
        setError('Failed to load food database');
      }
    };

    fetchFoods();
  }, []);

  // Fetch meal logs for the specified meal type and date
  useEffect(() => {
    const fetchMealLogs = async () => {
      if (!userId || !mealType || !date) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const logs = await foodService.getMealTypeLogs(userId, mealType, date);
        
        // Enrich logs with food data
        const enrichedLogs = logs.map(log => ({
          ...log,
          foodData: foodDatabase[log.FoodID] || null
        }));

        setMealLogs(enrichedLogs);
        setError(null);
      } catch (err) {
        console.error('Error fetching meal logs:', err);
        setError('Failed to load meal logs');
        setMealLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMealLogs();
  }, [userId, mealType, date, foodDatabase]);

  // Add a new food log
  const addFoodLog = async (foodId, quantity) => {
    try {
      const newLog = {
        UserID: userId,
        FoodID: foodId,
        Quantity: quantity,
        Unit: 'g', // Default unit, adjust as needed
        MealType: mealType,
        LogDateTime: `${date}T12:00:00Z`
      };

      await foodService.logMeal(userId, mealType, `${date}T12:00:00Z`, [newLog]);

      // Add to local state
      const foodData = foodDatabase[foodId];
      setMealLogs([
        ...mealLogs,
        {
          ...newLog,
          foodData
        }
      ]);

      return true;
    } catch (err) {
      console.error('Error adding food log:', err);
      setError('Failed to add food log');
      return false;
    }
  };

  // Update a food log
  const updateFoodLog = async (logId, quantity) => {
    try {
      await foodService.updateFoodLog(logId, { Quantity: quantity });

      // Update local state
      setMealLogs(
        mealLogs.map(log =>
          log.LogID === logId ? { ...log, Quantity: quantity } : log
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating food log:', err);
      setError('Failed to update food log');
      return false;
    }
  };

  // Delete a food log
  const deleteFoodLog = async (logId) => {
    try {
      await foodService.deleteFoodLog(logId);

      // Remove from local state
      setMealLogs(mealLogs.filter(log => log.LogID !== logId));

      return true;
    } catch (err) {
      console.error('Error deleting food log:', err);
      setError('Failed to delete food log');
      return false;
    }
  };

  // Calculate total nutrition for the meal
  const calculateTotalNutrition = () => {
    return foodService.calculateTotalNutrition(mealLogs);
  };

  // Calculate nutrition for a specific log
  const calculateNutrition = (logId) => {
    const log = mealLogs.find(l => l.LogID === logId);
    if (!log) return { protein: 0, carbs: 0, fat: 0, calories: 0 };
    return foodService.calculateNutritionForLog(log.foodData, log.Quantity);
  };

  return {
    mealLogs,
    foodDatabase,
    loading,
    error,
    addFoodLog,
    updateFoodLog,
    deleteFoodLog,
    calculateTotalNutrition,
    calculateNutrition
  };
};