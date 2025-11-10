import React from 'react';
import { glassCardStyle } from '../styles/glassCard';

export function ProfileCard({ user }) {
  return (
    <div style={glassCardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '75px',
          height: '75px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          flexShrink: 0
        }}></div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '2px', margin: 0 }}>
            {user?.Name || 'User'}
          </h2>
          <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>@{user?.Username || 'username'}</p>
        </div>
      </div>

      <div style={{
        marginTop: '14px',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', fontWeight: '500' }}>
          Target:
        </div>
        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>
          Weight Loss
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '8px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>⚖️</div>
          <div style={{ fontSize: '12px', fontWeight: '700' }}>70.0</div>
        </div>
        <div style={{
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '8px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>📏</div>
          <div style={{ fontSize: '12px', fontWeight: '700' }}>150.0</div>
        </div>
        <div style={{
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '8px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'block', fontSize: '18px', marginBottom: '4px' }}>🔥</div>
          <div style={{ fontSize: '12px', fontWeight: '700' }}>2300 Cal</div>
        </div>
      </div>
    </div>
  );
}
