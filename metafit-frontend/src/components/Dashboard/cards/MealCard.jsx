// ============================================
// File: components/Dashboard/cards/MealCard.jsx
// PART 1: Imports, State, and Handler Functions
// ============================================
import React, { useState } from 'react';
import { useMealData } from '../../../hooks/useMealData';
import { foodService } from '../../../services/foodService';

export function MealCard({ userId, mealType, date, mealName, onUpdate }) {
  const {
    mealLogs,
    foodDatabase,
    loading,
    error,
    addFoodLog,
    updateFoodLog,
    deleteFoodLog,
    calculateTotalNutrition,
    calculateNutrition
  } = useMealData(userId, mealType, date);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState({});
  const [newFood, setNewFood] = useState({ foodId: '', quantity: '' });
  const [showNewFoodInput, setShowNewFoodInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // HANDLER FUNCTIONS
  // ============================================

  // Search foods
  const handleSearchFoods = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await foodService.searchFoods(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Select food from search
  const handleSelectFood = (food) => {
    setNewFood({ ...newFood, foodId: food.FoodID });
    setSearchQuery(food.FoodName);
    setShowSearch(false);
  };

  // Add new food log
  const handleAddFood = async () => {
    if (!newFood.foodId || !newFood.quantity) return;

    try {
      setIsSubmitting(true);
      await addFoodLog(newFood.foodId, parseFloat(newFood.quantity));
      setNewFood({ foodId: '', quantity: '' });
      setSearchQuery('');
      setShowNewFoodInput(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error adding food:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update food quantity
  const handleUpdateQuantity = (logId, newQuantity) => {
    setEditedQuantities({
      ...editedQuantities,
      [logId]: newQuantity
    });
  };

  // Save quantity changes
  const handleSaveEdit = async () => {
    try {
      setIsSubmitting(true);
      
      for (const [logId, quantity] of Object.entries(editedQuantities)) {
        await updateFoodLog(parseInt(logId), parseFloat(quantity));
      }

      setEditedQuantities({});
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error saving edits:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete food log
  const handleDeleteFood = async (logId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setIsSubmitting(true);
        await deleteFoodLog(logId);
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error('Error deleting food:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditedQuantities({});
    setIsEditing(false);
    setShowNewFoodInput(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const totalNutrition = calculateTotalNutrition();

  // ============================================
  // PART 2: MINI VIEW (Dashboard Card)
  // ============================================
  return (
    <>
      {/* Mini Card View */}
      <div
        onClick={() => setIsModalOpen(true)}
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '14px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          opacity: loading ? 0.6 : 1
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(132, 204, 22, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Meal Name */}
        <div style={{
          fontSize: '16px',
          fontWeight: '700',
          textAlign: 'center',
          color: '#85cc17',
          marginBottom: '10px'
        }}>
          {mealName}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            padding: '20px 0'
          }}>
            Loading...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#ef4444',
            padding: '20px 0'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Quick Nutrition Summary */}
        {!loading && !error && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              marginBottom: '10px',
              fontSize: '10px'
            }}>
              <div style={{
                background: 'rgba(132, 204, 22, 0.2)',
                border: '1px solid rgba(132, 204, 22, 0.4)',
                padding: '6px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ opacity: 0.7, marginBottom: '2px' }}>P</div>
                <div style={{ fontWeight: '700', fontSize: '10px' }}>{totalNutrition.protein}g</div>
              </div>
              <div style={{
                background: 'rgba(34, 211, 238, 0.2)',
                border: '1px solid rgba(34, 211, 238, 0.4)',
                padding: '6px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ opacity: 0.7, marginBottom: '2px' }}>C</div>
                <div style={{ fontWeight: '700', fontSize: '10px' }}>{totalNutrition.carbs}g</div>
              </div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '6px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ opacity: 0.7, marginBottom: '2px' }}>F</div>
                <div style={{ fontWeight: '700', fontSize: '10px' }}>{totalNutrition.fat}g</div>
              </div>
              <div style={{
                background: 'rgba(251, 146, 60, 0.2)',
                border: '1px solid rgba(251, 146, 60, 0.4)',
                padding: '6px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ opacity: 0.7, marginBottom: '2px' }}>Cal</div>
                <div style={{ fontWeight: '700', fontSize: '10px' }}>{totalNutrition.calories}</div>
              </div>
            </div>

            {/* Food Items Preview */}
            <div style={{
              fontSize: '11px',
              opacity: 0.8,
              maxHeight: '80px',
              overflowY: 'auto'
            }}>
              {mealLogs.slice(0, 3).map((log) => {
                const foodName = log.foodData?.FoodName || 'Unknown';
                return (
                  <div key={log.LogID} style={{ marginBottom: '4px' }}>
                    • {foodName} ({log.Quantity}g)
                  </div>
                );
              })}
              {mealLogs.length > 3 && (
                <div style={{ opacity: 0.6, fontStyle: 'italic' }}>
                  +{mealLogs.length - 3} more items...
                </div>
              )}
            </div>
          </>
        )}

        {/* Click to expand indicator */}
        <div style={{
          marginTop: '8px',
          textAlign: 'center',
          fontSize: '11px',
          opacity: 0.6,
          fontStyle: 'italic'
        }}>
          Click to view details →
        </div>
      </div>

      {/* PART 3 will go here (Modal View) */}

      {/* ============================================
          PART 3: MODAL VIEW (Detailed)
          ============================================ */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => !isSubmitting && setIsModalOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9999,
              animation: 'fadeIn 0.3s ease'
            }}
          />

          {/* Modal Container */}
          <div
            style={{
              position: 'fixed',
              top: '-100%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '30px',
              zIndex: 10000,
              maxWidth: '600px',
              width: '90%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
              animation: 'slideUp 0.3s ease'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#85cc17',
                margin: 0
              }}>
                {mealName}
              </h2>
              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.background = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
              >
                ✕
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#fca5a5',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13px'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Total Nutrition Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'rgba(132, 204, 22, 0.15)',
                border: '2px solid rgba(132, 204, 22, 0.4)',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Protein</div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{totalNutrition.protein}g</div>
              </div>
              <div style={{
                background: 'rgba(34, 211, 238, 0.15)',
                border: '2px solid rgba(34, 211, 238, 0.4)',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Carbs</div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{totalNutrition.carbs}g</div>
              </div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Fat</div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{totalNutrition.fat}g</div>
              </div>
              <div style={{
                background: 'rgba(251, 146, 60, 0.15)',
                border: '2px solid rgba(251, 146, 60, 0.4)',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Calories</div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{totalNutrition.calories}</div>
              </div>
            </div>

            {/* Edit/View Toggle */}
            {!isEditing && !loading && (
              <button
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(59, 130, 246, 0.5)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '20px',
                  transition: 'all 0.3s',
                  opacity: isSubmitting ? 0.5 : 1
                }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.background = 'rgba(59, 130, 246, 0.7)')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.background = 'rgba(59, 130, 246, 0.5)')}
              >
                ✏️ Edit Meal
              </button>
            )}

            {/* Food Items List */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                margin: '0 0 12px 0'
              }}>
                Food Items ({mealLogs.length})
              </h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.6 }}>
                  Loading food items...
                </div>
              ) : mealLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.6 }}>
                  No items logged yet
                </div>
              ) : !isEditing ? (
                // View Mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {mealLogs.map((log) => {
                    const nutrition = calculateNutrition(log.LogID);
                    const foodName = log.foodData?.FoodName || 'Unknown';

                    return (
                      <div
                        key={log.LogID}
                        style={{
                          padding: '12px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '10px',
                          borderLeft: '4px solid #85cc17'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          <span>🥗 {foodName}</span>
                          <span style={{ opacity: 0.8 }}>{log.Quantity}g</span>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '6px',
                          fontSize: '11px',
                          opacity: 0.8
                        }}>
                          <div style={{ background: 'rgba(132, 204, 22, 0.2)', padding: '4px', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ opacity: 0.7 }}>P</div>
                            <div style={{ fontWeight: '700' }}>{nutrition.protein}g</div>
                          </div>
                          <div style={{ background: 'rgba(34, 211, 238, 0.2)', padding: '4px', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ opacity: 0.7 }}>C</div>
                            <div style={{ fontWeight: '700' }}>{nutrition.carbs}g</div>
                          </div>
                          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '4px', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ opacity: 0.7 }}>F</div>
                            <div style={{ fontWeight: '700' }}>{nutrition.fat}g</div>
                          </div>
                          <div style={{ background: 'rgba(251, 146, 60, 0.2)', padding: '4px', borderRadius: '4px', textAlign: 'center' }}>
                            <div style={{ opacity: 0.7 }}>Cal</div>
                            <div style={{ fontWeight: '700' }}>{nutrition.calories}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Edit Mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mealLogs.map((log) => {
                    const foodName = log.foodData?.FoodName || 'Unknown';
                    const currentQuantity = editedQuantities[log.LogID] !== undefined 
                      ? editedQuantities[log.LogID] 
                      : log.Quantity;

                    return (
                      <div
                        key={log.LogID}
                        style={{
                          padding: '12px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '8px',
                          marginBottom: '10px',
                          alignItems: 'center'
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>
                            🥗 {foodName}
                          </div>
                          <button
                            onClick={() => handleDeleteFood(log.LogID)}
                            disabled={isSubmitting}
                            style={{
                              background: 'rgba(239, 68, 68, 0.5)',
                              border: 'none',
                              color: '#fff',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: isSubmitting ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => !isSubmitting && (e.target.style.background = 'rgba(239, 68, 68, 0.7)')}
                            onMouseLeave={(e) => !isSubmitting && (e.target.style.background = 'rgba(239, 68, 68, 0.5)')}
                          >
                            🗑️
                          </button>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 100px',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ opacity: 0.7, fontSize: '12px' }}>Quantity:</div>
                          <input
                            type="number"
                            value={currentQuantity}
                            onChange={(e) => handleUpdateQuantity(log.LogID, e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Quantity in grams"
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: '#fff',
                              padding: '6px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: isSubmitting ? 'not-allowed' : 'text'
                            }}
                          />
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '6px',
                          fontSize: '10px',
                          opacity: 0.7,
                          background: 'rgba(0, 0, 0, 0.2)',
                          padding: '8px',
                          borderRadius: '6px'
                        }}>
                          <span>P: {foodService.calculateNutritionForLog(log.foodData, currentQuantity).protein}g</span>
                          <span>C: {foodService.calculateNutritionForLog(log.foodData, currentQuantity).carbs}g</span>
                          <span>F: {foodService.calculateNutritionForLog(log.foodData, currentQuantity).fat}g</span>
                          <span>Cal: {foodService.calculateNutritionForLog(log.foodData, currentQuantity).calories}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Food */}
                  {!showNewFoodInput ? (
                    <button
                      onClick={() => setShowNewFoodInput(true)}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'rgba(132, 204, 22, 0.3)',
                        border: '1px dashed rgba(132, 204, 22, 0.5)',
                        color: '#85cc17',
                        borderRadius: '8px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.3s',
                        opacity: isSubmitting ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => !isSubmitting && (e.target.style.background = 'rgba(132, 204, 22, 0.5)')}
                      onMouseLeave={(e) => !isSubmitting && (e.target.style.background = 'rgba(132, 204, 22, 0.3)')}
                    >
                      + Add Food Item
                    </button>
                  ) : (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '8px',
                      border: '1px solid rgba(132, 204, 22, 0.3)'
                    }}>
                      {/* Search Input */}
                      <div style={{ marginBottom: '10px', position: 'relative' }}>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchFoods(e.target.value)}
                          onFocus={() => setShowSearch(true)}
                          placeholder="Search food..."
                          disabled={isSubmitting}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#fff',
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                            cursor: isSubmitting ? 'not-allowed' : 'text'
                          }}
                        />

                        {/* Search Results Dropdown */}
                        {showSearch && searchResults.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 10,
                            marginTop: '4px'
                          }}>
                            {searchResults.map((food) => (
                              <div
                                key={food.FoodID}
                                onClick={() => handleSelectFood(food)}
                                style={{
                                  padding: '8px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                  fontSize: '12px',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(132, 204, 22, 0.2)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                <div style={{ fontWeight: '600' }}>{food.FoodName}</div>
                                <div style={{ fontSize: '10px', opacity: 0.6 }}>
                                  {food.Calories} cal • P:{food.Protein}g C:{food.Carbs}g F:{food.Fat}g
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quantity Input */}
                      <input
                        type="number"
                        value={newFood.quantity}
                        onChange={(e) => setNewFood({ ...newFood, quantity: e.target.value })}
                        placeholder="Quantity in grams"
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          marginBottom: '10px',
                          boxSizing: 'border-box',
                          cursor: isSubmitting ? 'not-allowed' : 'text'
                        }}
                      />

                      {/* Action Buttons */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px'
                      }}>
                        <button
                          onClick={handleAddFood}
                          disabled={isSubmitting || !newFood.foodId || !newFood.quantity}
                          style={{
                            background: 'rgba(132, 204, 22, 0.6)',
                            border: 'none',
                            color: '#fff',
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: isSubmitting || !newFood.foodId || !newFood.quantity ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.3s',
                            opacity: isSubmitting || !newFood.foodId || !newFood.quantity ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubmitting && newFood.foodId && newFood.quantity) {
                              e.target.style.background = 'rgba(132, 204, 22, 0.8)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubmitting && newFood.foodId && newFood.quantity) {
                              e.target.style.background = 'rgba(132, 204, 22, 0.6)';
                            }
                          }}
                        >
                          {isSubmitting ? '⏳' : '✓'} Add
                        </button>
                        <button
                          onClick={() => {
                            setShowNewFoodInput(false);
                            setSearchQuery('');
                            setSearchResults([]);
                            setNewFood({ foodId: '', quantity: '' });
                          }}
                          disabled={isSubmitting}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: '#fff',
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => !isSubmitting && (e.target.style.background = 'rgba(255, 255, 255, 0.2)')}
                          onMouseLeave={(e) => !isSubmitting && (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons - Save/Cancel when in edit mode */}
            {isEditing && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #85cc17, #65a30d)',
                    border: 'none',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'all 0.3s',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.transform = 'translateY(0)')}
                >
                  {isSubmitting ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'all 0.3s',
                    opacity: isSubmitting ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !isSubmitting && (e.target.style.background = 'rgba(255, 255, 255, 0.2)')}
                  onMouseLeave={(e) => !isSubmitting && (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translate(-50%, -45%);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%);
              }
            }
          `}</style>
        </>
      )}
    </>
  );
}