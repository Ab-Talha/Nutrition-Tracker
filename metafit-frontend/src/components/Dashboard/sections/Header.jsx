import React from 'react';

export function Header({ user, days, selectedDay, onDayChange }) {
  return (
    <div style={{ marginBottom: '25px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '30px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '5px',
            letterSpacing: '-0.5px',
            color: '#fff',
            margin: 0
          }}>
            Welcome back, {user?.Name || 'User'}!
          </h1>
          <p style={{
            fontSize: '16px',
            opacity: 0.75,
            fontWeight: '400',
            color: '#fff',
            margin: 0
          }}>
            Ready to track your fitness with swag?
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {days.map(day => (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              style={{
                padding: '8px 18px',
                background: selectedDay === day ? 'rgba(133, 204, 23, 0.5)' : 'rgba(59, 130, 246, 0.4)',
                border: selectedDay === day ? '2px solid #85cc17' : '2px solid transparent',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (selectedDay !== day) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.6)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDay !== day) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}