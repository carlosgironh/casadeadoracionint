import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, profile } = useAuth();

  const getRoleDisplay = (p?: typeof profile) => {
    if (!p) return 'Invitado';
    if (p.system_role === 'user') {
      switch (p.nivel) {
        case 0: return 'Apóstol';
        case 1: return 'Pastor';
        case 3: return 'Ministro / Obrero';
        case 4: return 'Líder de Red';
        case 5: return 'Líder de Célula';
        case 6: return 'Miembro';
        default: return 'Usuario App';
      }
    }
    switch (p.system_role) {
      case 'superadmin': return 'Administrador Principal';
      case 'admin': return 'Administrador';
      case 'secretaria': return 'Secretaría';
      case 'contabilidad': return 'Contabilidad / Finanzas';
      case 'soporte': return 'Soporte IT';
      default: return 'Invitado';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{profile?.nombre_completo || user?.email}</p>
          <p className="text-xs text-gray-500 uppercase">{getRoleDisplay(profile)}</p>
        </div>
        <Link to="/perfil" className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200">
          <span className="text-gray-700 font-bold text-lg">
            {getInitials(profile?.nombre_completo)}
          </span>
        </Link>
      </div>
    </header>
  );
}
