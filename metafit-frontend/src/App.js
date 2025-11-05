import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import SignupWizard from './components/Auth/SignupPage';
import MealEntryApp from './components/MealEntry/MealEntryApp';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', or 'signup-wizard'

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
          <LoginPage onSwitchToRegister={() => setAuthMode('signup-wizard')} />
        ) : authMode === 'signup-wizard' ? (
          <SignupWizard onSignupComplete={() => setAuthMode('login')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return <MealEntryApp user={user} />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}