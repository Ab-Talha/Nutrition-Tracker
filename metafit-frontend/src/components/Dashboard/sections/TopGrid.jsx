import React from 'react';
import { MergedProfileCard } from '../cards/MergedProfileCard';
import { MacroBarsCard } from '../cards/MacroBarsCard';
import { gridContainerStyle } from '../styles/glassCard';

export function TopGrid({ user, tdeeData, macroData, bmi = 24.5 }) {
  return (
    <div style={{
      ...gridContainerStyle,
      gridTemplateColumns: '560px 1fr',
      display: 'grid'
    }}>
      <MergedProfileCard 
        user={user} 
        tdeeData={tdeeData}
        bmi={bmi}
      />
      <MacroBarsCard macroData={macroData} />
    </div>
  );
}