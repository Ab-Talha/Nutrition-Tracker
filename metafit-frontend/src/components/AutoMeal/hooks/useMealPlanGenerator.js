// src/components/AutoMeal/hooks/useMealPlanGenerator.js

import { useState, useCallback } from 'react';
import { mealPlanService } from '../../../services/mealPlanService';

export const useMealPlanGenerator = () => {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingDays, setGeneratingDays] = useState([]);

  /**
   * Generate meal plan with streaming effect
   * Simulates real-time generation by progressively showing days
   */
  const generate = useCallback(async (userId, calorieTarget, gender, customMacros = null) => {
    try {
      setLoading(true);
      setError(null);
      setMealPlan(null);
      setGeneratingDays([]);

      // Validate inputs
      const validation = mealPlanService.validateParams(calorieTarget, gender, customMacros);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return null;
      }

      // Call API
      const result = await mealPlanService.generateMealPlan(
        userId,
        calorieTarget,
        gender,
        customMacros
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate meal plan');
      }

      // Simulate streaming effect: show days one by one
      setMealPlan(result);
      
      // Animate days appearing
      const mealPlanCopy = { ...result };
      for (let i = 0; i < result.meal_plan.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay between days
        setGeneratingDays(prev => [...prev, i + 1]);
      }

      return result;
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate meal plan';
      setError(errorMsg);
      console.error('Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setMealPlan(null);
    setLoading(false);
    setError(null);
    setGeneratingDays([]);
  }, []);

  /**
   * Regenerate with new parameters
   */
  const regenerate = useCallback(async (userId, calorieTarget, gender, customMacros = null) => {
    reset();
    return generate(userId, calorieTarget, gender, customMacros);
  }, [generate, reset]);

  return {
    mealPlan,
    loading,
    error,
    generatingDays,
    generate,
    regenerate,
    reset
  };
};