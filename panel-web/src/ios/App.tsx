import { useState } from 'react';
import Gatekeeper from './gatekeeper/Gatekeeper';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RadioProvider } from './contexts/RadioContext';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import AppLayout from './components/AppLayout';

function MainAppFlow() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<'main' | 'login' | 'register'>('main');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#00796B] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-[#00796B]">Cargando Casa de Adoración...</p>
      </div>
    );
  }

  // If user is not logged in and chose to enter the leader portal
  if (!user && screen === 'login') {
    return (
      <LoginPage
        onBackClick={() => setScreen('main')}
        onRegisterClick={() => setScreen('register')}
        onLoginSuccess={() => setScreen('main')}
      />
    );
  }

  if (!user && screen === 'register') {
    return (
      <RegistroPage
        onBackClick={() => setScreen('login')}
        onSwitchToLogin={() => setScreen('login')}
      />
    );
  }

  // Main navigation (accessible to all, showing 2 tabs unauthenticated, 5 tabs authenticated)
  return (
    <AppLayout
      onLoginClick={() => setScreen('login')}
    />
  );
}

export default function App() {
  return (
    <Gatekeeper>
      <AuthProvider>
        <RadioProvider>
          <MainAppFlow />
        </RadioProvider>
      </AuthProvider>
    </Gatekeeper>
  );
}
