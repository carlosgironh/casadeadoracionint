import { Radio, Megaphone, Users, BookOpen, ClipboardList } from 'lucide-react';

export type TabType = 'radio' | 'anuncios' | 'discipulos' | 'bosquejos' | 'celugrama';

interface CupertinoTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isLoggedIn: boolean;
}

export default function CupertinoTabBar({ activeTab, onTabChange, isLoggedIn }: CupertinoTabBarProps) {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = isLoggedIn
    ? [
        { id: 'radio', label: 'Radio', icon: Radio },
        { id: 'anuncios', label: 'Anuncios', icon: Megaphone },
        { id: 'discipulos', label: 'Discípulos', icon: Users },
        { id: 'bosquejos', label: 'Bosquejos', icon: BookOpen },
        { id: 'celugrama', label: 'Celugrama', icon: ClipboardList }
      ]
    : [
        { id: 'radio', label: 'Radio', icon: Radio },
        { id: 'anuncios', label: 'Anuncios', icon: Megaphone }
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe select-none">
      <div className="h-16 max-w-md mx-auto flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all group cursor-pointer"
            >
              <div
                className={`flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#E0F2F1] text-[#00796B] px-4 py-1 rounded-full'
                    : 'text-gray-500 group-active:scale-95'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : ''}`} />
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'font-bold text-[#00796B]' : 'font-medium text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
