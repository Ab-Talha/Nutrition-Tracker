// src/components/AutoMeal/AutoMeal.jsx

import React, { useState, useEffect } from 'react';
import { autoMealService } from '../../services/autoMealService';

function AutoMeal() {
  const [foods, setFoods] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('foods');
  const [selectedFoods, setSelectedFoods] = useState([]);

  const userId = localStorage.getItem('userID');

  // Fetch foods on mount
  useEffect(() => {
    fetchAllFoods();
    if (userId) {
      fetchPresets();
    }
  }, [userId]);

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

  const fetchPresets = async () => {
    try {
      const response = await autoMealService.getPresetMeals(userId);
      setPresets(response.data || []);
    } catch (err) {
      console.error('Error fetching presets:', err);
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
        return [...prev, { ...food, selectedQuantity: food.Quantity }];
      }
    });
  };

  const calculateTotalMacros = () => {
    return selectedFoods.reduce((total, food) => {
      const quantity = food.selectedQuantity || food.Quantity;
      const multiplier = quantity / food.Quantity;
      
      return {
        calories: total.calories + (food.Calories * multiplier),
        protein: total.protein + (food.Protein * multiplier),
        carbs: total.carbs + (food.Carbs * multiplier),
        fat: total.fat + (food.Fat * multiplier)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const macros = calculateTotalMacros();

  if (!userId) {
    return (
      <div style={{
        marginLeft: '100px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        padding: '40px 30px',
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
          Please log in to use Auto Meal feature
        </div>
      </div>
    );
  }

  return (
    <div style={{
      marginLeft: '100px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
      padding: '40px 30px',
      paddingBottom: selectedFoods.length > 0 ? '600px' : '40px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', maxWidth: '1400px', margin: '0 auto 40px auto', width: '100%' }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#fff',
          margin: '0 0 10px 0',
          fontWeight: '700'
        }}>🤖 Auto Meal</h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '1rem',
          margin: '0'
        }}>Build your meal by selecting foods from the database</p>
      </div>

      {/* Main Content Wrapper */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '10px',
          width: 'fit-content'
        }}>
          {['foods', 'presets'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                border: activeTab === tab ? '2px solid #85cc17' : '2px solid transparent',
                background: activeTab === tab ? 'rgba(133, 204, 23, 0.15)' : 'transparent',
                color: activeTab === tab ? '#85cc17' : 'rgba(255, 255, 255, 0.6)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              {tab === 'foods' ? `📍 All Foods (${foods.length})` : `⭐ Saved Presets (${presets.length})`}
            </button>
          ))}
        </div>

        {/* Foods Tab */}
        {activeTab === 'foods' && (
          <div>
            {/* Search */}
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

            {/* Error */}
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

            {/* Loading */}
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
          </div>
        )}

        {/* Presets Tab */}
        {activeTab === 'presets' && (
          <div>
            {presets.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px'
              }}>
                {presets.map(preset => (
                  <div
                    key={preset.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = '#85cc17';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.1rem' }}>
                      {preset.Name}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(133, 204, 23, 0.2)',
                      color: '#85cc17',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {preset.MealType}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '1.1rem'
              }}>
                ⭐ No saved presets yet
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Panel - Fixed Bottom */}
      {selectedFoods.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '100px',
          right: '0',
          background: 'rgba(20, 20, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '30px',
          maxHeight: '550px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: '#fff',
              fontSize: '1.3rem'
            }}>
              Selected Foods ({selectedFoods.length})
            </h2>

            {/* Selected Foods List */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {selectedFoods.map(food => (
                <div
                  key={food.FoodID}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    gap: '15px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0', color: '#fff', fontSize: '0.9rem' }}>
                      {food.FoodName}
                    </h4>
                    <span style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '2px'
                    }}>
                      {food.selectedQuantity || food.Quantity} {food.Unit}
                    </span>
                  </div>
                  <div style={{ color: '#85cc17', fontWeight: '600', minWidth: '60px', textAlign: 'right' }}>
                    {Math.round(food.Calories)} cal
                  </div>
                  <button
                    onClick={() => toggleFoodSelection(food)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Macros Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {[
                { label: 'Calories', value: macros.calories.toFixed(0) },
                { label: 'Protein', value: `${macros.protein.toFixed(1)}g` },
                { label: 'Carbs', value: `${macros.carbs.toFixed(1)}g` },
                { label: 'Fat', value: `${macros.fat.toFixed(1)}g` }
              ].map((macro, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(133, 204, 23, 0.1)',
                    border: '1px solid rgba(133, 204, 23, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8rem',
                    marginBottom: '6px'
                  }}>
                    {macro.label}
                  </div>
                  <div style={{
                    color: '#85cc17',
                    fontSize: '1.3rem',
                    fontWeight: '700'
                  }}>
                    {macro.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <button
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #85cc17 0%, #6ba312 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#1a1a2e',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                💾 Save Preset
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                📝 Log Meal
              </button>
              <button
                onClick={() => setSelectedFoods([])}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutoMeal;