import React from 'react';
import { MealCard } from '../cards/MealCard';
import { glassCardStyle, gridContainerStyle } from '../styles/glassCard';

export function MealsSection({ mealsData }) {
  return (
    <div style={glassCardStyle}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        {mealsData.map((meal, idx) => (
          <MealCard key={idx} meal={meal} />
        ))}
      </div>
    </div>
  );
}
