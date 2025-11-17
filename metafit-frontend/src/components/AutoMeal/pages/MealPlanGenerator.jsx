// src/components/AutoMeal/pages/MealPlanGenerator.jsx

import React, { useState } from 'react';
import { useMealPlanGenerator } from '../hooks/useMealPlanGenerator';
import MealPlanForm from '../components/MealPlanForm';
import LoadingAnimation from '../components/LoadingAnimation';
import DayCard from '../components/DayCard';
import NutritionSummary from '../components/NutritionSummary';

function MealPlanGenerator({ onSwitchTab = () => {} }) {
  const userId = localStorage.getItem('userID');
  const { mealPlan, loading, error, generatingDays, generate, reset } = useMealPlanGenerator();

  const handleGeneratePlan = async (formData) => {
    await generate(
      userId,
      formData.calorieTarget,
      formData.gender,
      formData.customMacros
    );
  };

  const handleRegenerate = () => {
    reset();
  };

  if (!userId) {
    return (
      <div style={{
        marginLeft: '100px',
        padding: '40px 30px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '20px 30px',
          borderRadius: '10px',
          fontSize: '1.1rem'
        }}>
          Please log in to use this feature
        </div>
      </div>
    );
  }

  return (
    <div style={{
      marginLeft: '100px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
      padding: '0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Full Width */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '30px 40px',
        marginBottom: '0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#fff',
            margin: '0 0 5px 0',
            fontWeight: '700'
          }}>
            📊 Meal Plan Generator
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.95rem',
            margin: '0'
          }}>
            Generate your personalized 7-day nutrition plan
          </p>
        </div>

        <button
          onClick={() => onSwitchTab('food-browser')}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>🔍</span>
          Food Browser
        </button>
      </div>

      {/* Main Content - Full Height */}
      <div style={{
        flex: 1,
        padding: '30px 40px',
        overflow: 'hidden',
        display: 'flex'
      }}>
        {/* Left Column - Form */}
        <div style={{
          width: '360px',
          marginRight: '30px',
          flexShrink: 0
        }}>
          <MealPlanForm
            onSubmit={handleGeneratePlan}
            loading={loading}
            error={error}
          />

          {mealPlan && !loading && (
            <button
              onClick={handleRegenerate}
              style={{
                width: '100%',
                marginTop: '15px',
                padding: '12px 20px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              🔄 Regenerate Plan
            </button>
          )}
        </div>

        {/* Right Column - Results - Scrollable */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          paddingRight: '15px',
          scrollbarWidth: 'thin'
        }}>
          {loading && <LoadingAnimation generatingDays={generatingDays} />}

          {mealPlan && !loading && (
            <>
              {/* 7-Day Meal Plan */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{
                  color: '#fff',
                  fontSize: '1.4rem',
                  margin: '0 0 18px 0',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  📅 7-Day Meal Plan
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '15px'
                }}>
                  {mealPlan.meal_plan.map((day) => (
                    <DayCard
                      key={day.day}
                      day={day.day}
                      date={day.date}
                      meals={day.meals}
                      dailyTotals={day.daily_totals}
                      validation={day.validation}
                    />
                  ))}
                </div>
              </div>

              {/* Weekly Summary */}
              <div style={{ marginBottom: '30px' }}>
                <NutritionSummary
                  targetMacros={mealPlan.target_macros}
                  weeklySummary={mealPlan.weekly_summary}
                />
              </div>

              {/* Food Variety Stats */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '25px'
              }}>
                <h3 style={{
                  color: '#fff',
                  fontSize: '1.2rem',
                  margin: '0 0 18px 0',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  🥗 Food Variety
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '12px'
                }}>
                  {Object.entries(mealPlan.variety_stats).slice(0, 14).map(([foodId, count]) => (
                    <div
                      key={foodId}
                      style={{
                        background: 'rgba(133, 204, 23, 0.1)',
                        border: '1px solid rgba(133, 204, 23, 0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(133, 204, 23, 0.15)';
                        e.currentTarget.style.borderColor = '#85cc17';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(133, 204, 23, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(133, 204, 23, 0.2)';
                      }}
                    >
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                        marginBottom: '6px',
                        fontWeight: '600'
                      }}>
                        Food ID: {foodId}
                      </div>
                      <div style={{
                        color: '#85cc17',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        marginBottom: '4px'
                      }}>
                        {count}×
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '0.7rem'
                      }}>
                        times/week
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '18px',
                  padding: '12px',
                  background: 'rgba(133, 204, 23, 0.08)',
                  borderRadius: '8px',
                  color: '#85cc17',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Total unique foods: {Object.keys(mealPlan.variety_stats).length} 🎯
                </div>
              </div>

              {/* Spacer for scrolling */}
              <div style={{ height: '20px' }} />
            </>
          )}

          {!loading && !mealPlan && !error && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '80px 40px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.8 }}>
                📋
              </div>
              <p style={{ fontSize: '1.1rem', margin: '0', lineHeight: '1.6' }}>
                Fill out the form and click<br />
                <span style={{ color: '#85cc17', fontWeight: '600' }}>
                  "Generate Meal Plan"
                </span>
                <br />
                to get started!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(133, 204, 23, 0.4);
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #85cc17;
        }
      `}</style>
    </div>
  );
}

export default MealPlanGenerator;