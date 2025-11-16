import React, { useState } from 'react';
import { profileStyles } from '../ProfileStyles/profile.styles';
const API_BASE_URL = 'http://localhost:8000/api';

function HealthGoalsCard({ data, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    Goal: data?.physicalInfo?.Goal || '',
    ActivityLevel: data?.physicalInfo?.ActivityLevel || '',
    TargetWeight: data?.physicalInfo?.TargetWeight || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const userId = localStorage.getItem('userID');
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/physical-info/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );
      
      if (!response.ok) throw new Error('Failed to update');
      
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setError('Failed to save changes');
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={profileStyles.card}>
      <div style={profileStyles.cardHeader}>
        <h2 style={profileStyles.cardTitle}>🎯 Health Goals</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={profileStyles.editButton}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {error && (
        <div style={{
          color: '#ef4444',
          fontSize: '13px',
          marginBottom: '12px',
          padding: '8px 12px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px'
        }}>
          {error}
        </div>
      )}

      <div style={profileStyles.grid3}>
        <div>
          <label style={profileStyles.label}>Fitness Goal</label>
          {isEditing ? (
            <select
              name="Goal"
              value={formData.Goal}
              onChange={handleChange}
              style={profileStyles.input}
            >
              <option value="">Select Goal</option>
              <option value="Weight Gain">Weight Gain</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Maintain Weight">Maintain Weight</option>
              <option value="Muscle Gain">Muscle Gain</option>
            </select>
          ) : (
            <p style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              {data?.physicalInfo?.Goal}
            </p>
          )}
        </div>

        <div>
          <label style={profileStyles.label}>Activity Level</label>
          {isEditing ? (
            <select
              name="ActivityLevel"
              value={formData.ActivityLevel}
              onChange={handleChange}
              style={profileStyles.input}
            >
              <option value="">Select Level</option>
              <option value="Sedentary">Sedentary</option>
              <option value="Lightly Active">Lightly Active</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Very Active">Very Active</option>
              <option value="Extremely Active">Extremely Active</option>
            </select>
          ) : (
            <p style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              {data?.physicalInfo?.ActivityLevel}
            </p>
          )}
        </div>

        <div>
          <label style={profileStyles.label}>Target Weight (kg)</label>
          {isEditing ? (
            <input
              type="number"
              name="TargetWeight"
              step="0.5"
              value={formData.TargetWeight}
              onChange={handleChange}
              style={profileStyles.input}
            />
          ) : (
            <p style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              {data?.physicalInfo?.TargetWeight} kg
            </p>
          )}
        </div>
      </div>

      {isEditing && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...profileStyles.saveButton,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  );
}

export default HealthGoalsCard;