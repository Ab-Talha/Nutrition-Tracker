import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { glassCardStyle } from '../styles/glassCard';

const API_BASE_URL = 'http://localhost:8000/api';

export function WeightChartCard() {
  const [weightData, setWeightData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetchWeightData();
  }, [userId]);

  useEffect(() => {
    filterDataByTimeRange();
  }, [timeRange, weightData]);

  const fetchWeightData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${userId}/weight-history/`);
      const data = await response.json();

      if (data.success && data.data) {
        // Transform data for chart
        const transformedData = data.data
          .map(entry => ({
            WeightID: entry.WeightID,
            weight: parseFloat(entry.Weight),
            DateTime: new Date(entry.DateTime),
            day: new Date(entry.DateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: new Date(entry.DateTime),
            Notes: entry.Notes
          }))
          .sort((a, b) => a.fullDate - b.fullDate); // Sort by date ascending

        setWeightData(transformedData);
      }
    } catch (err) {
      console.error('Error fetching weight data:', err);
      setError('Failed to load weight data');
    } finally {
      setLoading(false);
    }
  };

  const filterDataByTimeRange = () => {
    if (weightData.length === 0) {
      setFilteredData([]);
      return;
    }

    let filtered = [...weightData];

    if (timeRange === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(d => d.fullDate >= sevenDaysAgo);
    } else if (timeRange === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(d => d.fullDate >= thirtyDaysAgo);
    }

    setFilteredData(filtered.length > 0 ? filtered : weightData);
  };

  if (loading) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>
          Loading weight data...
        </div>
      </div>
    );
  }

  if (error || filteredData.length === 0) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
          {error || 'No weight data available. Add entries in your profile!'}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const avgWeight = (filteredData.reduce((sum, d) => sum + d.weight, 0) / filteredData.length).toFixed(2);
  const minWeight = Math.min(...filteredData.map(d => d.weight)).toFixed(2);
  const maxWeight = Math.max(...filteredData.map(d => d.weight)).toFixed(2);
  const trend = (filteredData[filteredData.length - 1].weight - filteredData[0].weight).toFixed(2);
  const trendIndicator = trend < 0 ? '📉' : trend > 0 ? '📈' : '➡️';

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
              onMouseEnter={(e) => timeRange !== range && (e.target.style.background = 'rgba(255, 255, 255, 0.2)')}
              onMouseLeave={(e) => timeRange !== range && (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
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
          <div style={{ fontWeight: '700' }}>{avgWeight} kg</div>
        </div>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ opacity: 0.7, marginBottom: '2px' }}>Min</div>
          <div style={{ fontWeight: '700', color: '#85cc17' }}>{minWeight} kg</div>
        </div>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ opacity: 0.7, marginBottom: '2px' }}>Max</div>
          <div style={{ fontWeight: '700', color: '#ef4444' }}>{maxWeight} kg</div>
        </div>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ opacity: 0.7, marginBottom: '2px' }}>Trend</div>
          <div style={{ fontWeight: '700', color: trend < 0 ? '#85cc17' : '#ef4444' }}>
            {trendIndicator} {Math.abs(trend)} kg
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="day" 
            stroke="rgba(255, 255, 255, 0.7)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.7)"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px'
            }}
            formatter={(value) => [`${value.toFixed(2)} kg`, 'Weight']}
            labelStyle={{ color: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Data Info */}
      <div style={{
        marginTop: '12px',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#aaa',
        textAlign: 'center'
      }}>
        {filteredData.length} weight entries in {timeRange === 'week' ? 'last 7 days' : 'last 30 days'}
      </div>
    </div>
  );
}