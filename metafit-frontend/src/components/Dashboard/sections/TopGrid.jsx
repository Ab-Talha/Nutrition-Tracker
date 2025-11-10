import React from 'react';
import { ProfileCard } from '../cards/ProfileCard';
import { TDEECard } from '../cards/TDEECard';
import { MacroBarsCard } from '../cards/MacroBarsCard';
import { gridContainerStyle } from '../styles/glassCard';

export function TopGrid({ user, tdeeData, macroData }) {
  return (
    <div style={{
      ...gridContainerStyle,
      gridTemplateColumns: '280px 280px 1fr',
      display: 'grid'
    }}>
      <ProfileCard user={user} />
      <TDEECard tdeeData={tdeeData} />
      <MacroBarsCard macroData={macroData} />
    </div>
  );
}
