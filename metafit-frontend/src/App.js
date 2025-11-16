import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import { LoginPage } from './components/Auth/LoginPage';
import SignupWizard from './components/Auth/SignupPage'; // Import as SignupWizard
import MealEntryApp from './components/MealEntry/MealEntryApp';
import Dashboard from './components/Dashboard/Dashboard';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('meal-entry'); // Start with meal-entry

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
              // After successful signup, redirect to login
              setAuthMode('login');
            }}
          />
        )}
      </div>
    );
  }

  // Render based on current page
  return currentPage === 'dashboard' ? (
    <Dashboard user={user} onNavigate={setCurrentPage} />
  ) : (
    <MealEntryApp user={user} onNavigate={setCurrentPage} />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}