import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { glassCardStyle } from '../styles/glassCard';

export function WeightChartCard({ weightData }) {
  return (
    <div style={glassCardStyle}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={weightData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.7)" />
          <YAxis stroke="rgba(255, 255, 255, 0.7)" />
          <Tooltip
            contentStyle={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px'
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#fff' }}
            fill="#f97316"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
