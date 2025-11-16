import React, { useState } from 'react';
import { glassCardStyle } from '../styles/glassCard';

const API_BASE_URL = 'http://localhost:8000/api';

export function AddWeightCard({ onWeightAdded }) {
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userId = localStorage.getItem('userID');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (!weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/users/${userId}/weight-history/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Weight: parseFloat(weight),
          Notes: notes.trim() || 'Manual entry'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add weight');
      }

      setSuccess(`✓ Weight entry added: ${weight} kg`);
      setWeight('');
      setNotes('');

      // Call callback to refresh chart
      if (onWeightAdded) {
        setTimeout(() => onWeightAdded(), 500);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Error adding weight:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={glassCardStyle}>
      <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>
        ⚖️ Add Weight Entry
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Weight Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#aaa',
            marginBottom: '6px',
            fontWeight: '600'
          }}>
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="Enter your weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={saving}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease',
              cursor: saving ? 'not-allowed' : 'text',
              opacity: saving ? 0.6 : 1
            }}
            onFocus={(e) => !saving && (e.target.style.borderColor = 'rgba(133, 204, 23, 0.5)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
          />
        </div>

        {/* Notes Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#aaa',
            marginBottom: '6px',
            fontWeight: '600'
          }}>
            Notes (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Morning weight, After workout, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={saving}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease',
              cursor: saving ? 'not-allowed' : 'text',
              opacity: saving ? 0.6 : 1
            }}
            onFocus={(e) => !saving && (e.target.style.borderColor = 'rgba(133, 204, 23, 0.5)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '10px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#ef4444',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            ✗ {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '10px 12px',
            background: 'rgba(133, 204, 23, 0.1)',
            border: '1px solid rgba(133, 204, 23, 0.3)',
            borderRadius: '6px',
            color: '#85cc17',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving || !weight}
          style={{
            padding: '10px 16px',
            background: saving || !weight ? 'rgba(133, 204, 23, 0.4)' : 'linear-gradient(135deg, #84cc16 0%, #b8e986 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontSize: '13px',
            fontWeight: '700',
            cursor: saving || !weight ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: saving || !weight ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!saving && weight) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 16px rgba(133, 204, 23, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {saving ? '⏳ Adding...' : '✓ Add Weight'}
        </button>
      </form>

      {/* Quick Tips */}
      <div style={{
        marginTop: '12px',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#aaa'
      }}>
        💡 <strong>Tip:</strong> Weigh yourself at the same time daily (e.g., morning) for accurate tracking
      </div>
    </div>
  );
}