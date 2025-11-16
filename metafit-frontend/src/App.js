import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import { LoginPage } from './components/Auth/LoginPage';
import SignupWizard from './components/Auth/SignupPage';
import MealEntryApp from './components/MealEntry/MealEntryApp';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import AutoMeal from './components/AutoMeal/AutoMeal';
import Sidebar from './components/Navigation/Sidebar';

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {authMode === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthMode('signup')} />
        ) : (
          <SignupWizard 
            onSignupComplete={() => {
              setAuthMode('login');
            }}
          />
        )}
      </div>
    );
  }

  // Render logged-in app with Sidebar
  const handleLogout = () => {
    logout();
    localStorage.clear();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <Profile />;
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setCurrentPage} />;
      case 'meal-entry':
        return <MealEntryApp user={user} onNavigate={setCurrentPage} />;
      case 'auto-meal':
        return <AutoMeal />;
      case 'workout':
        return (
          <div style={{
            marginLeft: '100px',
            padding: '40px',
            color: '#fff',
            minHeight: '100vh'
          }}>
            <h1>💪 Workout (Coming Soon)</h1>
            <p style={{ fontSize: '16px', color: '#aaa' }}>
              This feature will be available soon!
            </p>
          </div>
        );
      default:
        return <Dashboard user={user} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)',
      minHeight: '100vh'
    }}>
      <Sidebar
        activePage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      <div style={{ flex: 1 }}>
        {renderPage()}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}