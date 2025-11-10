import React from 'react';
import { glassCardStyle } from '../styles/glassCard';

export function MacroBarsCard({ macroData }) {
  return (
    <div style={glassCardStyle}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '12px'
      }}>
        {macroData.map((macro, idx) => (
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
  );
}
