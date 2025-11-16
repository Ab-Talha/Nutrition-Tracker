import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';

// Mock service for demo - replace with actual import
// import { dashboardService } from '../services/dashboardService';
const dashboardService = {
  getDashboardData: async (userId) => {
    // Mock data for demo
    return {
      profile: { Name: 'John Doe', Username: 'johndoe', BMI: 24.5 },
      physical: { 
        CurrentWeight: 70, 
        Height: 175, 
        DOB: '1990-01-01', 
        Gender: 'Male',
        ActivityLevel: 'Moderately Active',
        Goal: 'Weight Loss',
        TargetWeight: 68
      },
      tdee: { tdee: 2500 }
    };
  },
  getTDEEBreakdown: (tdee) => [
    { percent: '40%', label: 'Maintenance', value: tdee },
    { percent: '35%', label: 'Mild Deficit', value: Math.round(tdee * 0.85) },
    { percent: '30%', label: 'Moderate Deficit', value: Math.round(tdee * 0.75) }
  ]
};

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '20px',
  color: '#fff'
};

export function MergedProfileCard({ user, tdeeData, bmi = 24.5, weight = 70, height = 150, userId = 1, refreshInterval = 30000 }) {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [physicalInfo, setPhysicalInfo] = useState(null);
  const [calculatedTdee, setCalculatedTdee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await dashboardService.getDashboardData(userId);
      setProfileData(data.profile);
      setPhysicalInfo(data.physical);
      setCalculatedTdee(data.tdee);
      setLoading(false);
    } catch (err) {
      setError(err.message);
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

  // Use API data if available, otherwise use props
  const displayUser = profileData || user;
  const displayWeight = physicalInfo?.CurrentWeight ?? weight;
  const displayHeight = physicalInfo?.Height ?? height;
  const displayBmi = profileData?.BMI ?? bmi;
  const displayGoal = physicalInfo?.Goal ?? 'Weight Loss';
  const displayTdeeData = calculatedTdee ? dashboardService.getTDEEBreakdown(calculatedTdee.tdee) : tdeeData;

  // Convert height to different units
  const heightCm = displayHeight;
  const heightM = (displayHeight / 100).toFixed(2);
  const heightFt = (displayHeight / 30.48).toFixed(2);
  const heightInches = ((displayHeight / 2.54) % 12).toFixed(1);

  // BMI Category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

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

        {/* Hover Tooltip */}
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

  if (loading) {
    return (
      <div style={{
        ...glassCardStyle,
        minWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
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
        justifyContent: 'space-between'
      }}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
          Error: {error}
        </div>
      </div>
    );
  }

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
                {displayUser?.Name || 'User'}
              </h2>
              <p style={{ fontSize: '10px', opacity: 0.6, margin: 0 }}>@{displayUser?.Username || 'username'}</p>
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
              value={`${displayWeight}kg`}
              details={`${(displayWeight * 2.205).toFixed(1)} lbs`}
              statKey="weight"
            />
            <StatBox
              icon="📏"
              label="Height"
              value={`${heightCm}cm`}
              details={`${heightFt}ft • ${heightM}m`}
              statKey="height"
            />
            <StatBox
              icon="📊"
              label="BMI"
              value={displayBmi.toFixed(1)}
              details={getBMICategory(displayBmi)}
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
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#85cc17' }}>{displayGoal}</div>

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
                Lose weight healthily
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

          {displayTdeeData && displayTdeeData.map((item, idx) => {
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
          })}
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