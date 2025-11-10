import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../Navigation/Sidebar';

function Dashboard({ user, onNavigate = () => {} }) {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [activeSidebarIcon, setActiveSidebarIcon] = useState('dashboard');

  // Mock weight data
  const weightData = [
    { day: 'Mon', weight: 71 },
    { day: 'Tue', weight: 70.5 },
    { day: 'Wed', weight: 71.2 },
    { day: 'Thu', weight: 70.8 },
    { day: 'Fri', weight: 70.6 },
    { day: 'Sat', weight: 70.3 },
    { day: 'Sun', weight: 70 }
  ];

  // Mock meals data
  const mealsData = [
    {
      name: 'Breakfast',
      items: [
        { food: 'Chicken', quantity: '120g' },
        { food: 'Rice', quantity: '350g' },
        { food: 'Dal', quantity: '50g' }
      ]
    },
    {
      name: 'Lunch',
      items: [
        { food: 'Bread', quantity: '100g' },
        { food: 'Fish', quantity: '150g' },
        { food: 'Egg', quantity: '50g' },
        { food: 'Apple', quantity: '110g' },
        { food: 'Banana', quantity: '40g' }
      ]
    },
    {
      name: 'Dinner',
      items: [
        { food: 'Grilled Chicken', quantity: '200g' },
        { food: 'Sweet Potato', quantity: '150g' },
        { food: 'Broccoli', quantity: '100g' }
      ]
    },
    {
      name: 'Extra Meal',
      items: [
        { food: 'Protein Shake', quantity: '30g' },
        { food: 'Almonds', quantity: '50g' }
      ]
    }
  ];

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const sidebarIcons = [
    { id: 'profile', emoji: '👤', title: 'Profile' },
    { id: 'dashboard', emoji: '📊', title: 'Dashboard' },
    { id: 'auto-meal', emoji: '🤖', title: 'Auto Meal' },
    { id: 'meal-entry', emoji: '🍽️', title: 'Meal Entry' },
    { id: 'workout', emoji: '💪', title: 'Workout' }
  ];

  const glassCardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <Sidebar activePage="dashboard" onNavigate={onNavigate} />
      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: '100px',
        padding: '25px 30px',
        overflowY: 'auto'
      }}>
        {/* Header */}
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

            {/* Day Selector */}
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
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

        {/* Dashboard Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 280px 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Profile Card */}
          <div style={glassCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '75px',
                height: '75px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0
              }}></div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '2px', margin: 0 }}>
                  {user?.Name || 'User'}
                </h2>
                <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>@{user?.Username || 'username'}</p>
              </div>
            </div>

            <div style={{
              marginTop: '14px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', fontWeight: '500' }}>
                Target:
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>
                Weight Loss
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px'
            }}>
              <div style={{
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>⚖️</div>
                <div style={{ fontSize: '12px', fontWeight: '700' }}>70.0</div>
              </div>
              <div style={{
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>📏</div>
                <div style={{ fontSize: '12px', fontWeight: '700' }}>150.0</div>
              </div>
              <div style={{
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>🔥</div>
                <div style={{ fontSize: '12px', fontWeight: '700' }}>2300 Cal</div>
              </div>
            </div>
          </div>

          {/* TDEE Card */}
          <div style={{
            ...glassCardStyle,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around'
          }}>
            {[
              { percent: '5%', label: 'EAT', value: '200 Cal' },
              { percent: '10%', label: 'TEF', value: '500 Cal' },
              { percent: '15%', label: 'NEAT', value: '700 Cal' },
              { percent: '70%', label: 'BMR', value: '2000 Cal', isLarge: true }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  padding: item.isLarge ? '10px' : '8px 0',
                  fontSize: '13px',
                  background: item.isLarge ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                  borderRadius: item.isLarge ? '8px' : '0'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '14px', minWidth: '40px' }}>
                  {item.percent}
                </div>
                <div style={{ fontWeight: '600', fontSize: '11px', minWidth: '50px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9, flex: 1, textAlign: 'right' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Macro Bars */}
          <div style={{...glassCardStyle}}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '12px'
            }}>
              {[
                { name: 'Protein', percent: 52, current: '78.0', target: '150.0', color: 'rgba(132, 204, 22, 0.9)' },
                { name: 'Carbs', percent: 56, current: '250.0', target: '450.0', color: 'rgba(34, 211, 238, 0.9)' },
                { name: 'Fat', percent: 67, current: '20.0', target: '30.0', color: 'rgba(239, 68, 68, 0.9)' },
                { name: 'Fiber', percent: 87, current: '26.0', target: '30.0', color: 'rgba(251, 146, 60, 0.9)' },
                { name: 'Sugar', percent: 77, current: '23.0', target: '30.0', color: 'rgba(250, 204, 21, 0.9)' },
                { name: 'Water', percent: 65, current: '2.6', target: '4.0', color: 'rgba(14, 165, 233, 0.9)' }
              ].map((macro, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '200px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    zIndex: 2
                  }}>
                    {macro.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      padding: '8px',
                      marginTop: 'auto',
                      height: `${macro.percent}%`,
                      background: macro.color,
                      transition: 'height 0.5s ease'
                    }}
                  >
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      {macro.current} of {macro.target}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Weight Chart */}
          <div style={{...glassCardStyle}}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.7)" />
                <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  fill="#f97316"
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Nutrition Summary */}
          <div style={{...glassCardStyle}}>
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
                    height: '97%',
                    transition: 'height 0.5s ease'
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>2235.0</div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>of 2300</div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {[
                { label: 'Protein', value: '78.0' },
                { label: 'Carbs', value: '250.0' },
                { label: 'Fat', value: '20.0' }
              ].map((item, idx) => (
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
        </div>

        {/* Meals Section */}
        <div style={{...glassCardStyle}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            {mealsData.map((meal, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '14px'
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  textAlign: 'center',
                  marginBottom: '12px',
                  color: '#85cc17'
                }}>
                  {meal.name}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '15px',
                  fontSize: '12px',
                  maxHeight: '160px',
                  overflowY: 'auto'
                }}>
                  <div style={{ flex: 1 }}>
                    {meal.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        style={{
                          padding: '3px 0',
                          opacity: 0.85,
                          lineHeight: '1.4'
                        }}
                      >
                        • {item.food}
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 0.6 }}>
                    {meal.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        style={{
                          padding: '3px 0',
                          opacity: 0.85,
                          lineHeight: '1.4',
                          textAlign: 'right'
                        }}
                      >
                        {item.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;