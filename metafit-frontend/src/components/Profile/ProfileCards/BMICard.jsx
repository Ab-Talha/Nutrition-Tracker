import React from 'react';
import { profileStyles } from '../ProfileStyles/profile.styles';
const API_BASE_URL = 'http://localhost:8000/api';

function BMICard({ data }) {
  const bmi = data?.physicalInfo?.BMI;
  const currentWeight = data?.physicalInfo?.CurrentWeight;
  const targetWeight = data?.physicalInfo?.TargetWeight;
  const weightDifference = currentWeight && targetWeight 
    ? (currentWeight - targetWeight).toFixed(1) 
    : 0;

  const getBMIColor = (bmi) => {
    if (!bmi) return '#888';
    if (bmi < 18.5) return '#3b82f6'; // Underweight
    if (bmi < 25) return '#85cc17'; // Normal
    if (bmi < 30) return '#f59e0b'; // Overweight
    return '#ef4444'; // Obese
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return 'N/A';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal Weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  return (
    <div style={profileStyles.card}>
      <h2 style={profileStyles.cardTitle}>📊 Health Metrics</h2>

      <div style={profileStyles.grid2}>
        {/* BMI */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          border: `2px solid ${getBMIColor(bmi)}`
        }}>
          <p style={{
            fontSize: '13px',
            color: '#aaa',
            margin: '0 0 10px 0',
            fontWeight: '500'
          }}>BMI</p>
          <p style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: getBMIColor(bmi),
            margin: '0 0 5px 0'
          }}>{bmi || 'N/A'}</p>
          <p style={{
            fontSize: '13px',
            color: '#fff',
            margin: 0
          }}>{getBMIStatus(bmi)}</p>
        </div>

        {/* Weight Progress */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          border: '2px solid #3b82f6'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#aaa',
            margin: '0 0 10px 0',
            fontWeight: '500'
          }}>Weight Progress</p>
          <p style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#3b82f6',
            margin: '0 0 5px 0'
          }}>{weightDifference} kg</p>
          <p style={{
            fontSize: '12px',
            color: '#fff',
            margin: 0
          }}>
            {weightDifference > 0 ? '⬆️ More than target' : '⬇️ Less than target'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BMICard;