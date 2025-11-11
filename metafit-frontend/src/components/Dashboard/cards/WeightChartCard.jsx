import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { glassCardStyle } from '../styles/glassCard';

export function WeightChartCard({ weightData }) {
  const [timeRange, setTimeRange] = useState('week');

  const avgWeight = (weightData.reduce((sum, d) => sum + d.weight, 0) / weightData.length).toFixed(2);
  const minWeight = Math.min(...weightData.map(d => d.weight)).toFixed(2);
  const maxWeight = Math.max(...weightData.map(d => d.weight)).toFixed(2);
  const trend = (weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(2);
  const trendIndicator = trend < 0 ? '📉' : '📈';

  return (
    <div style={glassCardStyle}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>
          📊 Weight Tracker
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '4px 12px',
                background: timeRange === range ? 'rgba(132, 204, 22, 0.6)' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => !timeRange === range && (e.target.style.background = 'rgba(255, 255, 255, 0.2)')}
              onMouseLeave={(e) => !timeRange === range && (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '12px',
        fontSize: '11px'
      }}>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ opacity: 0.7, marginBottom: '2px' }}>Avg</div>
          <div style={{ fontWeight: '700' }}>{avgWeight}</div>
        </div>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ opacity: 0.7, marginBottom: '2px' }}>Min</div>
          <div style={{ fontWeight: '700' }}>{minWeight}</div>
        </div>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ opacity: 0.7, marginBottom: '2px' }}>Max</div>
          <div style={{ fontWeight: '700' }}>{maxWeight}</div>
        </div>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ opacity: 0.7, marginBottom: '2px' }}>Trend</div>
          <div style={{ fontWeight: '700' }}>{trendIndicator} {Math.abs(trend)}</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={weightData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.7)" />
          <YAxis stroke="rgba(255, 255, 255, 0.7)" />
          <Tooltip
            contentStyle={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px'
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#fff' }}
            fill="#f97316"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
