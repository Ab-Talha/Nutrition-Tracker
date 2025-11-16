import React from 'react';
import { profileStyles } from '../ProfileStyles/profile.styles';
const API_BASE_URL = 'http://localhost:8000/api';

function ActivityLevelCard({ data }) {
  const activityLevel = data?.physicalInfo?.ActivityLevel;

  const getActivityDescription = (level) => {
    const descriptions = {
      'Sedentary': 'Little or no exercise',
      'Lightly Active': 'Exercise 1-3 days per week',
      'Moderately Active': 'Exercise 3-5 days per week',
      'Very Active': 'Exercise 6-7 days per week',
      'Extremely Active': 'Physical job or very intense exercise'
    };
    return descriptions[level] || 'Not specified';
  };

  const getActivityEmoji = (level) => {
    const emojis = {
      'Sedentary': '🪑',
      'Lightly Active': '🚶',
      'Moderately Active': '🏃',
      'Very Active': '🏋️',
      'Extremely Active': '🤸'
    };
    return emojis[level] || '❓';
  };

  return (
    <div style={profileStyles.card}>
      <h2 style={profileStyles.cardTitle}>💪 Activity Level</h2>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        border: '2px solid #667eea'
      }}>
        <p style={{
          fontSize: '48px',
          margin: '0 0 10px 0'
        }}>
          {getActivityEmoji(activityLevel)}
        </p>
        <p style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#fff',
          margin: '0 0 5px 0'
        }}>
          {activityLevel || 'Not specified'}
        </p>
        <p style={{
          fontSize: '13px',
          color: '#aaa',
          margin: 0
        }}>
          {getActivityDescription(activityLevel)}
        </p>
      </div>
    </div>
  );
}

export default ActivityLevelCard;