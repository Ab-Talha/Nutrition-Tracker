import React from 'react';
import BasicInfoCard from '../ProfileCards/BasicInfoCard';
import { profileStyles } from '../ProfileStyles/profile.styles';

function AccountSection({ userData, onUpdate }) {
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
        📋 Account Settings
      </h3>
      <BasicInfoCard data={userData} onUpdate={onUpdate} />
    </div>
  );
}

export default AccountSection;