// src/components/AutoMeal/pages/FoodBrowser.jsx

import React, { useState, useEffect } from 'react';
import { autoMealService } from '../../../services/autoMealService';

function FoodBrowser({ onSwitchTab = () => {} }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState([]);

  // Fetch foods on mount
  useEffect(() => {
    fetchAllFoods();
  }, []);

  const fetchAllFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await autoMealService.getAllFoods(100, 0);
      setFoods(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      fetchAllFoods();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await autoMealService.searchFoods(query);
      setFoods(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFoodSelection = (food) => {
    setSelectedFoods(prev => {
      const exists = prev.find(f => f.FoodID === food.FoodID);
      if (exists) {
        return prev.filter(f => f.FoodID !== food.FoodID);
      } else {
        return [...prev, food];
      }
    });
  };

  const calculateTotalMacros = () => {
    return selectedFoods.reduce((total, food) => {
      return {
        calories: total.calories + food.Calories,
        protein: total.protein + food.Protein,
        carbs: total.carbs + food.Carbs,
        fat: total.fat + food.Fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const macros = calculateTotalMacros();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Full Width */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '30px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '2.2rem',
            color: '#fff',
            margin: '0 0 5px 0',
            fontWeight: '700'
          }}>
            🔍 Food Browser
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.95rem',
            margin: '0'
          }}>
            Browse and explore foods from our database
          </p>
        </div>

        <button
          onClick={() => onSwitchTab('meal-plan')}
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
            whiteSpace: 'nowrap',
            flexShrink: 0,
            marginLeft: '20px'
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
          <span>←</span>
          Back to Meal Plan
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: '40px 40px',
        flex: 1,
        overflow: 'auto',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '2rem',
            color: '#fff',
            margin: '0 0 10px 0',
            fontWeight: '700'
          }}>
            🔍 Food Browser
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.95rem',
            margin: '0'
          }}>
            Browse and explore foods from our database
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '30px', maxWidth: '600px' }}>
          <input
            type="text"
            placeholder="Search foods... (e.g., chicken, apple, bread)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.12)';
              e.target.style.borderColor = '#85cc17';
              e.target.style.boxShadow = '0 0 20px rgba(133, 204, 23, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '5px 10px',
                transition: 'all 0.3s ease'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '15px 20px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            padding: '40px',
            fontSize: '1.1rem'
          }}>
            ⏳ Loading foods...
          </div>
        )}

        {/* Foods Grid */}
        {!loading && foods.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {foods.map(food => (
              <div
                key={food.FoodID}
                onClick={() => toggleFoodSelection(food)}
                style={{
                  background: selectedFoods.find(f => f.FoodID === food.FoodID)
                    ? 'rgba(133, 204, 23, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: selectedFoods.find(f => f.FoodID === food.FoodID)
                    ? '1px solid #85cc17'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  boxShadow: selectedFoods.find(f => f.FoodID === food.FoodID)
                    ? '0 0 20px rgba(133, 204, 23, 0.2)'
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!selectedFoods.find(f => f.FoodID === food.FoodID)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedFoods.find(f => f.FoodID === food.FoodID)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Food Name */}
                <h3 style={{
                  margin: '0 0 4px 0',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {food.FoodName}
                </h3>

                {/* Brand */}
                <span style={{
                  display: 'inline-block',
                  marginBottom: '10px',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {food.BrandName}
                </span>

                {/* Macros Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  margin: '12px 0'
                }}>
                  {[
                    { label: 'Cal', value: Math.round(food.Calories) },
                    { label: 'P', value: `${food.Protein}g` },
                    { label: 'C', value: `${food.Carbs}g` },
                    { label: 'F', value: `${food.Fat}g` }
                  ].map((macro, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '8px',
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginBottom: '2px',
                        fontWeight: '500'
                      }}>
                        {macro.label}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#85cc17'
                      }}>
                        {macro.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quantity */}
                <div style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  padding: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px',
                  textAlign: 'center',
                  marginTop: '8px'
                }}>
                  {food.Quantity} {food.Unit}
                </div>

                {/* Selected Badge */}
                {selectedFoods.find(f => f.FoodID === food.FoodID) && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#85cc17',
                    color: '#1a1a2e',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && foods.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '1.1rem'
          }}>
            🔍 No foods found. Try a different search.
          </div>
        )}

        {/* Selected Foods Summary */}
        {selectedFoods.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '25px',
            position: 'sticky',
            bottom: '0'
          }}>
            <h2 style={{
              margin: '0 0 15px 0',
              color: '#fff',
              fontSize: '1.2rem'
            }}>
              Selected Foods ({selectedFoods.length})
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '15px',
              marginTop: '20px'
            }}>
              <div style={{
                background: 'rgba(133, 204, 23, 0.1)',
                border: '1px solid rgba(133, 204, 23, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.85rem',
                  marginBottom: '8px'
                }}>
                  Calories
                </div>
                <div style={{
                  color: '#85cc17',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {Math.round(macros.calories)}
                </div>
              </div>

              <div style={{
                background: 'rgba(133, 204, 23, 0.1)',
                border: '1px solid rgba(133, 204, 23, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.85rem',
                  marginBottom: '8px'
                }}>
                  Protein
                </div>
                <div style={{
                  color: '#85cc17',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {macros.protein.toFixed(1)}g
                </div>
              </div>

              <div style={{
                background: 'rgba(133, 204, 23, 0.1)',
                border: '1px solid rgba(133, 204, 23, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.85rem',
                  marginBottom: '8px'
                }}>
                  Carbs
                </div>
                <div style={{
                  color: '#85cc17',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {macros.carbs.toFixed(1)}g
                </div>
              </div>

              <div style={{
                background: 'rgba(133, 204, 23, 0.1)',
                border: '1px solid rgba(133, 204, 23, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.85rem',
                  marginBottom: '8px'
                }}>
                  Fat
                </div>
                <div style={{
                  color: '#85cc17',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {macros.fat.toFixed(1)}g
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedFoods([])}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
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
              Clear Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FoodBrowser;