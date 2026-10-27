import { useState, useRef, useEffect } from 'react';
import { Bell, MoreVertical, User, History, Info, LogOut } from 'lucide-react';

interface AppTopBarProps {
  userName?: string;
  unreadNotificationsCount?: number;
  onOpenNotifications: () => void;
  onOpenPerfil: () => void;
  onOpenHistorial: () => void;
  onOpenAcercaDe: () => void;
  onLogout: () => void;
}

export default function AppTopBar({
  userName,
  unreadNotificationsCount = 0,
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

  const firstName = userName ? userName.split(' ')[0] : '';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs pt-safe select-none">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Title matching Navigation.kt: Text("Bienvenido, Líder $userName", color = Color(0xFF00796B), fontWeight = FontWeight.Bold, fontSize = 20.sp) */}
        <h1 className="text-[#00796B] font-bold text-lg sm:text-xl truncate tracking-tight">
          {firstName ? `Bienvenido, Líder ${firstName}` : 'Casa de Adoración INT'}
        </h1>

        {/* Actions matching Android: Bell with Badge + 3-dots overflow menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-full hover:bg-slate-100 active:scale-90 transition-all cursor-pointer"
            aria-label="Notificaciones"
          >
            <Bell className="w-6 h-6 text-[#757575]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-full hover:bg-slate-100 active:scale-90 transition-all cursor-pointer"
              aria-label="Menú de opciones"
            >
              <MoreVertical className="w-6 h-6 text-[#757575]" />
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
        </div>
      </div>
    </header>
  );
}
