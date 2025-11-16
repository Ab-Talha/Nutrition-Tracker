import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth'; // Import your auth hook

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '20px',
  color: '#fff'
};

// BMI Calculation - FIXED
const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  
  // Height is in FEET, convert to meters first
  const heightInMeters = (height * 0.3048); // 1 foot = 0.3048 meters
  const bmi = weight / (heightInMeters * heightInMeters);
  
  return Math.round(bmi * 10) / 10;
};

// TDEE Calculation using Mifflin-St Jeor Formula
const calculateTDEE = (physicalInfo) => {
  try {
    const weight = parseFloat(physicalInfo.CurrentWeight);
    const height = parseFloat(physicalInfo.Height); // Height in FEET
    const dob = new Date(physicalInfo.DOB);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const gender = physicalInfo.Gender?.toLowerCase() || 'male';
    const activityLevel = physicalInfo.ActivityLevel || 'Moderately Active';

    if (!weight || !height || age < 0 || age > 120) {
      return null;
    }

    // Convert height to cm for BMR calculation
    const heightCm = height * 30.48;

    // Calculate BMR
    let bmr;
    if (gender === 'female' || gender === 'woman') {
      bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
    } else {
      bmr = (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
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
};

// Get TDEE Breakdown
const getTDEEBreakdown = (tdee) => {
  if (!tdee) return [];
 
  return [
    { percent: '40%', label: 'Maintenance', value: tdee },
    { percent: '35%', label: 'Mild Deficit', value: Math.round(tdee * 0.85) },
    { percent: '30%', label: 'Moderate Deficit', value: Math.round(tdee * 0.75) }
  ];
};

export function MergedProfileCard({ refreshInterval = 30000 }) {
  const { user } = useAuth(); // Get logged-in user from Auth Context
  
  const [hoveredStat, setHoveredStat] = useState(null);
  const [physicalInfo, setPhysicalInfo] = useState(null);
  const [calculatedBmi, setCalculatedBmi] = useState(null);
  const [calculatedTdee, setCalculatedTdee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get userId from logged-in user
  const userId = user?.UserID || user?.id || user?.user_id;

  // Fetch data from API
  const fetchData = useCallback(async () => {
    // Don't fetch if userId is not available
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
       
        // Calculate BMI
        const bmi = calculateBMI(data.CurrentWeight, data.Height);
        setCalculatedBmi(bmi);
       
        // Calculate TDEE
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

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  if (loading) {
    return (
      <div style={{
        ...glassCardStyle,
        minWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        ...glassCardStyle,
        minWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
          <div style={{ marginBottom: '10px' }}>⚠️ Error</div>
          <div style={{ fontSize: '12px', marginBottom: '15px' }}>{error}</div>
          <button
            onClick={fetchData}
            style={{
              padding: '8px 16px',
              background: '#85cc17',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!physicalInfo) {
    return (
      <div style={{
        ...glassCardStyle,
        minWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>No data available</div>
      </div>
    );
  }

  // Extract data from API
  const weight = physicalInfo.CurrentWeight;
  const height = physicalInfo.Height; // This is in FEET (5.5)
  const goal = physicalInfo.Goal;
  const targetWeight = physicalInfo.TargetWeight;
  const gender = physicalInfo.Gender;
  const activityLevel = physicalInfo.ActivityLevel;
  const displayName = user?.Name || user?.username || `User ${userId}`;

  // Convert height to different units - FIXED
  const heightFt = height.toFixed(2); // Already in feet: 5.50
  const heightM = (height * 0.3048).toFixed(2); // Convert feet to meters: 1.68
  const heightCm = (height * 30.48).toFixed(1); // Convert feet to cm: 167.6
  
  // Display height as feet and inches
  const feet = Math.floor(height);
  const inches = Math.round((height - feet) * 12);
  const heightDisplay = `${height.toFixed(1)} ft`;

  // BMI Category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  // TDEE Breakdown
  const tdeeBreakdown = calculatedTdee ? getTDEEBreakdown(calculatedTdee.tdee) : [];

  // Stat Box Component
  const StatBox = ({ icon, label, value, details, statKey }) => {
    const isHovered = hoveredStat === statKey;

    return (
      <div
        onMouseEnter={() => setHoveredStat(statKey)}
        onMouseLeave={() => setHoveredStat(null)}
        style={{
          background: isHovered ? 'rgba(132, 204, 22, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          padding: isHovered ? '12px' : '8px',
          borderRadius: '6px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          border: isHovered ? '2px solid rgba(132, 204, 22, 0.6)' : '1px solid transparent',
          position: 'relative'
        }}
      >
        <div style={{ fontSize: '12px', marginBottom: '3px' }}>{icon}</div>
        <div style={{ fontSize: isHovered ? '12px' : '11px', opacity: isHovered ? 1 : 0.7 }}>
          {label}
        </div>
        <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px', color: '#85cc17' }}>
          {value}
        </div>

        {isHovered && details && (
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid rgba(132, 204, 22, 0.6)',
              borderRadius: '8px',
              padding: '10px',
              whiteSpace: 'nowrap',
              zIndex: 100,
              fontSize: '11px',
              color: '#fff',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
              animation: 'slideUpTip 0.2s ease'
            }}
          >
            {details}
            <div
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid rgba(132, 204, 22, 0.6)'
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      ...glassCardStyle,
      minWidth: '560px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Two columns inside */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left Column - Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0
            }}></div>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px', margin: 0 }}>
                {displayName}
              </h2>
              <p style={{ fontSize: '10px', opacity: 0.6, margin: 0 }}>@user_{userId}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px'
          }}>
            <StatBox
              icon="⚖️"
              label="Weight"
              value={`${weight}kg`}
              details={`${(weight * 2.205).toFixed(1)} lbs`}
              statKey="weight"
            />
            <StatBox
              icon="📏"
              label="Height"
              value={heightDisplay}
              details={`${heightCm}cm • ${heightM}m`}
              statKey="height"
            />
            <StatBox
              icon="📊"
              label="BMI"
              value={calculatedBmi?.toFixed(1) || 'N/A'}
              details={calculatedBmi ? getBMICategory(calculatedBmi) : 'N/A'}
              statKey="bmi"
            />
          </div>

          {/* Goal */}
          <div
            onMouseEnter={() => setHoveredStat('goal')}
            onMouseLeave={() => setHoveredStat(null)}
            style={{
              background: hoveredStat === 'goal' ? 'linear-gradient(135deg, rgba(132, 204, 22, 0.4), rgba(132, 204, 22, 0.2))' : 'linear-gradient(135deg, rgba(132, 204, 22, 0.2), rgba(132, 204, 22, 0.1))',
              border: hoveredStat === 'goal' ? '1px solid rgba(132, 204, 22, 0.6)' : '1px solid rgba(132, 204, 22, 0.3)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: hoveredStat === 'goal' ? 'scale(1.02)' : 'scale(1)',
              position: 'relative'
            }}
          >
            <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>🎯 Target</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#85cc17' }}>{goal}</div>

            {hoveredStat === 'goal' && (
              <div
                style={{
                  position: 'absolute',
                  top: '-70px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '2px solid rgba(132, 204, 22, 0.6)',
                  borderRadius: '8px',
                  padding: '10px',
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  fontSize: '11px',
                  color: '#fff',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
                  animation: 'slideUpTip 0.2s ease'
                }}
              >
                Target: {targetWeight}kg
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid rgba(132, 204, 22, 0.6)'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - TDEE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 6px 0' }}>
            ⚡ Daily Target
          </h3>

          {tdeeBreakdown && tdeeBreakdown.length > 0 ? (
            tdeeBreakdown.map((item, idx) => {
              const isHovered = hoveredStat === `tdee-${idx}`;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredStat(`tdee-${idx}`)}
                  onMouseLeave={() => setHoveredStat(null)}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    padding: '8px',
                    background: isHovered ? 'rgba(132, 204, 22, 0.25)' : 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '6px',
                    borderLeft: isHovered ? '4px solid #85cc17' : '3px solid #85cc17',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
                  }}
                >
                  <div style={{ fontWeight: '700', minWidth: '28px', color: '#85cc17', fontSize: '11px' }}>
                    {item.percent}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '11px' }}>
                      {item.label}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', opacity: isHovered ? 1 : 0.9, fontWeight: '600' }}>
                    {item.value}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: '11px', opacity: 0.6, textAlign: 'center', padding: '20px' }}>
              TDEE data not available
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUpTip {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}