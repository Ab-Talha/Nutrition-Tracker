// src/components/AutoMeal/components/MealDetails.jsx

import React from 'react';

const MEAL_EMOJIS = {
  breakfast: '🍳',
  lunch: '🍽️',
  dinner: '🍴',
  snack: '🍿'
};

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack'
};

function MealDetails({ meals = {} }) {
  const mealTypes = Object.keys(meals);

  if (mealTypes.length === 0) {
    return null;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px',
      marginTop: '15px'
    }}>
      {mealTypes.map(mealType => {
        const mealItems = meals[mealType] || [];

        if (mealItems.length === 0) {
          return null;
        }

        return (
          <div
            key={mealType}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '15px',
              overflow: 'hidden'
            }}
          >
            {/* Meal Type Header */}
            <h4 style={{
              margin: '0 0 12px 0',
              color: '#85cc17',
              fontSize: '0.9rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {MEAL_EMOJIS[mealType]} {MEAL_LABELS[mealType]}
            </h4>

            {/* Meal Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mealItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '10px',
                    borderRadius: '6px',
                    borderLeft: '3px solid #85cc17'
                  }}
                >
                  {/* Food Name */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {item.food_name}
                    </span>
                    <span style={{
                      color: '#85cc17',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      marginLeft: '8px'
                    }}>
                      {Math.round(item.calories)} cal
                    </span>
                  </div>

                  {/* Quantity */}
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.75rem',
                    marginBottom: '6px'
                  }}>
                    {item.quantity} {item.unit}
                  </div>

                  {/* Macros Mini */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    fontSize: '0.7rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'rgba(255, 255, 255, 0.4)' }}>P</div>
                      <div style={{ color: '#fff', fontWeight: '600' }}>
                        {item.protein.toFixed(1)}g
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'rgba(255, 255, 255, 0.4)' }}>C</div>
                      <div style={{ color: '#fff', fontWeight: '600' }}>
                        {item.carbs.toFixed(1)}g
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'rgba(255, 255, 255, 0.4)' }}>F</div>
                      <div style={{ color: '#fff', fontWeight: '600' }}>
                        {item.fat.toFixed(1)}g
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.7rem',
                    color: 'rgba(255, 255, 255, 0.4)'
                  }}>
                    <span>🌾 {item.fiber.toFixed(1)}g fiber</span>
                    <span>🍬 {item.sugar.toFixed(1)}g sugar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MealDetails;