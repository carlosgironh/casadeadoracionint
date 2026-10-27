import { useState, useRef, useEffect } from 'react';
import { Bell, MoreVertical, User, History, Info, LogOut } from 'lucide-react';

interface AppTopBarProps {
  isLoggedIn: boolean;
  userName?: string;
  unreadNotificationsCount?: number;
  onLoginClick: () => void;
  onOpenNotifications: () => void;
  onOpenPerfil: () => void;
  onOpenHistorial: () => void;
  onOpenAcercaDe: () => void;
  onLogout: () => void;
}

export default function AppTopBar({
  isLoggedIn,
  userName,
  unreadNotificationsCount = 0,
  onLoginClick,
  onOpenNotifications,
  onOpenPerfil,
  onOpenHistorial,
  onOpenAcercaDe,
  onLogout
}: AppTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs pt-safe select-none">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-2 overflow-hidden">
          {isLoggedIn ? (
            <h1 className="text-[#00796B] font-bold text-lg sm:text-xl truncate tracking-tight">
              {userName ? `Bienvenido, Líder ${userName.split(' ')[0]}` : 'Casa de Adoración INT'}
            </h1>
          ) : (
            <div className="flex items-center gap-2.5">
              <img
                src="/ios/apple-touch-icon.png"
                alt="Logo"
                className="w-8 h-8 rounded-full shadow-xs object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <h1 className="text-[#00796B] font-bold text-lg sm:text-xl tracking-tight">
                Casa de Adoración INT
              </h1>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isLoggedIn ? (
            <button
              onClick={onLoginClick}
              className="bg-[#0D47A1] active:bg-[#0A387E] text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Ingresar Líder</span>
            </button>
          ) : (
            <>
              {/* Notifications Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-full text-gray-500 hover:bg-slate-100 active:scale-90 transition-all cursor-pointer"
                aria-label="Notificaciones"
              >
                <Bell className="w-6 h-6 text-gray-500" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* 3-dots Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2.5 rounded-full text-gray-500 hover:bg-slate-100 active:scale-90 transition-all cursor-pointer"
                  aria-label="Menú de opciones"
                >
                  <MoreVertical className="w-6 h-6 text-gray-500" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenPerfil();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Mi Perfil</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenHistorial();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 text-left cursor-pointer"
                    >
                      <History className="w-4 h-4 text-slate-500" />
                      <span>Historial de Informes</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenAcercaDe();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 text-left cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-slate-500" />
                      <span>Acerca de Nosotros</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
