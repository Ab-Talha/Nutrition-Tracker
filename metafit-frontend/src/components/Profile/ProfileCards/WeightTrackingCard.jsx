import React, { useState, useEffect } from 'react';
import { profileStyles } from '../ProfileStyles/profile.styles';
const API_BASE_URL = 'http://localhost:8000/api';

function WeightTrackingCard({ data, onUpdate }) {
  const [weights, setWeights] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeightHistory();
  }, [data]);

  const fetchWeightHistory = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userID');
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/weight-history/`
      );
      const result = await response.json();
      
      if (result.success) {
        setWeights(result.data.slice(0, 5)); // Last 5 entries
      }
    } catch (err) {
      console.error('Error fetching weight history:', err);
      setError('Failed to load weight history');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight) return;

    try {
      setSaving(true);
      setError(null);
      const userId = localStorage.getItem('userID');
      const response = await fetch(
        `https://api.example.com/api/users/${userId}/weight-history/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Weight: parseFloat(newWeight),
            Notes: notes
          })
        }
      );

      if (!response.ok) throw new Error('Failed to add weight');

      setNewWeight('');
      setNotes('');
      fetchWeightHistory();
      onUpdate();
    } catch (err) {
      setError('Failed to add weight entry');
      console.error('Error adding weight:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWeight = async (weightId) => {
    try {
      const userId = localStorage.getItem('userID');
      const response = await fetch(
        `https://api.example.com/api/users/${userId}/weight-history/`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ WeightID: weightId })
        }
      );

      if (!response.ok) throw new Error('Failed to delete');

      fetchWeightHistory();
      onUpdate();
    } catch (err) {
      console.error('Error deleting weight:', err);
    }
  };

  return (
    <div style={profileStyles.card}>
      <h2 style={profileStyles.cardTitle}>⚖️ Weight Tracking</h2>

      {/* Add New Weight */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <p style={{
          fontSize: '13px',
          color: '#aaa',
          margin: '0 0 12px 0',
          fontWeight: '500'
        }}>Add New Weight Entry</p>
        
        {error && (
          <div style={{
            color: '#ef4444',
            fontSize: '12px',
            marginBottom: '12px',
            padding: '6px 10px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px'
          }}>
            {error}
          </div>
        )}

        <div style={profileStyles.grid3}>
          <input
            type="number"
            step="0.1"
            placeholder="Weight (kg)"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            style={profileStyles.input}
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={profileStyles.input}
          />
          <button
            onClick={handleAddWeight}
            disabled={saving || !newWeight}
            style={{
              ...profileStyles.input,
              background: '#85cc17',
              color: '#000',
              border: 'none',
              fontWeight: '600',
              cursor: saving || !newWeight ? 'not-allowed' : 'pointer',
              opacity: saving || !newWeight ? 0.6 : 1
            }}
          >
            {saving ? 'Adding...' : 'Add Entry'}
          </button>
        </div>
      </div>

      {/* Weight History */}
      {loading ? (
        <p style={{ color: '#aaa', textAlign: 'center', margin: 0 }}>
          Loading weight history...
        </p>
      ) : weights.length > 0 ? (
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {weights.map((weight) => (
            <div key={weight.WeightID} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              marginBottom: '8px',
              fontSize: '13px'
            }}>
              <div>
                <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>
                  {weight.Weight} kg
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#aaa', fontSize: '12px' }}>
                  {new Date(weight.DateTime).toLocaleDateString()} 
                  {weight.Notes ? ` • ${weight.Notes}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDeleteWeight(weight.WeightID)}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#aaa', textAlign: 'center', margin: 0 }}>
          No weight entries yet
        </p>
      )}
    </div>
  );
}

export default WeightTrackingCard;