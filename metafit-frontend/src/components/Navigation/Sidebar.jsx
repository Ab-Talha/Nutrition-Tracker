import React from 'react';

function Sidebar({ activePage = 'dashboard', onNavigate = () => {}, onLogout = () => {} }) {
  const sidebarIcons = [
    { id: 'profile', emoji: '👤', title: 'Profile', disabled: true },
    { id: 'dashboard', emoji: '📊', title: 'Dashboard' },
    { id: 'auto-meal', emoji: '🤖', title: 'Auto Meal', disabled: true },
    { id: 'meal-entry', emoji: '🍽️', title: 'Meal Entry' },
    { id: 'workout', emoji: '💪', title: 'Workout', disabled: true }
  ];

  return (
    <div style={{
      width: '100px',
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      position: 'fixed',
      height: '100vh',
      zIndex: 100,
      left: 0,
      top: 0
    }}>
      {/* Logo */}
      <div style={{
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
      }}>
        💪
      </div>

      {/* Nav Icons */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {sidebarIcons.map(icon => (
          <div
            key={icon.id}
            onClick={() => {
              if (!icon.disabled) {
                onNavigate(icon.id);
              }
            }}
            title={icon.title}
            style={{
              width: '50px',
              height: '50px',
              cursor: icon.disabled ? 'not-allowed' : 'pointer',
              opacity: activePage === icon.id ? 1 : icon.disabled ? 0.3 : 0.6,
              transition: 'all 0.3s ease',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              border: activePage === icon.id ? '2px solid #85cc17' : '2px solid transparent',
              background: activePage === icon.id ? 'rgba(133, 204, 23, 0.15)' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (activePage !== icon.id && !icon.disabled) {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (activePage !== icon.id && !icon.disabled) {
                e.currentTarget.style.opacity = icon.disabled ? '0.3' : '0.6';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {icon.emoji}
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div
        onClick={onLogout}
        title="Logout"
        style={{
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          opacity: 0.6,
          transition: 'all 0.3s ease',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          border: '2px solid transparent',
          background: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
          e.currentTarget.style.border = '2px solid rgba(239, 68, 68, 0.3)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.border = '2px solid transparent';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        🚪
      </div>
    </div>
  );
}

export default Sidebar;