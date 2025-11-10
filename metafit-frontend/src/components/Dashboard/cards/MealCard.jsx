import React from 'react';

export function MealCard({ meal }) {
  return (
    <div
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
  );
}
