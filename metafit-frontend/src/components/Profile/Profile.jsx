import React, { useState, useEffect } from 'react';
import { profileStyles } from './ProfileStyles/profile.styles';

const API_BASE_URL = 'http://localhost:8000/api';

function Profile() {
  const userId = localStorage.getItem('userID');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchWeightHistory();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile/`);
      const data = await response.json();
      
      if (data.success) {
        setUserData(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeightHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/weight-history/`);
      const data = await response.json();
      if (data.success) {
        setWeights(data.data.slice(0, 10));
      }
    } catch (err) {
      console.error('Error fetching weight history:', err);
    }
  };

  const handleEdit = (section) => {
    setEditMode(section);
    if (section === 'physical') {
      setFormData({
        Height: userData?.physicalInfo?.Height || '',
        Gender: userData?.physicalInfo?.Gender || '',
        DOB: userData?.physicalInfo?.DOB || ''
      });
    } else if (section === 'health') {
      setFormData({
        Goal: userData?.physicalInfo?.Goal || '',
        ActivityLevel: userData?.physicalInfo?.ActivityLevel || '',
        TargetWeight: userData?.physicalInfo?.TargetWeight || ''
      });
    }
  };

  const handleSave = async (section) => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/users/${userId}/physical-info/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update');
      
      setEditMode(null);
      fetchUserProfile();
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const getWeightProgress = () => {
    if (weights.length < 2) return 0;
    const latest = weights[0].Weight;
    const oldest = weights[weights.length - 1].Weight;
    return (oldest - latest).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return { text: 'Unknown', color: '#888', bgColor: 'rgba(136, 136, 136, 0.1)' };
    if (bmi < 18.5) return { text: 'Underweight', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' };
    if (bmi < 25) return { text: 'Healthy', color: '#85cc17', bgColor: 'rgba(133, 204, 23, 0.1)' };
    if (bmi < 30) return { text: 'Overweight', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' };
    return { text: 'Obese', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
  };

  if (loading) {
    return <div style={{ ...profileStyles.container, textAlign: 'center', paddingTop: '100px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ ...profileStyles.container, textAlign: 'center', paddingTop: '100px', color: '#ef4444' }}>{error}</div>;
  }

  const bmiInfo = getBMICategory(userData?.physicalInfo?.BMI);

  return (
    <div style={profileStyles.container}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
            }}>
              👤
            </div>
            <div>
              <h1 style={{ ...profileStyles.title, margin: '0 0 5px 0', fontSize: '32px' }}>
                {userData?.user?.Name}
              </h1>
              <p style={{ color: '#aaa', margin: 0, fontSize: '14px' }}>@{userData?.user?.Username} • {userData?.user?.Email}</p>
            </div>
          </div>
        </div>

        {/* Top Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* BMI Large Card */}
          <div style={{
            ...profileStyles.card,
            background: bmiInfo.bgColor,
            border: `2px solid ${bmiInfo.color}`,
            padding: '20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase' }}>BMI</p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: bmiInfo.color, margin: '0 0 8px 0' }}>
              {userData?.physicalInfo?.BMI || 'N/A'}
            </p>
            <p style={{ fontSize: '13px', color: bmiInfo.color, margin: 0, fontWeight: '600' }}>
              {bmiInfo.text}
            </p>
            <div style={{ fontSize: '24px', marginTop: '12px' }}>
              {userData?.physicalInfo?.BMI < 18.5 && '🔵'}
              {userData?.physicalInfo?.BMI >= 18.5 && userData?.physicalInfo?.BMI < 25 && '🟢'}
              {userData?.physicalInfo?.BMI >= 25 && userData?.physicalInfo?.BMI < 30 && '🟡'}
              {userData?.physicalInfo?.BMI >= 30 && '🔴'}
            </div>
          </div>

          {/* Current Weight */}
          <div style={{
            ...profileStyles.card,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid #3b82f6',
            padding: '20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase' }}>Current Weight</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#3b82f6', margin: '0 0 8px 0' }}>
              {userData?.physicalInfo?.CurrentWeight}
            </p>
            <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>kg</p>
            {userData?.physicalInfo?.CurrentWeight && userData?.physicalInfo?.TargetWeight && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: userData?.physicalInfo?.CurrentWeight > userData?.physicalInfo?.TargetWeight ? '#ef4444' : '#85cc17' }}>
                {userData?.physicalInfo?.CurrentWeight > userData?.physicalInfo?.TargetWeight ? '⬆️' : '⬇️'} {Math.abs((userData?.physicalInfo?.CurrentWeight - userData?.physicalInfo?.TargetWeight).toFixed(1))} kg from target
              </div>
            )}
          </div>

          {/* Target Weight */}
          <div style={{
            ...profileStyles.card,
            background: 'rgba(133, 204, 23, 0.1)',
            border: '2px solid #85cc17',
            padding: '20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase' }}>Target Weight</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#85cc17', margin: '0 0 8px 0' }}>
              {userData?.physicalInfo?.TargetWeight}
            </p>
            <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>kg</p>
          </div>

          {/* Goal */}
          <div style={{
            ...profileStyles.card,
            background: 'rgba(168, 85, 247, 0.1)',
            border: '2px solid #a855f7',
            padding: '20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase' }}>Goal</p>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#a855f7', margin: '0 0 8px 0' }}>
              {userData?.physicalInfo?.Goal}
            </p>
            <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>🎯</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Account Info */}
          <div style={profileStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <h3 style={{ ...profileStyles.cardTitle, fontSize: '16px', margin: 0 }}>👤 Account Information</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '12px' }}>Full Name</p>
                <p style={{ fontSize: '15px', color: '#fff', margin: 0, fontWeight: '600' }}>{userData?.user?.Name}</p>
              </div>
              <div>
                <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '12px' }}>Username</p>
                <p style={{ fontSize: '15px', color: '#aaa', margin: 0 }}>@{userData?.user?.Username}</p>
              </div>
              <div>
                <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '12px' }}>Email Address</p>
                <p style={{ fontSize: '15px', color: '#aaa', margin: 0 }}>{userData?.user?.Email}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                <p style={{ ...profileStyles.label, marginBottom: '4px', fontSize: '11px' }}>Account Status</p>
                <p style={{ fontSize: '12px', color: '#85cc17', margin: 0, fontWeight: '600' }}>✓ Active</p>
              </div>
            </div>
          </div>

          {/* Physical Info */}
          <div style={profileStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <h3 style={{ ...profileStyles.cardTitle, fontSize: '16px', margin: 0 }}>📏 Physical Information</h3>
              <button
                onClick={() => handleEdit('physical')}
                style={{
                  background: editMode === 'physical' ? '#ef4444' : '#85cc17',
                  color: editMode === 'physical' ? '#fff' : '#000',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {editMode === 'physical' ? '✕ Cancel' : '✎ Edit'}
              </button>
            </div>

            {editMode === 'physical' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={profileStyles.label}>Height (feet)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.Height}
                    onChange={(e) => setFormData({ ...formData, Height: e.target.value })}
                    style={profileStyles.input}
                  />
                </div>
                <div>
                  <label style={profileStyles.label}>Gender</label>
                  <select
                    value={formData.Gender}
                    onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                    style={profileStyles.input}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={profileStyles.label}>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.DOB}
                    onChange={(e) => setFormData({ ...formData, DOB: e.target.value })}
                    style={profileStyles.input}
                  />
                </div>
                <button
                  onClick={() => handleSave('physical')}
                  disabled={saving}
                  style={{ ...profileStyles.saveButton, opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Saving...' : '✓ Save Changes'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '12px' }}>Height</p>
                  <p style={{ fontSize: '18px', color: '#fff', margin: 0, fontWeight: '600' }}>{userData?.physicalInfo?.Height} ft</p>
                </div>
                <div>
                  <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '12px' }}>Gender</p>
                  <p style={{ fontSize: '18px', color: '#fff', margin: 0, fontWeight: '600' }}>
                    {userData?.physicalInfo?.Gender === 'Male' && '♂️ Male'}
                    {userData?.physicalInfo?.Gender === 'Female' && '♀️ Female'}
                    {userData?.physicalInfo?.Gender === 'Other' && '⚪ Other'}
                  </p>
                </div>
                <div>
                  <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '12px' }}>Date of Birth</p>
                  <p style={{ fontSize: '15px', color: '#aaa', margin: 0 }}>📅 {userData?.physicalInfo?.DOB}</p>
                </div>
              </div>
            )}
          </div>

          {/* Health Goals */}
          <div style={profileStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <h3 style={{ ...profileStyles.cardTitle, fontSize: '16px', margin: 0 }}>🎯 Health & Goals</h3>
              <button
                onClick={() => handleEdit('health')}
                style={{
                  background: editMode === 'health' ? '#ef4444' : '#85cc17',
                  color: editMode === 'health' ? '#fff' : '#000',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {editMode === 'health' ? '✕ Cancel' : '✎ Edit'}
              </button>
            </div>

            {editMode === 'health' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={profileStyles.label}>Fitness Goal</label>
                  <select
                    value={formData.Goal}
                    onChange={(e) => setFormData({ ...formData, Goal: e.target.value })}
                    style={profileStyles.input}
                  >
                    <option value="">Select Goal</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Maintain Weight">Maintain Weight</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                  </select>
                </div>
                <div>
                  <label style={profileStyles.label}>Activity Level</label>
                  <select
                    value={formData.ActivityLevel}
                    onChange={(e) => setFormData({ ...formData, ActivityLevel: e.target.value })}
                    style={profileStyles.input}
                  >
                    <option value="">Select Activity Level</option>
                    <option value="Sedentary">Sedentary</option>
                    <option value="Lightly Active">Lightly Active</option>
                    <option value="Moderately Active">Moderately Active</option>
                    <option value="Very Active">Very Active</option>
                    <option value="Extremely Active">Extremely Active</option>
                  </select>
                </div>
                <div>
                  <label style={profileStyles.label}>Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.TargetWeight}
                    onChange={(e) => setFormData({ ...formData, TargetWeight: e.target.value })}
                    style={profileStyles.input}
                  />
                </div>
                <button
                  onClick={() => handleSave('health')}
                  disabled={saving}
                  style={{ ...profileStyles.saveButton, opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Saving...' : '✓ Save Changes'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '12px' }}>Fitness Goal</p>
                  <p style={{ fontSize: '16px', color: '#a855f7', margin: 0, fontWeight: '600' }}>{userData?.physicalInfo?.Goal}</p>
                </div>
                <div>
                  <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '12px' }}>Activity Level</p>
                  <p style={{ fontSize: '16px', color: '#fff', margin: 0, fontWeight: '600' }}>
                    {userData?.physicalInfo?.ActivityLevel === 'Sedentary' && '🪑 Sedentary'}
                    {userData?.physicalInfo?.ActivityLevel === 'Lightly Active' && '🚶 Lightly Active'}
                    {userData?.physicalInfo?.ActivityLevel === 'Moderately Active' && '🏃 Moderately Active'}
                    {userData?.physicalInfo?.ActivityLevel === 'Very Active' && '🏋️ Very Active'}
                    {userData?.physicalInfo?.ActivityLevel === 'Extremely Active' && '🤸 Extremely Active'}
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ ...profileStyles.label, marginBottom: '4px', fontSize: '12px' }}>Target Weight Progress</p>
                  <p style={{ fontSize: '16px', color: '#85cc17', margin: 0, fontWeight: '600' }}>
                    {userData?.physicalInfo?.TargetWeight} kg
                  </p>
                  <p style={{ fontSize: '12px', color: '#aaa', margin: '4px 0 0 0' }}>
                    {getWeightProgress() > 0 ? `↓ ${getWeightProgress()} kg progress` : getWeightProgress() < 0 ? `↑ ${Math.abs(getWeightProgress())} kg away` : 'On track'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Health Metrics */}
          <div style={profileStyles.card}>
            <h3 style={{ ...profileStyles.cardTitle, fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>📊 Health Metrics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>Body Fat %</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
                  {userData?.physicalInfo?.BodyFat || 'Not tracked'}
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>Last Weight Update</p>
                <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>
                  {userData?.physicalInfo?.WeightLastUpdated 
                    ? new Date(userData.physicalInfo.WeightLastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Never'
                  }
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                <p style={{ ...profileStyles.label, marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>Weight Entries</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>
                  {weights.length} 
                </p>
                <p style={{ fontSize: '12px', color: '#aaa', margin: '4px 0 0 0' }}>Total tracked</p>
              </div>
            </div>
          </div>

          {/* Recent Weight History */}
          <div style={profileStyles.card}>
            <h3 style={{ ...profileStyles.cardTitle, fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>⚖️ Recent Weight History</h3>
            {weights.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {weights.map((weight, idx) => (
                  <div key={weight.WeightID} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${idx === 0 ? '#85cc17' : '#666'}`
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 }}>{weight.Weight} kg</p>
                      <p style={{ fontSize: '12px', color: '#aaa', margin: '2px 0 0 0' }}>
                        {new Date(weight.DateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {weight.Notes && ` • ${weight.Notes}`}
                      </p>
                    </div>
                    {idx === 0 && <span style={{ fontSize: '12px', color: '#85cc17', fontWeight: '600' }}>Latest</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#aaa', textAlign: 'center', margin: 0 }}>No weight history yet</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;