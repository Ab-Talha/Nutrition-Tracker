import React from 'react';
import PhysicalInfoCard from '../ProfileCards/PhysicalInfoCard';
import HealthGoalsCard from '../ProfileCards/HealthGoalsCard';
import ActivityLevelCard from '../ProfileCards/ActivityLevelCard';
import BMICard from '../ProfileCards/BMICard';
import { profileStyles } from '../ProfileStyles/profile.styles';

function HealthSection({ userData, onUpdate }) {
  return (
    <div style={profileStyles.section}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#85cc17',
        margin: '0 0 16px 0',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        gridColumn: '1 / -1'
      }}>
        🏥 Health Information
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', gridColumn: '1 / -1' }}>
        <PhysicalInfoCard data={userData} onUpdate={onUpdate} />
        <HealthGoalsCard data={userData} onUpdate={onUpdate} />
        <ActivityLevelCard data={userData} />
        <BMICard data={userData} />
      </div>
    </div>
  );
}

export default HealthSection;