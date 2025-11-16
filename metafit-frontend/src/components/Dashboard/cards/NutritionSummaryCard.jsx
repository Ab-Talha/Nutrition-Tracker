import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import axios from 'axios';
import { glassCardStyle } from '../styles/glassCard';

export function NutritionSummaryCard({ selectedDate = null }) {
  const { user } = useAuth();
  const userId = user?.UserID || user?.id;

  const [physicalInfo, setPhysicalInfo] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [expandMacros, setExpandMacros] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get date to fetch (use selectedDate or today)
  const dateToFetch = useMemo(() => {
    if (selectedDate) {
      if (selectedDate instanceof Date) {
        return selectedDate.toISOString().split('T')[0];
      }
      return selectedDate;
    }
    return new Date().toISOString().split('T')[0];
  }, [selectedDate]);

  // Fetch physical info for TDEE
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

  // Fetch daily nutrition summary
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

  // Fetch data on mount and when date changes
  useEffect(() => {
    fetchPhysicalInfo();
    fetchDailySummary();
  }, [fetchPhysicalInfo, fetchDailySummary]);

  // Calculate TDEE
  const calculateTDEE = (info) => {
    try {
      const weight = parseFloat(info.CurrentWeight);
      const height = parseFloat(info.Height);
      const dob = new Date(info.DOB);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const gender = info.Gender?.toLowerCase() || 'male';
      const activityLevel = info.ActivityLevel || 'Moderately Active';

      if (!weight || !height || age < 0 || age > 120) return 2500;

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
    } catch (err) {
      return 2500;
    }
  };

  // Get target calories based on goal
  const getTargetCalories = (tdee, goal) => {
    if (!goal) return tdee;

    const goalLower = goal.toLowerCase();

    if (goalLower.includes('weight loss')) {
      return Math.round(tdee - 500);
    } else if (goalLower.includes('weight gain')) {
      return Math.round(tdee + 400);
    } else if (goalLower.includes('muscle gain')) {
      return Math.round(tdee + 300);
    }

    return tdee;
  };

  // Calculate nutrition summary
  const nutritionSummary = useMemo(() => {
    if (!physicalInfo || !dailySummary) {
      return {
        totalCalories: 0,
        targetCalories: 2500,
        macros: [
          { label: 'Protein', value: 0 },
          { label: 'Carbs', value: 0 },
          { label: 'Fat', value: 0 }
        ]
      };
    }

    const tdee = calculateTDEE(physicalInfo);
    const targetCalories = getTargetCalories(tdee, physicalInfo.Goal);

    return {
      totalCalories: Math.round(dailySummary.TotalCalories || 0),
      targetCalories: targetCalories,
      macros: [
        { label: 'Protein', value: Math.round(dailySummary.TotalProtein || 0) },
        { label: 'Carbs', value: Math.round(dailySummary.TotalCarbs || 0) },
        { label: 'Fat', value: Math.round(dailySummary.TotalFat || 0) }
      ]
    };
  }, [physicalInfo, dailySummary]);

  // Loading state
  if (loading) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
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

  const percentage = (nutritionSummary.totalCalories / nutritionSummary.targetCalories) * 100;
  const remaining = nutritionSummary.targetCalories - nutritionSummary.totalCalories;
  const isOverLimit = remaining < 0;

  // Calculate macro percentages based on actual targets
  const proteinTarget = Math.round((0.27 * nutritionSummary.targetCalories) / 4);
  const carbsTarget = Math.round((0.45 * nutritionSummary.targetCalories) / 4);
  const fatTarget = Math.round((0.28 * nutritionSummary.targetCalories) / 9);

  const proteinPercent = (nutritionSummary.macros[0].value / proteinTarget) * 100;
  const carbsPercent = (nutritionSummary.macros[1].value / carbsTarget) * 100;
  const fatPercent = (nutritionSummary.macros[2].value / fatTarget) * 100;

  return (
    <div style={glassCardStyle}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>🍽️</span>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '700',
            margin: 0,
            color: '#9d4edd'
          }}>
            Nutrition Summary
          </h3>
        </div>
        <button
          onClick={() => setExpandMacros(!expandMacros)}
          style={{
            background: 'rgba(157, 78, 221, 0.15)',
            border: '1px solid rgba(157, 78, 221, 0.3)',
            color: '#9d4edd',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '700',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(157, 78, 221, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(157, 78, 221, 0.15)';
          }}
        >
          {expandMacros ? 'Less' : 'More'}
        </button>
      </div>

      {/* Alert Box */}
      {isOverLimit && (
        <div style={{
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '6px',
          padding: '10px 12px',
          marginBottom: '12px',
          fontSize: '11px',
          fontWeight: '700',
          color: '#ff6b6b'
        }}>
          ⚠️ Exceeded by {Math.abs(remaining).toFixed(0)} calories
        </div>
      )}

      {/* Calorie Bar */}
      <div style={{
        background: 'rgba(20, 20, 30, 0.5)',
        border: '1px solid rgba(157, 78, 221, 0.2)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '10px',
          fontWeight: '700',
          opacity: 0.6,
          marginBottom: '8px',
          color: '#b8a7d9',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Daily Calories
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '800',
            color: '#fff'
          }}>
            {nutritionSummary.totalCalories}
          </div>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: remaining > 0 ? '#84cd63' : '#ff6b6b'
          }}>
            {remaining > 0 ? `${remaining.toFixed(0)} cal remaining` : `${Math.abs(remaining).toFixed(0)} cal over`}
          </div>
        </div>
        <div style={{
          height: '65px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}>
          <div
            style={{
              background: 'linear-gradient(to top, #dd1c1a, #9d4edd)',
              height: `${Math.min(percentage, 100)}%`,
              transition: 'height 0.5s ease'
            }}
          ></div>
        </div>
      </div>

      {/* Macros List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{
          fontSize: '10px',
          fontWeight: '700',
          opacity: 0.6,
          color: '#b8a7d9',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Macronutrients
        </div>
        {nutritionSummary.macros.map((item, idx) => {
          const macroPercents = [proteinPercent, carbsPercent, fatPercent];
          const macroPercent = Math.min(macroPercents[idx], 100);
          const macroTargets = [proteinTarget, carbsTarget, fatTarget];
          const colors = [
            { bar: '#ff6b5b', label: 'Protein' },
            { bar: '#00d9ff', label: 'Carbs' },
            { bar: '#ffdb58', label: 'Fat' }
          ];

          return (
            <div key={idx}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700' }}>{item.label}</span>
              </div>
              <div style={{
                height: '6px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '4px'
              }}>
                <div style={{
                  height: '100%',
                  background: colors[idx].bar,
                  width: `${macroPercent}%`,
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                {item.value}g / {macroTargets[idx]}g
              </div>
            </div>
          );
        })}
      </div>

      {expandMacros && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(157, 78, 221, 0.2)',
          fontSize: '11px',
          opacity: 0.85
        }}>
          <p style={{
            margin: '0 0 8px 0',
            fontWeight: '700',
            color: '#9d4edd',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            💡 Tips
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.6' }}>
            <li>Maintain protein intake for muscle growth</li>
            <li>Balance carbs & fats for energy</li>
            <li>Track calories consistently daily</li>
          </ul>
        </div>
      )}
    </div>
  );
}