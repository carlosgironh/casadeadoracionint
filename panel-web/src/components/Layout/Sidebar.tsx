import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Users, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Anuncios', href: '/anuncios', icon: Bell },
    { name: 'Bosquejos', href: '/bosquejos', icon: BookOpen },
    { name: 'Informes', href: '/informes', icon: FileText },
    { name: 'Organigrama', href: '/organigrama', icon: Users },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex items-center justify-center">
        <img src="/logo.png" alt="Casa de Adoracion Int Logo" className="h-20 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.insertAdjacentHTML('afterend', '<h1 class="text-xl font-bold text-[#0D509E]">Casa de Adoracion Int Logo Falta</h1>'); }} />
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
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
          className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-500 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
