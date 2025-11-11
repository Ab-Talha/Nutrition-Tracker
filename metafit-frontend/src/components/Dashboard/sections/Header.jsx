import React, { useState } from 'react';
import { DatePicker } from '../cards/DatePicker';

export function Header({ user, days, selectedDay, onDayChange, onDateChange }) {
  // Convert day name to YYYY-MM-DD format
  const getDayDate = (dayName) => {
    const today = new Date();
    
    const dayOffset = {
      'Monday': -today.getDay() + 1,
      'Tuesday': -today.getDay() + 2,
      'Wednesday': -today.getDay() + 3,
      'Thursday': -today.getDay() + 4,
      'Friday': -today.getDay() + 5,
      'Saturday': -today.getDay() + 6,
      'Sunday': -today.getDay() + 0
    };

    const date = new Date(today);
    date.setDate(date.getDate() + (dayOffset[dayName] || 0));
    
    return date.toISOString().split('T')[0];
  };

  const selectedDate = getDayDate(selectedDay);

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
            Ready to track your fitness with swag? • {selectedDate}
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Date Picker */}
          <DatePicker 
            selectedDate={selectedDate} 
            onDateChange={onDateChange}
          />

          {/* Day Selector Buttons */}
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