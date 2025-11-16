import React, { useState } from 'react';
import { profileStyles } from '../ProfileStyles/profile.styles';
const API_BASE_URL = 'http://localhost:8000/api';

function BasicInfoCard({ data, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    Name: data?.user?.Name || '',
    Email: data?.user?.Email || ''
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
      // Note: Implement actual API endpoint for updating basic info
      // Currently placeholder - adjust based on your backend
      await new Promise(resolve => setTimeout(resolve, 500));
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
        <h2 style={profileStyles.cardTitle}>👤 Basic Information</h2>
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

      <div style={profileStyles.grid2}>
        <div>
          <label style={profileStyles.label}>Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              style={profileStyles.input}
            />
          ) : (
            <p style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              {data?.user?.Name}
            </p>
          )}
        </div>

        <div>
          <label style={profileStyles.label}>Email Address</label>
          {isEditing ? (
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              style={profileStyles.input}
            />
          ) : (
            <p style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              {data?.user?.Email}
            </p>
          )}
        </div>

        <div>
          <label style={profileStyles.label}>Username</label>
          <p style={{ fontSize: '15px', color: '#aaa', margin: 0 }}>
            @{data?.user?.Username}
          </p>
        </div>

        <div>
          <label style={profileStyles.label}>Account Created</label>
          <p style={{ fontSize: '15px', color: '#aaa', margin: 0 }}>
            {new Date(data?.user?.CreatedAt).toLocaleDateString()}
          </p>
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

export default BasicInfoCard;