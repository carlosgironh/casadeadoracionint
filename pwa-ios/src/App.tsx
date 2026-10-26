import React, { useState } from 'react';
import Gatekeeper from './gatekeeper/Gatekeeper';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RadioProvider } from './contexts/RadioContext';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import AppLayout from './components/AppLayout';

function AuthenticatedApp() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegistroPage onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return <AppLayout />;
}

export default function App() {
  return (
    <Gatekeeper>
      <AuthProvider>
        <RadioProvider>
          <AuthenticatedApp />
        </RadioProvider>
      </AuthProvider>
    </Gatekeeper>
  );
}
