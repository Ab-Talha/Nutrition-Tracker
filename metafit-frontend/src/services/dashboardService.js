import { nutritionApi } from './api';
import api from './api';

export const dashboardService = {
  // ============================================
  // USER PROFILE & PHYSICAL INFO
  // ============================================

  getProfile: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/profile/`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Fetch profile error:', error);
      // Return empty object if profile doesn't exist
      return null;
    }
  },

  getPhysicalInfo: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/physical-info/`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Fetch physical info error:', error);
      throw error;
    }
  },

  updatePhysicalInfo: async (userId, data) => {
    try {
      const response = await api.put(`/api/users/${userId}/physical-info/`, data);
      return response.data;
    } catch (error) {
      console.error('Update physical info error:', error);
      throw error;
    }
  },

  // ============================================
  // WEIGHT HISTORY
  // ============================================

  getWeightHistory: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/weight-history/`);
      return response.data;
    } catch (error) {
      console.error('Fetch weight history error:', error);
      return [];
    }
  },

  addWeightEntry: async (userId, weight, notes = '') => {
    try {
      const response = await api.post(`/api/users/${userId}/weight-history/`, {
        Weight: weight,
        Notes: notes
      });
      return response.data;
    } catch (error) {
      console.error('Add weight entry error:', error);
      throw error;
    }
  },

  deleteWeightEntry: async (userId, weightId) => {
    try {
      const response = await api.delete(`/api/users/${userId}/weight-history/`, {
        data: { WeightID: weightId }
      });
      return response.data;
    } catch (error) {
      console.error('Delete weight entry error:', error);
      throw error;
    }
  },

  // ============================================
  // BMI CALCULATION
  // ============================================

  calculateBMI: (weight, height) => {
    /**
     * BMI = weight (kg) / (height (m))^2
     * height parameter should be in cm, convert to meters
     */
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10; // Round to 1 decimal
  },

  // ============================================
  // TDEE CALCULATION
  // ============================================

  /**
   * Calculate TDEE using Mifflin-St Jeor Formula
   * TDEE = BMR × Activity Level Factor
   *
   * BMR Formulas:
   * Male: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
   * Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
   *
   * Activity Level Factors:
   * Sedentary: 1.2
   * Lightly Active: 1.375
   * Moderately Active: 1.55
   * Very Active: 1.725
   * Extremely Active: 1.9
   */
  calculateTDEE: (physicalInfo) => {
    try {
      const weight = parseFloat(physicalInfo.CurrentWeight);
      const height = parseFloat(physicalInfo.Height);
      const dob = new Date(physicalInfo.DOB);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const gender = physicalInfo.Gender?.toLowerCase() || 'male';
      const activityLevel = physicalInfo.ActivityLevel || 'Moderately Active';

      if (!weight || !height || age < 0 || age > 120) {
        console.warn('Invalid physical info for TDEE calculation', {
          weight,
          height,
          age,
          dob: physicalInfo.DOB
        });
        return null;
      }

      // Calculate BMR using Mifflin-St Jeor Formula
      let bmr;
      if (gender === 'female' || gender === 'woman') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      }

      // Activity level multipliers
      const activityMultipliers = {
        'sedentary': 1.2,
        'lightly active': 1.375,
        'moderately active': 1.55,
        'very active': 1.725,
        'extremely active': 1.9
      };

      const multiplier = activityMultipliers[activityLevel.toLowerCase()] || 1.55;
      const tdee = Math.round(bmr * multiplier);

      return {
        bmr: Math.round(bmr),
        tdee,
        activityLevel,
        gender,
        age
      };
    } catch (error) {
      console.error('TDEE calculation error:', error);
      return null;
    }
  },

  /**
   * Get complete dashboard data with calculated TDEE and BMI
   */
  getDashboardData: async (userId) => {
    try {
      // Fetch physical info (required)
      const physicalInfo = await dashboardService.getPhysicalInfo(userId);

      if (!physicalInfo) {
        throw new Error('Physical information not found');
      }

      // Try to fetch profile data (optional)
      let profileData = await dashboardService.getProfile(userId);

      // Calculate BMI from weight and height
      const bmi = dashboardService.calculateBMI(
        physicalInfo.CurrentWeight,
        physicalInfo.Height
      );

      // Calculate TDEE
      const tdeeData = dashboardService.calculateTDEE(physicalInfo);

      // Merge profile data if available
      if (!profileData) {
        profileData = {};
      }

      return {
        profile: {
          ...profileData,
          BMI: bmi
        },
        physical: physicalInfo,
        tdee: tdeeData
      };
    } catch (error) {
      console.error('Get dashboard data error:', error);
      throw error;
    }
  },

  /**
   * Get TDEE breakdown for different caloric deficits
   */
  getTDEEBreakdown: (tdee) => {
    if (!tdee) return [];

    return [
      {
        percent: '40%',
        label: 'Maintenance',
        value: tdee,
        description: 'No deficit'
      },
      {
        percent: '35%',
        label: 'Mild Deficit',
        value: Math.round(tdee * 0.85),
        description: '~500 cal/week loss'
      },
      {
        percent: '30%',
        label: 'Moderate Deficit',
        value: Math.round(tdee * 0.75),
        description: '~1000 cal/week loss'
      }
    ];
  }
};