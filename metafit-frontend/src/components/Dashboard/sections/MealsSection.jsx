import React from 'react';
import { MealCard } from '../cards/MealCard';
import { glassCardStyle } from '../styles/glassCard';

export function MealsSection({ userId, selectedDate, onMealUpdate }) {
  // Meal types to display
  const mealTypes = [
    { type: 'Breakfast', emoji: '🌅' },
    { type: 'Lunch', emoji: '🍽️' },
    { type: 'Dinner', emoji: '🌙' },
    { type: 'Snack', emoji: '🥜' }
  ];

  return (
    <div style={glassCardStyle}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        {mealTypes.map((meal) => (
          <MealCard 
            key={meal.type}
            userId={userId}
            mealType={meal.type}
            date={selectedDate}
            mealName={`${meal.emoji} ${meal.type}`}
            onUpdate={onMealUpdate}
          />
        ))}
      </div>
    </div>
  );
}