// src/components/AutoMeal/components/DayCard.jsx

import React, { useState } from 'react';
import MealDetails from './MealDetails';

function DayCard({ day, date, meals, dailyTotals, validation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine validation status color
  const getStatusColor = () => {
    if (validation?.is_valid) {
      return '#85cc17'; // Green
    } else if (validation?.warnings?.length > 0) {
      return '#fbbf24'; // Yellow
    } else {
      return '#f87171'; // Red
    }
  };

  const statusColor = getStatusColor();

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${statusColor}40`,
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '15px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.borderColor = `${statusColor}60`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = `${statusColor}40`;
      }}
    >
      {/* Header - Click to expand */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isExpanded ? `1px solid rgba(255, 255, 255, 0.1)` : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Left Side - Day Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Status Indicator */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}80`,
              flexShrink: 0
            }}
          />

          {/* Day Label */}
          <div>
            <h3 style={{
              margin: '0',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              Day {day}
            </h3>
            <p style={{
              margin: '2px 0 0 0',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.8rem'
            }}>
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Middle - Quick Totals */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, auto)',
          gap: '15px',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem',
              marginBottom: '2px'
            }}>
              Cal
            </div>
            <div style={{
              color: '#85cc17',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {Math.round(dailyTotals?.calories || 0)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem',
              marginBottom: '2px'
            }}>
              P
            </div>
            <div style={{
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {dailyTotals?.protein?.toFixed(0)}g
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem',
              marginBottom: '2px'
            }}>
              C
            </div>
            <div style={{
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {dailyTotals?.carbs?.toFixed(0)}g
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem',
              marginBottom: '2px'
            }}>
              F
            </div>
            <div style={{
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {dailyTotals?.fat?.toFixed(0)}g
            </div>
          </div>
        </div>

        {/* Right Side - Expand Icon */}
        <div
          style={{
            fontSize: '1.2rem',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            marginLeft: '15px'
          }}
        >
          ▼
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          style={{
            padding: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'slideDown 0.3s ease'
          }}
        >
          {/* Meals */}
          <MealDetails meals={meals} />

          {/* Daily Summary */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(133, 204, 23, 0.05)',
            border: '1px solid rgba(133, 204, 23, 0.2)',
            borderRadius: '8px'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              color: '#85cc17',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              📊 Daily Totals
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  Calories
                </div>
                <div style={{ color: '#85cc17', fontWeight: '600', fontSize: '1.1rem' }}>
                  {Math.round(dailyTotals?.calories || 0)}
                </div>
              </div>

              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  Protein
                </div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>
                  {dailyTotals?.protein?.toFixed(1)}g
                </div>
              </div>

              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  Carbs
                </div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>
                  {dailyTotals?.carbs?.toFixed(1)}g
                </div>
              </div>

              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  Fat
                </div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>
                  {dailyTotals?.fat?.toFixed(1)}g
                </div>
              </div>

              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  Fiber
                </div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>
                  {dailyTotals?.fiber?.toFixed(1)}g
                </div>
              </div>

              <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                  Sugar
                </div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>
                  {dailyTotals?.sugar?.toFixed(1)}g
                </div>
              </div>
            </div>
          </div>

          {/* Validation Messages */}
          {validation && (
            <div style={{ marginTop: '15px' }}>
              {validation.errors && validation.errors.length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '10px',
                  marginBottom: '10px',
                  fontSize: '0.8rem',
                  color: '#fca5a5'
                }}>
                  {validation.errors.map((error, idx) => (
                    <div key={idx}>❌ {error}</div>
                  ))}
                </div>
              )}

              {validation.warnings && validation.warnings.length > 0 && (
                <div style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '0.8rem',
                  color: '#fcd34d'
                }}>
                  {validation.warnings.map((warning, idx) => (
                    <div key={idx}>⚠️ {warning}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CSS for animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default DayCard;