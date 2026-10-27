import { useState, useEffect } from 'react';
import AppTopBar from './AppTopBar';
import CupertinoTabBar from './CupertinoTabBar';
import type { TabType } from './CupertinoTabBar';
import RadioPage from '../pages/RadioPage';
import AnunciosPage from '../pages/AnunciosPage';
import DiscipulosPage from '../pages/DiscipulosPage';
import BosquejosPage from '../pages/BosquejosPage';
import CelugramaPage from '../pages/CelugramaPage';
import HistorialCelugramasPage from '../pages/HistorialCelugramasPage';
import PerfilPage from '../pages/PerfilPage';
import AcercaDeModal from './AcercaDeModal';
import NotificacionesModal from './NotificacionesModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AppLayoutProps {
  onLoginClick: () => void;
}

export default function AppLayout({ onLoginClick }: AppLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const isLoggedIn = !!user;

  const [activeTab, setActiveTab] = useState<TabType>('radio');
  const [unreadNotis, setUnreadNotis] = useState(0);

  // Modals & Sub-screens
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [showAcercaDe, setShowAcercaDe] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);

  // Fetch unread notifications count when logged in
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setUnreadNotis(0);
      return;
    }

    async function checkNotifications() {
      try {
        const { count, error } = await supabase
          .from('notificaciones')
          .select('id', { count: 'exact', head: true })
          .eq('usuario_id', user!.id)
          .eq('leido', false);

        if (!error && count !== null) {
          setUnreadNotis(count);
        }
      } catch (err) {
        console.error(err);
      }
    }

    checkNotifications();
  }, [isLoggedIn, user]);

  // If user logs out while on an authenticated tab, revert to radio
  useEffect(() => {
    if (!isLoggedIn && (activeTab === 'discipulos' || activeTab === 'bosquejos' || activeTab === 'celugrama')) {
      setActiveTab('radio');
    }
  }, [isLoggedIn, activeTab]);

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col relative overflow-x-hidden">
      {/* Top App Bar matching Android */}
      <AppTopBar
        isLoggedIn={isLoggedIn}
        userName={profile?.nombre_completo || ''}
        unreadNotificationsCount={unreadNotis}
        onLoginClick={onLoginClick}
        onOpenNotifications={() => setShowNotificaciones(true)}
        onOpenPerfil={() => setShowPerfil(true)}
        onOpenHistorial={() => setShowHistorial(true)}
        onOpenAcercaDe={() => setShowAcercaDe(true)}
        onLogout={signOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'radio' && <RadioPage />}
        {activeTab === 'anuncios' && <AnunciosPage />}
        {activeTab === 'discipulos' && isLoggedIn && <DiscipulosPage />}
        {activeTab === 'bosquejos' && isLoggedIn && <BosquejosPage />}
        {activeTab === 'celugrama' && isLoggedIn && <CelugramaPage />}
      </main>

      {/* Bottom Bar matching Android NavigationBar */}
      <CupertinoTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isLoggedIn={isLoggedIn}
      />

      {/* Modals & Sub-screens */}
      <NotificacionesModal
        isOpen={showNotificaciones}
        onClose={() => setShowNotificaciones(false)}
        onCountUpdate={(cnt) => setUnreadNotis(cnt)}
      />

      <AcercaDeModal
        isOpen={showAcercaDe}
        onClose={() => setShowAcercaDe(false)}
      />

      {showPerfil && (
        <PerfilPage onBack={() => setShowPerfil(false)} />
      )}

      {showHistorial && (
        <HistorialCelugramasPage onBack={() => setShowHistorial(false)} />
      )}
    </div>
  );
}
