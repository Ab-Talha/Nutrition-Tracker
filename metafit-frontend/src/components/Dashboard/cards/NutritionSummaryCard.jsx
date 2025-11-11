import React, { useState } from 'react';
import { glassCardStyle } from '../styles/glassCard';

export function NutritionSummaryCard({ nutritionSummary }) {
  const [expandMacros, setExpandMacros] = useState(false);
  const percentage = (nutritionSummary.totalCalories / nutritionSummary.targetCalories) * 100;
  const remaining = nutritionSummary.targetCalories - nutritionSummary.totalCalories;
  const isOverLimit = remaining < 0;

  return (
    <div style={glassCardStyle}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '700',
          margin: 0
        }}>
          🍽️ Nutrition Summary
        </h3>
        <button
          onClick={() => setExpandMacros(!expandMacros)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.3s'
          }}
        >
          {expandMacros ? 'Less' : 'More'}
        </button>
      </div>

      {/* Alert Box */}
      {isOverLimit && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(251, 113, 133, 0.2))',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '8px',
          padding: '8px',
          marginBottom: '12px',
          fontSize: '11px',
          fontWeight: '600',
          color: '#fca5a5'
        }}>
          ⚠️ Exceeded by {Math.abs(remaining).toFixed(0)} calories
        </div>
      )}

      {/* Calorie Bar */}
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
              height: `${Math.min(percentage, 100)}%`,
              transition: 'height 0.5s ease'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '700' }}>{nutritionSummary.totalCalories}</div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>of {nutritionSummary.targetCalories}</div>
          </div>
        </div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '6px', textAlign: 'center' }}>
          {remaining > 0 ? `${remaining.toFixed(0)} cal remaining` : `${Math.abs(remaining).toFixed(0)} cal over`}
        </div>
      </div>

      {/* Macros List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {nutritionSummary.macros.map((item, idx) => {
          const macroPercent = (idx === 0 ? 52 : idx === 1 ? 56 : 67);
          return (
            <div key={idx}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '4px'
                }}
              >
                <span>{item.label}</span>
                <span>{item.value}g</span>
              </div>
              <div style={{
                height: '6px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: idx === 0 ? 'rgba(132, 204, 22, 0.8)' : idx === 1 ? 'rgba(34, 211, 238, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                  width: `${macroPercent}%`,
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {expandMacros && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '11px',
          opacity: 0.8
        }}>
          <p style={{ margin: '0 0 8px 0' }}>💡 Tips:</p>
          <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.6' }}>
            <li>Maintain protein intake</li>
            <li>Balance carbs & fats</li>
            <li>Drink more water</li>
          </ul>
        </div>
      )}
    </div>
  );
}