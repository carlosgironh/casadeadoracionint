import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, profile } = useAuth();

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'superadmin': return 'Administrador Principal';
      case 'admin': return 'Administrador';
      case 'secretaria': return 'Secretaría';
      case 'contabilidad': return 'Contabilidad / Finanzas';
      case 'soporte': return 'Soporte IT';
      case 'user': return 'Usuario App';
      default: return 'Invitado';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{profile?.nombre_completo || user?.email}</p>
          <p className="text-xs text-gray-500 uppercase">{getRoleDisplay(profile?.system_role)}</p>
        </div>
        <Link to="/perfil" className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200">
          <span className="text-gray-700 font-bold text-lg">
            {profile?.nombre_completo ? profile.nombre_completo.charAt(0).toUpperCase() : 'U'}
          </span>
        </Link>
      </div>
    </header>
  );
}
