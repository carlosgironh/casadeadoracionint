import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Users, LogOut, Bell, Contact2, X, Smartphone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  isCollapsed?: boolean;
}

export default function Sidebar({ isOpen = false, setIsOpen, isCollapsed = false }: SidebarProps) {
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Anuncios', href: '/anuncios', icon: Bell },
    { name: 'Bosquejos', href: '/bosquejos', icon: BookOpen },
    { name: 'Informes', href: '/informes', icon: FileText },
    { name: 'Organigrama', href: '/organigrama', icon: Users },
    { name: 'Directorio', href: '/lideres', icon: Contact2 },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden transition-opacity" 
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 flex flex-col transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center justify-between md:justify-center ${isCollapsed ? 'p-4' : 'p-6'}`}>
          <img 
            src="/logo.png" 
            alt="Casa de Adoracion Int Logo" 
            className={`${isCollapsed ? 'h-10' : 'h-20'} w-auto transition-all duration-300`} 
            onError={(e) => { e.currentTarget.style.display = 'none'; if (!e.currentTarget.nextElementSibling) e.currentTarget.insertAdjacentHTML('afterend', '<h1 class="text-xl font-bold text-[#0D509E]">Casa de Adoracion Int Logo Falta</h1>'); }} 
          />
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsOpen && setIsOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className={`flex-1 space-y-2 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen && setIsOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'} text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className={isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'} />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <a
            href="/CasaDeAdoracionINT.apk"
            download="CasaDeAdoracionINT.apk"
            title={isCollapsed ? "Descargar App Android" : undefined}
            className={`flex w-full items-center ${isCollapsed ? 'justify-center px-2 py-2.5' : 'px-4 py-2.5'} text-sm font-medium text-[#0D509E] rounded-xl hover:bg-blue-50 transition-colors`}
          >
            <Smartphone className={isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'} />
            {!isCollapsed && <span>Descargar App Android</span>}
          </a>
          <button
            onClick={signOut}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
            className={`flex w-full items-center ${isCollapsed ? 'justify-center px-2 py-2.5' : 'px-4 py-2.5'} text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors`}
          >
            <LogOut className={isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'} />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </>
  );
}
