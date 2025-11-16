import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import axios from 'axios';

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '20px',
  color: '#fff'
};

// Calculate TDEE (Mifflin-St Jeor Formula)
const calculateTDEE = (physicalInfo) => {
  try {
    const weight = parseFloat(physicalInfo.CurrentWeight);
    const height = parseFloat(physicalInfo.Height);
    const dob = new Date(physicalInfo.DOB);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const gender = physicalInfo.Gender?.toLowerCase() || 'male';
    const activityLevel = physicalInfo.ActivityLevel || 'Moderately Active';

    if (!weight || !height || age < 0 || age > 120) {
      return null;
    }

    const heightCm = height * 30.48;

    let bmr;
    if (gender === 'female' || gender === 'woman') {
      bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
    } else {
      bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
    }

    const activityMultipliers = {
      'sedentary': 1.2,
      'lightly active': 1.375,
      'moderately active': 1.55,
      'very active': 1.725,
      'extremely active': 1.9
    };

    const multiplier = activityMultipliers[activityLevel.toLowerCase()] || 1.55;
    const tdee = Math.round(bmr * multiplier);

    return tdee;
  } catch (error) {
    console.error('TDEE calculation error:', error);
    return null;
  }
};

// Adjust TDEE based on goal
const adjustTDEEForGoal = (tdee, goal) => {
  if (!tdee || !goal) return tdee;

  const goalLower = goal.toLowerCase();

  if (goalLower.includes('weight loss')) {
    return Math.round(tdee - 500);
  } else if (goalLower.includes('weight gain')) {
    return Math.round(tdee + 400);
  } else if (goalLower.includes('maintain')) {
    return tdee;
  } else if (goalLower.includes('muscle gain')) {
    return Math.round(tdee + 300);
  }

  return tdee;
};

// Calculate macro targets based on adjusted TDEE and gender
const calculateMacroTargets = (adjustedTdee, gender) => {
  if (!adjustedTdee || adjustedTdee <= 0) return null;

  const isMale = gender?.toLowerCase() === 'male';

  if (isMale) {
    return {
      protein: Math.round((0.27 * adjustedTdee) / 4),
      carbs: Math.round((0.45 * adjustedTdee) / 4),
      fat: Math.round((0.28 * adjustedTdee) / 9),
      fiber: Math.round(0.012 * adjustedTdee),
      sugar: Math.round(0.012 * adjustedTdee)
    };
  } else {
    return {
      protein: Math.round((0.23 * adjustedTdee) / 4),
      carbs: Math.round((0.47 * adjustedTdee) / 4),
      fat: Math.round((0.30 * adjustedTdee) / 9),
      fiber: Math.round(0.014 * adjustedTdee),
      sugar: Math.round(0.010 * adjustedTdee)
    };
  }
};

export function MacroBarsCard({ refreshInterval = 30000, selectedDate = null }) {
  const { user } = useAuth();
  const userId = user?.UserID || user?.id;

  const [physicalInfo, setPhysicalInfo] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get date to fetch (use selectedDate or today)
  const dateToFetch = useMemo(() => {
    if (selectedDate) {
      // If date is provided, format it as YYYY-MM-DD
      if (selectedDate instanceof Date) {
        return selectedDate.toISOString().split('T')[0];
      }
      return selectedDate; // Assume it's already formatted
    }
    // Default to today
    return new Date().toISOString().split('T')[0];
  }, [selectedDate]);

  // Fetch physical info from API
  const fetchPhysicalInfo = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/${userId}/physical-info/`);

      if (response.data.success && response.data.data) {
        setPhysicalInfo(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching physical info:', err);
    }
  }, [userId]);

  // Fetch daily nutrition summary from API
  const fetchDailySummary = useCallback(async () => {
    if (!userId) {
      setError('User ID not found');
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Call the nutrition API directly (not the users API)
      // Correct endpoint: api/nutrition/logs/summary/
      const nutritionApiUrl = process.env.REACT_APP_NUTRITION_API || 'http://localhost:8000/api/nutrition';
      const response = await axios.get(`${nutritionApiUrl}/logs/summary/?user_id=${userId}&date=${dateToFetch}`);

      if (response.data.success && response.data.data) {
        setDailySummary(response.data.data);
      } else {
        // If no data for this date, set default zeros
        setDailySummary({
          TotalCalories: 0,
          TotalProtein: 0,
          TotalCarbs: 0,
          TotalFat: 0,
          TotalFiber: 0,
          TotalSugar: 0
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching daily summary:', err);
      // Set default values if error
      setDailySummary({
        TotalCalories: 0,
        TotalProtein: 0,
        TotalCarbs: 0,
        TotalFat: 0,
        TotalFiber: 0,
        TotalSugar: 0
      });
      setLoading(false);
    }
  }, [userId, dateToFetch]);

  // Initial fetch
  useEffect(() => {
    fetchPhysicalInfo();
    fetchDailySummary();
  }, [fetchPhysicalInfo, fetchDailySummary]);

  // Auto-refresh to get updated meal data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDailySummary();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchDailySummary, refreshInterval]);

  // Calculate TDEE
  const tdee = useMemo(() => {
    if (!physicalInfo) return null;
    return calculateTDEE(physicalInfo);
  }, [physicalInfo]);

  // Adjust TDEE based on goal
  const adjustedTdee = useMemo(() => {
    if (!tdee || !physicalInfo?.Goal) return tdee;
    return adjustTDEEForGoal(tdee, physicalInfo.Goal);
  }, [tdee, physicalInfo?.Goal]);

  // Calculate macro targets
  const macroTargets = useMemo(() => {
    if (!adjustedTdee || !physicalInfo) return null;
    return calculateMacroTargets(adjustedTdee, physicalInfo.Gender);
  }, [adjustedTdee, physicalInfo]);

  // Current intake from API
  const intakeData = useMemo(() => {
    if (!dailySummary) {
      return {
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
      };
    }

    return {
      protein: dailySummary.TotalProtein || 0,
      carbs: dailySummary.TotalCarbs || 0,
      fat: dailySummary.TotalFat || 0,
      fiber: dailySummary.TotalFiber || 0,
      sugar: dailySummary.TotalSugar || 0
    };
  }, [dailySummary]);

  // Macro color scheme
  const macroColors = {
    protein: '#ff6b6b',
    carbs: '#4ecdc4',
    fat: '#ffd93d',
    fiber: '#6bcf7f',
    sugar: '#ff8c42'
  };

  // Get goal info
  const getGoalInfo = () => {
    const goal = physicalInfo?.Goal || '';
    const goalLower = goal.toLowerCase();

    if (goalLower.includes('weight loss')) {
      return { icon: '📉', label: 'Weight Loss', surplus: -500 };
    } else if (goalLower.includes('weight gain')) {
      return { icon: '📈', label: 'Weight Gain', surplus: +400 };
    } else if (goalLower.includes('muscle gain')) {
      return { icon: '💪', label: 'Muscle Gain', surplus: +300 };
    } else {
      return { icon: '⚖️', label: 'Maintain Weight', surplus: 0 };
    }
  };

  const goalInfo = getGoalInfo();

  // Build macro data array
  const macroData = useMemo(() => {
    if (!macroTargets) return [];

    return [
      {
        name: 'Protein',
        icon: '🥚',
        current: intakeData.protein || 0,
        target: macroTargets.protein,
        color: macroColors.protein,
        percent: Math.min((intakeData.protein || 0) / macroTargets.protein * 100, 100)
      },
      {
        name: 'Carbs',
        icon: '🌾',
        current: intakeData.carbs || 0,
        target: macroTargets.carbs,
        color: macroColors.carbs,
        percent: Math.min((intakeData.carbs || 0) / macroTargets.carbs * 100, 100)
      },
      {
        name: 'Fat',
        icon: '🧈',
        current: intakeData.fat || 0,
        target: macroTargets.fat,
        color: macroColors.fat,
        percent: Math.min((intakeData.fat || 0) / macroTargets.fat * 100, 100)
      },
      {
        name: 'Fiber',
        icon: '🥬',
        current: intakeData.fiber || 0,
        target: macroTargets.fiber,
        color: macroColors.fiber,
        percent: Math.min((intakeData.fiber || 0) / macroTargets.fiber * 100, 100)
      },
      {
        name: 'Sugar',
        icon: '🍬',
        current: intakeData.sugar || 0,
        target: macroTargets.sugar,
        color: macroColors.sugar,
        percent: Math.min((intakeData.sugar || 0) / macroTargets.sugar * 100, 100)
      }
    ];
  }, [macroTargets, intakeData]);

  // Loading state
  if (loading) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#ff6b6b' }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  // No data state
  if (!physicalInfo || !macroTargets || !tdee) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#ff6b6b' }}>
          No physical info available
        </div>
      </div>
    );
  }

  return (
    <div style={glassCardStyle}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#fff' }}>
          📊 Daily Macro Targets
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          opacity: 0.8
        }}>
          <span>{physicalInfo.Gender === 'Male' ? '👨' : '👩'} {physicalInfo.Gender}</span>
          <span>{goalInfo.icon} {goalInfo.label}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
          fontSize: '11px',
          opacity: 0.7
        }}>
          <span>Maintenance: {tdee} kcal</span>
          <span style={{ color: goalInfo.surplus > 0 ? '#4ade80' : goalInfo.surplus < 0 ? '#ff6b6b' : '#85cc17' }}>
            Target: {adjustedTdee} kcal
            {goalInfo.surplus !== 0 && ` (${goalInfo.surplus > 0 ? '+' : ''} ${goalInfo.surplus})`}
          </span>
        </div>
      </div>

      {/* Macro Bars Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px'
      }}>
        {macroData.map((macro, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column-reverse',
              height: '220px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              minHeight: '220px'
            }}
          >
            {/* Macro Name */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '700',
              zIndex: 2,
              color: '#fff'
            }}>
              {macro.icon} {macro.name}
            </div>

            {/* Progress Bar (fills from bottom) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '8px',
                height: `${macro.percent}%`,
                background: macro.color,
                transition: 'height 0.5s ease',
                opacity: 0.85,
                minHeight: macro.percent > 0 ? '20px' : '0px',
                width: '100%'
              }}
            >
            </div>

            {/* Always show target at bottom */}
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              textAlign: 'center',
              padding: '10px 6px',
              color: '#85cc17',
              background: 'rgba(0, 0, 0, 0.3)',
              width: '100%',
              lineHeight: '1.5',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700' }}>
                {Math.round(macro.current)}
              </div>
              <div style={{ fontSize: '9px', opacity: 0.9 }}>
                / {macro.target}g
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Info */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(132, 204, 22, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#85cc17',
        textAlign: 'center',
        fontWeight: '600'
      }}>
        Total: {Math.round(
          (intakeData.protein || 0) * 4 +
          (intakeData.carbs || 0) * 4 +
          (intakeData.fat || 0) * 9
        )} / {adjustedTdee} kcal
      </div>
    </div>
  );
}