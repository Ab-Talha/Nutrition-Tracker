import React, { useState } from 'react';
import { profileStyles } from '../ProfileStyles/profile.styles';
const API_BASE_URL = 'http://localhost:8000/api';

function PhysicalInfoCard({ data, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    Height: data?.physicalInfo?.Height || '',
    Gender: data?.physicalInfo?.Gender || '',
    DOB: data?.physicalInfo?.DOB || ''
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
        `{API_BASE_URL}/users/${userId}/physical-info/`,
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
        <h2 style={profileStyles.cardTitle}>📏 Physical Information</h2>
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
          <label style={profileStyles.label}>Height (feet)</label>
          {isEditing ? (
            <input
              type="number"
              name="Height"
              step="0.1"
              value={formData.Height}
              onChange={handleChange}
              style={profileStyles.input}
            />
          ) : (
            <p style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              {data?.physicalInfo?.Height} ft
            </p>
          )}
        </div>

        <div>
          <label style={profileStyles.label}>Gender</label>
          {isEditing ? (
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              style={profileStyles.input}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              {data?.physicalInfo?.Gender}
            </p>
          )}
        </div>

        <div>
          <label style={profileStyles.label}>Date of Birth</label>
          {isEditing ? (
            <input
              type="date"
              name="DOB"
              value={formData.DOB}
              onChange={handleChange}
              style={profileStyles.input}
            />
          ) : (
            <p style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              {data?.physicalInfo?.DOB}
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

export default PhysicalInfoCard;