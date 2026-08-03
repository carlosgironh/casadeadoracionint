import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Users, LogOut, Bell, Contact2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen }: SidebarProps) {
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
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between md:justify-center">
          <img src="/logo.png" alt="Casa de Adoracion Int Logo" className="h-20 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.insertAdjacentHTML('afterend', '<h1 class="text-xl font-bold text-[#0D509E]">Casa de Adoracion Int Logo Falta</h1>'); }} />
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsOpen && setIsOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen && setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
