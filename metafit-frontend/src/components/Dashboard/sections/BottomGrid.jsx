import React from 'react';
import { WeightChartCard } from '../cards/WeightChartCard';
import { NutritionSummaryCard } from '../cards/NutritionSummaryCard';
import { gridContainerStyle } from '../styles/glassCard';

export function BottomGrid({ weightData, nutritionSummary }) {
  return (
    <div style={{
      ...gridContainerStyle,
      gridTemplateColumns: '1fr 280px',
      display: 'grid'
    }}>
      <WeightChartCard weightData={weightData} />
      <NutritionSummaryCard nutritionSummary={nutritionSummary} />
    </div>
  );
}