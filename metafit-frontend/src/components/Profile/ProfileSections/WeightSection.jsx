import React from 'react';
import WeightTrackingCard from '../ProfileCards/WeightTrackingCard';
import { profileStyles } from '../ProfileStyles/profile.styles';

function WeightSection({ userData, onUpdate }) {
  return (
    <div style={{ ...profileStyles.section, gridColumn: '1 / -1' }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#85cc17',
        margin: '0 0 16px 0',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        📊 Weight Management
      </h3>
      <WeightTrackingCard data={userData} onUpdate={onUpdate} />
    </div>
  );
}

export default WeightSection;