// src/components/AutoMeal/components/LoadingAnimation.jsx

import React, { useState, useEffect } from 'react';

function LoadingAnimation({ generatingDays = [] }) {
  const [dotAnimation, setDotAnimation] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDotAnimation(prev => {
        if (prev === '   ') return '';
        if (prev === '  ') return '   ';
        if (prev === ' ') return '  ';
        return ' ';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '40px',
      marginBottom: '30px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '2.5rem',
        marginBottom: '20px',
        animation: 'spin 2s linear infinite',
        display: 'inline-block',
        style: { '@keyframes spin': { 'from': { 'transform': 'rotate(0deg)' }, 'to': { 'transform': 'rotate(360deg)' } } }
      }}>
        ⏳
      </div>

      <h2 style={{
        color: '#fff',
        fontSize: '1.5rem',
        margin: '20px 0',
        fontWeight: '600'
      }}>
        Generating Your Meal Plan{dotAnimation}
      </h2>

      <p style={{
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.95rem',
        marginBottom: '30px'
      }}>
        Our AI is creating your personalized 7-day nutrition plan
      </p>

      {/* Day Progress */}
      <div style={{
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {[1, 2, 3, 4, 5, 6, 7].map(day => (
          <div
            key={day}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px',
              marginBottom: '8px',
              background: generatingDays.includes(day) 
                ? 'rgba(133, 204, 23, 0.1)' 
                : 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Status Icon */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: '600',
              background: generatingDays.includes(day)
                ? '#85cc17'
                : 'rgba(255, 255, 255, 0.1)',
              color: generatingDays.includes(day)
                ? '#1a1a2e'
                : 'rgba(255, 255, 255, 0.5)'
            }}>
              {generatingDays.includes(day) ? '✓' : day}
            </div>

            {/* Label */}
            <span style={{
              flex: 1,
              textAlign: 'left',
              color: generatingDays.includes(day)
                ? '#85cc17'
                : 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Day {day}
            </span>

            {/* Animation */}
            {!generatingDays.includes(day) && day === Math.max(...generatingDays, 0) + 1 && (
              <div style={{
                display: 'flex',
                gap: '3px'
              }}>
                {[0, 1, 2].map(dot => (
                  <div
                    key={dot}
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'rgba(133, 204, 23, 0.6)',
                      animation: `pulse 1.5s ease-in-out ${dot * 0.2}s infinite`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        marginTop: '30px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        height: '4px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #85cc17 0%, #6ba312 100%)',
            width: `${(generatingDays.length / 7) * 100}%`,
            transition: 'width 0.3s ease',
            borderRadius: '4px'
          }}
        />
      </div>

      <p style={{
        marginTop: '20px',
        fontSize: '0.85rem',
        color: 'rgba(255, 255, 255, 0.4)'
      }}>
        {generatingDays.length} of 7 days generated
      </p>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingAnimation;