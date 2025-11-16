import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '20px',
  color: '#fff'
};

const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = (height * 0.3048);
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
};

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
};

const getTDEEBreakdown = (tdee) => {
  if (!tdee) return [];
  return [
    { percent: '40%', label: 'Maintenance', value: tdee },
    { percent: '35%', label: 'Mild Deficit', value: Math.round(tdee * 0.85) },
    { percent: '30%', label: 'Moderate Deficit', value: Math.round(tdee * 0.75) }
  ];
};

export function MergedProfileCard({ refreshInterval = 30000 }) {
  const { user } = useAuth();
  
  const [physicalInfo, setPhysicalInfo] = useState(null);
  const [calculatedBmi, setCalculatedBmi] = useState(null);
  const [calculatedTdee, setCalculatedTdee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = user?.UserID || user?.id || user?.user_id;

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('User ID not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await api.get(`/${userId}/physical-info/`);
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setPhysicalInfo(data);
        const bmi = calculateBMI(data.CurrentWeight, data.Height);
        setCalculatedBmi(bmi);
        const tdee = calculateTDEE(data);
        setCalculatedTdee(tdee);
      } else {
        setError('Invalid response from server');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load data');
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  if (loading) {
    return (
      <div style={{
        ...glassCardStyle,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '280px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderTop: '2px solid #9d4edd',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        ...glassCardStyle,
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '10px' }}>⚠️ {error}</div>
        <button
          onClick={fetchData}
          style={{
            padding: '6px 12px',
            background: '#85cc17',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '700'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!physicalInfo) {
    return <div style={{ ...glassCardStyle, textAlign: 'center', padding: '20px', fontSize: '12px' }}>No data available</div>;
  }

  const weight = physicalInfo.CurrentWeight;
  const height = physicalInfo.Height;
  const goal = physicalInfo.Goal;
  const targetWeight = physicalInfo.TargetWeight;
  const displayName = user?.Name || user?.username || `User ${userId}`;
  const heightDisplay = `${height.toFixed(1)} ft`;
  const weightDifference = targetWeight ? (weight - targetWeight).toFixed(1) : 0;

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const tdeeBreakdown = calculatedTdee ? getTDEEBreakdown(calculatedTdee.tdee) : [];

  return (
    <div style={glassCardStyle}>
      {/* Left Section - Profile & Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '18px'
      }}>
        
        {/* LEFT COLUMN */}
        <div>
          {/* User Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0
            }}></div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0, marginBottom: '2px' }}>
                {displayName}
              </h2>
              <p style={{ fontSize: '10px', opacity: 0.6, margin: 0 }}>@user_{userId}</p>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '14px'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(157, 78, 221, 0.2)',
              borderRadius: '8px',
              padding: '14px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '5px' }}>⚖️</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#85cc17' }}>
                {weight}kg
              </div>
              <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '3px' }}>Weight</div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(157, 78, 221, 0.2)',
              borderRadius: '8px',
              padding: '14px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '5px' }}>📏</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#85cc17' }}>
                {heightDisplay}
              </div>
              <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '3px' }}>Height</div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(157, 78, 221, 0.2)',
              borderRadius: '8px',
              padding: '14px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '5px' }}>📊</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#85cc17' }}>
                {calculatedBmi?.toFixed(1) || 'N/A'}
              </div>
              <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '3px' }}>BMI</div>
            </div>
          </div>

          {/* Additional Info Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '14px'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(157, 78, 221, 0.2)',
              borderRadius: '8px',
              padding: '12px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>Category</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#9d4edd' }}>
                {calculatedBmi ? getBMICategory(calculatedBmi) : 'N/A'}
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(157, 78, 221, 0.2)',
              borderRadius: '8px',
              padding: '12px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>Activity</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#9d4edd' }}>
                {calculatedTdee?.activityLevel?.split(' ')[0] || 'N/A'}
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(157, 78, 221, 0.2)',
              borderRadius: '8px',
              padding: '12px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>Age</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#9d4edd' }}>
                {calculatedTdee?.age || 'N/A'}
              </div>
            </div>
          </div>

          {/* Goal Button */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.2), rgba(157, 78, 221, 0.1))',
            border: '1px solid rgba(157, 78, 221, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
              🎯 Goal
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#85cc17' }}>
              {goal}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - TDEE */}
        <div>
          {/* TDEE Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '16px' }}>⚡</span>
            <h3 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#9d4edd' }}>
              Daily Target
            </h3>
          </div>

          {/* TDEE Breakdown */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '14px'
          }}>
            {tdeeBreakdown.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(157, 78, 221, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(157, 78, 221, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(157, 78, 221, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(157, 78, 221, 0.2)';
                }}
              >
                <div>
                  <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '3px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#9d4edd' }}>
                    {item.percent}
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#85cc17' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.1), rgba(132, 204, 22, 0.05))',
            border: '1px solid rgba(132, 204, 22, 0.2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
              📈 Summary
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>BMR</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#85cc17' }}>
                {calculatedTdee?.bmr || 'N/A'} kcal
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>TDEE</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#85cc17' }}>
                {calculatedTdee?.tdee || 'N/A'} kcal
              </span>
            </div>
            {targetWeight && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(132, 204, 22, 0.2)',
                paddingTop: '8px'
              }}>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>To Target</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: weightDifference > 0 ? '#ff6b6b' : '#84cd63'
                }}>
                  {Math.abs(weightDifference)}kg
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}