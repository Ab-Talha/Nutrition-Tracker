import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '20px',
  color: '#fff'
};

const API_BASE_URL = 'http://localhost:8000/api';

export function WeightChartCard() {
  const [weightData, setWeightData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ weight: '', notes: '', date: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
        const transformedData = data.data
          .map(entry => ({
            WeightID: entry.WeightID,
            weight: parseFloat(entry.Weight),
            DateTime: new Date(entry.DateTime),
            day: new Date(entry.DateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: new Date(entry.DateTime),
            Notes: entry.Notes
          }))
          .sort((a, b) => a.fullDate - b.fullDate);

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

  const handleAddWeight = async (e) => {
    e.preventDefault();
    
    if (!formData.weight) {
      alert('Please enter a weight value');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/weight-history/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Weight: parseFloat(formData.weight),
          Notes: formData.notes || '',
          DateTime: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('✓ Weight added successfully!');
        setFormData({ weight: '', notes: '', date: new Date().toISOString().split('T')[0] });
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchWeightData();
        setShowForm(false);
      } else {
        alert('Error: ' + (data.message || 'Failed to add weight'));
      }
    } catch (err) {
      console.error('Error adding weight:', err);
      alert('Failed to add weight entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderTop: '2px solid #f97316',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || filteredData.length === 0) {
    return (
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
          {error || 'No weight data available. Add entries below!'}
        </div>
      </div>
    );
  }

  const avgWeight = (filteredData.reduce((sum, d) => sum + d.weight, 0) / filteredData.length).toFixed(2);
  const minWeight = Math.min(...filteredData.map(d => d.weight)).toFixed(2);
  const maxWeight = Math.max(...filteredData.map(d => d.weight)).toFixed(2);
  const trend = (filteredData[filteredData.length - 1].weight - filteredData[0].weight).toFixed(2);
  const trendIndicator = trend < 0 ? '📉' : trend > 0 ? '📈' : '➡️';

  return (
    <div style={glassCardStyle}>
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .weight-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: '16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .stat-box {
          animation: slideInUp 0.5s ease forwards;
        }

        .stat-box:nth-child(1) { animation-delay: 0.1s; }
        .stat-box:nth-child(2) { animation-delay: 0.2s; }
        .stat-box:nth-child(3) { animation-delay: 0.3s; }
        .stat-box:nth-child(4) { animation-delay: 0.4s; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#9d4edd' }}>
          📊 Weight Tracker
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 14px',
                background: timeRange === range ? 'rgba(157, 78, 221, 0.4)' : 'rgba(0, 0, 0, 0.2)',
                border: timeRange === range ? '1px solid rgba(157, 78, 221, 0.6)' : '1px solid rgba(157, 78, 221, 0.2)',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (timeRange !== range) {
                  e.target.style.background = 'rgba(157, 78, 221, 0.25)';
                  e.target.style.borderColor = 'rgba(157, 78, 221, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (timeRange !== range) {
                  e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                  e.target.style.borderColor = 'rgba(157, 78, 221, 0.2)';
                }
              }}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '6px 14px',
              background: showForm ? 'rgba(132, 204, 22, 0.3)' : 'rgba(132, 204, 22, 0.2)',
              border: '1px solid rgba(132, 204, 22, 0.4)',
              color: '#85cc17',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(132, 204, 22, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = showForm ? 'rgba(132, 204, 22, 0.3)' : 'rgba(132, 204, 22, 0.2)';
            }}
          >
            {showForm ? '✕ Close' : '+ Add Weight'}
          </button>
        </div>
      </div>

      {/* Add Weight Form */}
      {showForm && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.1), rgba(132, 204, 22, 0.05))',
          border: '1px solid rgba(132, 204, 22, 0.3)',
          borderRadius: '8px',
          padding: '14px',
          marginBottom: '16px',
          animation: 'slideInUp 0.3s ease'
        }}>
          <form onSubmit={handleAddWeight} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '10px', opacity: 0.7, display: 'block', marginBottom: '4px', fontWeight: '700' }}>
                Date
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', opacity: 0.7, display: 'block', marginBottom: '4px', fontWeight: '700' }}>
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 75.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', opacity: 0.7, display: 'block', marginBottom: '4px', fontWeight: '700' }}>
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., morning"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 14px',
                background: submitting ? 'rgba(132, 204, 22, 0.3)' : 'rgba(132, 204, 22, 0.5)',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: submitting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.target.style.background = 'rgba(132, 204, 22, 0.7)';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.target.style.background = 'rgba(132, 204, 22, 0.5)';
                }
              }}
            >
              {submitting ? 'Adding...' : 'Save Weight'}
            </button>
          </form>

          {successMessage && (
            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(132, 204, 22, 0.2)',
              border: '1px solid rgba(132, 204, 22, 0.5)',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#85cc17',
              fontWeight: '700',
              animation: 'fadeIn 0.3s ease'
            }}>
              {successMessage}
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <div className="stat-box" style={{
          background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.2), rgba(157, 78, 221, 0.1))',
          border: '1px solid rgba(157, 78, 221, 0.3)',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(157, 78, 221, 0.3), rgba(157, 78, 221, 0.15))';
          e.currentTarget.style.borderColor = 'rgba(157, 78, 221, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(157, 78, 221, 0.2), rgba(157, 78, 221, 0.1))';
          e.currentTarget.style.borderColor = 'rgba(157, 78, 221, 0.3)';
        }}
        >
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average</div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#9d4edd' }}>{avgWeight}</div>
          <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '2px' }}>kg</div>
        </div>

        <div className="stat-box" style={{
          background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.2), rgba(132, 204, 22, 0.1))',
          border: '1px solid rgba(132, 204, 22, 0.3)',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(132, 204, 22, 0.3), rgba(132, 204, 22, 0.15))';
          e.currentTarget.style.borderColor = 'rgba(132, 204, 22, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(132, 204, 22, 0.2), rgba(132, 204, 22, 0.1))';
          e.currentTarget.style.borderColor = 'rgba(132, 204, 22, 0.3)';
        }}
        >
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Minimum</div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#85cc17' }}>{minWeight}</div>
          <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '2px' }}>kg</div>
        </div>

        <div className="stat-box" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.15))';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }}
        >
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Maximum</div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#ef4444' }}>{maxWeight}</div>
          <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '2px' }}>kg</div>
        </div>

        <div className="stat-box" style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.1))',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(249, 115, 22, 0.15))';
          e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.1))';
          e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.3)';
        }}
        >
          <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trend</div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: trend < 0 ? '#85cc17' : '#ef4444' }}>
            {trendIndicator}
          </div>
          <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '2px' }}>{Math.abs(trend)} kg</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        border: '1px solid rgba(157, 78, 221, 0.2)'
      }}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={filteredData}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="day" 
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: '11px' }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(249, 115, 22, 0.5)',
                borderRadius: '8px',
                padding: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}
              formatter={(value) => [`${value.toFixed(2)} kg`, 'Weight']}
              labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2, fill: '#f97316' }}
              isAnimationActive={true}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Info */}
      <div style={{
        padding: '10px 12px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#aaa',
        textAlign: 'center',
        fontWeight: '600',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        📈 {filteredData.length} weight entries in {timeRange === 'week' ? 'last 7 days' : 'last 30 days'}
      </div>
    </div>
  );
}