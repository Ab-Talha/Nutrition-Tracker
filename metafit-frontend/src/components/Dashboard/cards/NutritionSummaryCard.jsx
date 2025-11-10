import React from 'react';
import { glassCardStyle } from '../styles/glassCard';

export function NutritionSummaryCard({ nutritionSummary }) {
  const percentage = (nutritionSummary.totalCalories / nutritionSummary.targetCalories) * 100;

  return (
    <div style={glassCardStyle}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        margin: '0 0 12px 0'
      }}>
        Nutrition Summary
      </h3>

      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(251, 113, 133, 0.15))',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '12px'
      }}>
        <div style={{
          height: '70px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end'
        }}>
          <div
            style={{
              background: 'linear-gradient(to top, rgba(251, 113, 133, 0.9), rgba(251, 113, 133, 0.6))',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              height: `${percentage}%`,
              transition: 'height 0.5s ease'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '700' }}>{nutritionSummary.totalCalories}</div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>of {nutritionSummary.targetCalories}</div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {nutritionSummary.macros.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 0'
            }}
          >
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}