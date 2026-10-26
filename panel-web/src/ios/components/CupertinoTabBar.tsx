
import { Radio, ClipboardList, Users, BookOpen, User } from 'lucide-react';
import { useRadio } from '../contexts/RadioContext';

export type TabType = 'radio' | 'celugrama' | 'discipulos' | 'recursos' | 'perfil';

interface CupertinoTabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function CupertinoTabBar({ activeTab, onChangeTab }: CupertinoTabBarProps) {
  const { isPlaying } = useRadio();

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'celugrama', label: 'Celugrama', icon: ClipboardList },
    { id: 'discipulos', label: 'Discípulos', icon: Users },
    { id: 'recursos', label: 'Recursos', icon: BookOpen },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav pb-safe pt-2">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 py-1 flex flex-col items-center justify-center relative transition-all active:scale-90 ${
                isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.id === 'radio' && isPlaying && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

