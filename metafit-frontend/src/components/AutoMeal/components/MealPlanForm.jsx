// src/components/AutoMeal/components/MealPlanForm.jsx

import React, { useState } from 'react';

function MealPlanForm({ onSubmit, loading = false, error = null }) {
  const [formData, setFormData] = useState({
    calorieTarget: 2500,
    gender: 'male',
    customMacros: {
      protein: '',
      carbs: '',
      fat: ''
    },
    useCustomMacros: false
  });

  const [formError, setFormError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'useCustomMacros') {
      setFormData(prev => ({
        ...prev,
        useCustomMacros: checked
      }));
    } else if (['protein', 'carbs', 'fat'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        customMacros: {
          ...prev.customMacros,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.calorieTarget || formData.calorieTarget < 1000 || formData.calorieTarget > 5000) {
      errors.push('Calorie target must be between 1000 and 5000');
    }

    if (!formData.gender) {
      errors.push('Please select a gender');
    }

    if (formData.useCustomMacros) {
      if (formData.customMacros.protein && (formData.customMacros.protein < 30 || formData.customMacros.protein > 500)) {
        errors.push('Protein must be between 30g and 500g');
      }
      if (formData.customMacros.carbs && (formData.customMacros.carbs < 50 || formData.customMacros.carbs > 600)) {
        errors.push('Carbs must be between 50g and 600g');
      }
      if (formData.customMacros.fat && (formData.customMacros.fat < 20 || formData.customMacros.fat > 300)) {
        errors.push('Fat must be between 20g and 300g');
      }
    }

    if (errors.length > 0) {
      setFormError(errors.join(', '));
      return false;
    }

    setFormError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const customMacros = formData.useCustomMacros
      ? {
          protein: formData.customMacros.protein ? parseInt(formData.customMacros.protein) : null,
          carbs: formData.customMacros.carbs ? parseInt(formData.customMacros.carbs) : null,
          fat: formData.customMacros.fat ? parseInt(formData.customMacros.fat) : null
        }
      : null;

    onSubmit({
      calorieTarget: formData.calorieTarget,
      gender: formData.gender,
      customMacros
    });
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '30px',
      marginBottom: '30px'
    }}>
      <h2 style={{
        color: '#fff',
        fontSize: '1.3rem',
        margin: '0 0 25px 0',
        fontWeight: '600'
      }}>
        📊 Generate Your Meal Plan
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Calorie Target */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.95rem',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            Daily Calorie Target
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              name="calorieTarget"
              value={formData.calorieTarget}
              onChange={handleInputChange}
              min="1000"
              max="5000"
              step="50"
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                e.target.style.borderColor = '#85cc17';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            />
            <span style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem'
            }}>
              kcal
            </span>
          </div>
          <small style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.8rem',
            marginTop: '6px',
            display: 'block'
          }}>
            Recommended: 1800-3500 kcal
          </small>
        </div>

        {/* Gender Selection */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.95rem',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            Gender
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            {['male', 'female'].map(gender => (
              <label
                key={gender}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '10px 15px',
                  background: formData.gender === gender
                    ? 'rgba(133, 204, 23, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: formData.gender === gender
                    ? '1px solid #85cc17'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={formData.gender === gender}
                  onChange={handleInputChange}
                  style={{
                    cursor: 'pointer',
                    width: '16px',
                    height: '16px'
                  }}
                />
                <span style={{ color: '#fff', textTransform: 'capitalize' }}>
                  {gender === 'male' ? '👨' : '👩'} {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Macros Toggle */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}>
            <input
              type="checkbox"
              name="useCustomMacros"
              checked={formData.useCustomMacros}
              onChange={handleInputChange}
              style={{
                cursor: 'pointer',
                width: '18px',
                height: '18px'
              }}
            />
            <span>Use Custom Macros (Optional)</span>
          </label>
          <small style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.8rem',
            marginTop: '6px',
            display: 'block'
          }}>
            Override default calculations with your own targets
          </small>
        </div>

        {/* Custom Macros Fields */}
        {formData.useCustomMacros && (
          <div style={{
            background: 'rgba(133, 204, 23, 0.08)',
            border: '1px solid rgba(133, 204, 23, 0.2)',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '25px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {['protein', 'carbs', 'fat'].map(macro => (
                <div key={macro}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.85rem',
                    marginBottom: '6px',
                    textTransform: 'capitalize',
                    fontWeight: '600'
                  }}>
                    {macro}
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      name={macro}
                      value={formData.customMacros[macro]}
                      onChange={handleInputChange}
                      placeholder={macro === 'protein' ? '150' : macro === 'carbs' ? '300' : '83'}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {macro === 'protein' ? 'g' : macro === 'carbs' ? 'g' : 'g'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(formError || error) && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '25px',
            color: '#fca5a5',
            fontSize: '0.9rem'
          }}>
            {formError || error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: loading
              ? 'rgba(133, 204, 23, 0.5)'
              : 'linear-gradient(135deg, #85cc17 0%, #6ba312 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#1a1a2e',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(133, 204, 23, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {loading ? '⏳ Generating...' : '🚀 Generate Meal Plan'}
        </button>
      </form>
    </div>
  );
}

export default MealPlanForm;