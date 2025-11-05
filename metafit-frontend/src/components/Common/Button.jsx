import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props 
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1,
    padding: '12px 24px',
    fontSize: '14px',
    width: '100%'
  };

  const variants = {
    primary: {
      background: '#4ade80',
      color: '#000'
    },
    secondary: {
      background: '#475569',
      color: '#fff'
    },
    danger: {
      background: '#ef4444',
      color: '#fff'
    }
  };

  return (
    <button
      type={type}
      style={{
        ...baseStyles,
        ...variants[variant],
        ...style
      }}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};