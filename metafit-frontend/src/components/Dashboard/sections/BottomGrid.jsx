import React from 'react';
import { WeightChartCard } from '../cards/WeightChartCard';
import { NutritionSummaryCard } from '../cards/NutritionSummaryCard';
import { gridContainerStyle } from '../styles/glassCard';

export function BottomGrid({ weightData, nutritionSummary, selectedDate }) {
  return (
    <div style={{
      ...gridContainerStyle,
      gridTemplateColumns: '1fr 280px',
      display: 'grid'
    }}>
      <WeightChartCard weightData={weightData} />
      {/* ✅ Pass selectedDate to NutritionSummaryCard */}
      <NutritionSummaryCard selectedDate={selectedDate} />
    </div>
  );
}