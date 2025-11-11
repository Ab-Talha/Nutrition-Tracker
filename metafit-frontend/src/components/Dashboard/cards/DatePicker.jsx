import React, { useState } from 'react';

export function DatePicker({ selectedDate, onDateChange }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Parse selectedDate (YYYY-MM-DD format)
  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  const selectedDateObj = parseDate(selectedDate);

  // Get all days in the current month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateChange(formatDateString(newDate));
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  // Create array of day cells
  const dayCells = [];
  for (let i = 0; i < firstDay; i++) {
    dayCells.push(null); // Empty cells before month starts
  }
  for (let day = 1; day <= daysInMonth; day++) {
    dayCells.push(day);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Date Display Button */}
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        style={{
          padding: '8px 16px',
          background: 'rgba(132, 204, 22, 0.3)',
          border: '1px solid rgba(132, 204, 22, 0.5)',
          borderRadius: '8px',
          color: '#85cc17',
          fontWeight: '600',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(132, 204, 22, 0.5)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(132, 204, 22, 0.3)'}
      >
        📅 {selectedDate}
      </button>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowCalendar(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99
            }}
          />

          {/* Calendar */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              zIndex: 100,
              minWidth: '300px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header with Month/Year and Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <button
                onClick={handlePrevMonth}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                ◀
              </button>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#85cc17'
              }}>
                {monthName}
              </div>
              <button
                onClick={handleNextMonth}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                ▶
              </button>
            </div>

            {/* Day Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
              marginBottom: '12px'
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    opacity: 0.6,
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px'
            }}>
              {dayCells.map((day, idx) => {
                const isToday = day && new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString() === new Date().toDateString();
                const isSelected = day && formatDateString(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)) === selectedDate;

                return (
                  <button
                    key={idx}
                    onClick={() => day && handleDateClick(day)}
                    disabled={!day}
                    style={{
                      height: '36px',
                      background: isSelected
                        ? 'rgba(132, 204, 22, 0.7)'
                        : isToday
                        ? 'rgba(59, 130, 246, 0.4)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected
                        ? '2px solid #85cc17'
                        : isToday
                        ? '1px solid rgba(59, 130, 246, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: day ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      opacity: day ? 1 : 0
                    }}
                    onMouseEnter={(e) => {
                      if (day && !isSelected) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (day && !isSelected) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick Select Buttons */}
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => {
                  const today = new Date();
                  onDateChange(formatDateString(today));
                  setShowCalendar(false);
                }}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: 'rgba(132, 204, 22, 0.3)',
                  border: 'none',
                  color: '#85cc17',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(132, 204, 22, 0.5)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(132, 204, 22, 0.3)'}
              >
                Today
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  onDateChange(formatDateString(yesterday));
                  setShowCalendar(false);
                }}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                Yesterday
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}