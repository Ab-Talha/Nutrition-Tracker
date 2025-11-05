import React from 'react';

export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  ...props
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '11px',
          color: '#e2e8f0',
          marginBottom: '8px'
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 10px',
          background: '#1e293b',
          color: '#fff',
          border: error ? '2px solid #ef4444' : '1px solid #475569',
          borderRadius: '8px',
          fontSize: '12px',
          boxSizing: 'border-box',
          outline: 'none'
        }}
        {...props}
      />
      {error && (
        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};