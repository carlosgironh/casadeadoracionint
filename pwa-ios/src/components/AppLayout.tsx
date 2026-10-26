import React, { useState } from 'react';
import CupertinoTabBar, { TabType } from './CupertinoTabBar';
import RadioPage from '../pages/RadioPage';
import CelugramaPage from '../pages/CelugramaPage';
import HistorialCelugramasPage from '../pages/HistorialCelugramasPage';
import DiscipulosPage from '../pages/DiscipulosPage';
import RecursosPage from '../pages/RecursosPage';
import PerfilPage from '../pages/PerfilPage';

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('radio');
  const [celugramaView, setCelugramaView] = useState<'form' | 'historial'>('form');

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between pt-safe">
      <main className="flex-1 pb-24 overflow-y-auto">
        {activeTab === 'radio' && <RadioPage />}
        {activeTab === 'celugrama' && (
          celugramaView === 'form' 
            ? <CelugramaPage onViewHistory={() => setCelugramaView('historial')} />
            : <HistorialCelugramasPage onBack={() => setCelugramaView('form')} />
        )}
        {activeTab === 'discipulos' && <DiscipulosPage />}
        {activeTab === 'recursos' && <RecursosPage />}
        {activeTab === 'perfil' && <PerfilPage />}
      </main>

      <CupertinoTabBar 
        activeTab={activeTab} 
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'celugrama') setCelugramaView('form');
        }} 
      />
    </div>
  );
}
