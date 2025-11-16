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

  const dateToFetch = useMemo(() => {
    if (selectedDate) {
      if (selectedDate instanceof Date) {
        return selectedDate.toISOString().split('T')[0];
      }
      return selectedDate;
    }
    return new Date().toISOString().split('T')[0];
  }, [selectedDate]);

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

  const fetchDailySummary = useCallback(async () => {
    if (!userId) {
      setError('User ID not found');
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const nutritionApiUrl = process.env.REACT_APP_NUTRITION_API || 'http://localhost:8000/api/nutrition';
      const response = await axios.get(`${nutritionApiUrl}/logs/summary/?user_id=${userId}&date=${dateToFetch}`);

      if (response.data.success && response.data.data) {
        setDailySummary(response.data.data);
      } else {
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

  useEffect(() => {
    fetchPhysicalInfo();
    fetchDailySummary();
  }, [fetchPhysicalInfo, fetchDailySummary]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDailySummary();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchDailySummary, refreshInterval]);

  const tdee = useMemo(() => {
    if (!physicalInfo) return null;
    return calculateTDEE(physicalInfo);
  }, [physicalInfo]);

  const adjustedTdee = useMemo(() => {
    if (!tdee || !physicalInfo?.Goal) return tdee;
    return adjustTDEEForGoal(tdee, physicalInfo.Goal);
  }, [tdee, physicalInfo?.Goal]);

  const macroTargets = useMemo(() => {
    if (!adjustedTdee || !physicalInfo) return null;
    return calculateMacroTargets(adjustedTdee, physicalInfo.Gender);
  }, [adjustedTdee, physicalInfo]);

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

  const macroColors = {
    protein: '#ff6b5b',
    carbs: '#00d9ff',
    fat: '#ffdb58',
    fiber: '#84cd63',
    sugar: '#ff8c42'
  };

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

  if (loading) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderTop: '2px solid #9d4edd',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#ff6b6b' }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (!physicalInfo || !macroTargets || !tdee) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#ff6b6b' }}>
          No physical info available
        </div>
      </div>
    );
  }

  const totalCalories = Math.round(
    (intakeData.protein || 0) * 4 +
    (intakeData.carbs || 0) * 4 +
    (intakeData.fat || 0) * 9
  );
  const caloriePercent = (totalCalories / adjustedTdee) * 100;

  return (
    <div style={glassCardStyle}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            margin: 0,
            color: '#9d4edd'
          }}>
            📊 Daily Macro Targets
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: '600',
            background: 'rgba(157, 78, 221, 0.15)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(157, 78, 221, 0.3)'
          }}>
            <span>{goalInfo.icon}</span>
            <span>{goalInfo.label}</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          fontSize: '12px'
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '11px' }}>BMR</div>
            <div style={{ fontWeight: '700', fontSize: '14px' }}>{tdee}</div>
          </div>
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '11px' }}>Target</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#9d4edd' }}>{adjustedTdee}</div>
          </div>
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ opacity: 0.7, marginBottom: '4px', fontSize: '11px' }}>Consumed</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: totalCalories > adjustedTdee ? '#ff6b6b' : '#84cd63' }}>
              {totalCalories}
            </div>
          </div>
        </div>
      </div>



      {/* Macro Bars Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
        marginBottom: '14px',
        maxWidth: '100%'
      }}>
        {macroData.map((macro, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '200px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative',
              transition: 'all 0.3s ease',
              minWidth: '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.border = `1px solid ${macro.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)';
            }}
          >
            {/* Header */}
            <div style={{
              padding: '2px 10px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '700',
              borderBottom: `1px solid ${macro.color}40`,
              background: `${macro.color}10`
            }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>{macro.icon}</div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>{macro.name}</div>
            </div>

            {/* Bar Container */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(0, 0, 0, 0.3)',
              justifyContent: 'flex-end',
              padding: '8px',
              gap: '0'
            }}>
              <div
                style={{
                  background: macro.color,
                  width: '100%',
                  height: `${macro.percent}%`,
                  borderRadius: '6px',
                  transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: `0 0 12px ${macro.color}60`,
                  minHeight: macro.percent > 0 ? '4px' : '0'
                }}
              ></div>
            </div>

            {/* Footer with Values */}
            <div style={{
              padding: '1px 8px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.3)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '11px'
            }}>
              <div style={{ fontWeight: '800', fontSize: '13px', color: '#fff' }}>
                {Math.round(macro.current)}
              </div>
              <div style={{ opacity: 0.7, fontSize: '10px', marginTop: '3px' }}>
                / {macro.target}g
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1), rgba(157, 78, 221, 0.05))',
        border: '1px solid rgba(157, 78, 221, 0.2)',
        borderRadius: '8px',
        padding: '12px',
        textAlign: 'center',
        fontSize: '11px',
        fontWeight: '700'
      }}>
        <span style={{ color: '#b8a7d9' }}>TOTAL INTAKE: </span>
        <span style={{
          color: totalCalories > adjustedTdee ? '#ff6b6b' : '#84cd63'
        }}>
          {totalCalories} / {adjustedTdee} kcal
        </span>
      </div>
    </div>
  );
}