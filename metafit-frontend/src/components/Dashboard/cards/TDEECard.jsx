import React from 'react';
import { glassCardStyle } from '../styles/glassCard';

export function TDEECard({ tdeeData }) {
  return (
    <div style={{
      ...glassCardStyle,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around'
    }}>
      {tdeeData.map((item, idx) => (
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
  );
}
