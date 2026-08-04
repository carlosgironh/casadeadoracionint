import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, profile } = useAuth();

  const getRoleDisplay = (p?: typeof profile) => {
    if (!p) return 'Invitado';
    
    let nivelName = '';
    if (p.nivel !== undefined && p.nivel !== null) {
      switch (p.nivel) {
        case 0: nivelName = 'Apóstol'; break;
        case 1: nivelName = 'Pastor'; break;
        case 3: nivelName = 'Ministro / Obrero'; break;
        case 4: nivelName = 'Líder de Red'; break;
        case 5: nivelName = 'Líder de Célula'; break;
        case 6: nivelName = 'Miembro'; break;
        default: nivelName = ''; break;
      }
    }

    let sysName = '';
    switch (p.system_role) {
      case 'superadmin': sysName = 'Administrador Principal'; break;
      case 'admin': sysName = 'Administrador'; break;
      case 'secretaria': sysName = 'Secretaría'; break;
      case 'contabilidad': sysName = 'Contabilidad / Finanzas'; break;
      case 'soporte': sysName = 'Soporte IT'; break;
      case 'user': sysName = ''; break; // Si es solo user, no mostramos rol de sistema
      default: sysName = 'Invitado'; break;
    }

    if (nivelName && sysName) {
      return `${nivelName} / ${sysName}`;
    }
    return nivelName || sysName || 'Invitado';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{profile?.nombre_completo || user?.email}</p>
          <p className="text-xs text-gray-500 uppercase">{getRoleDisplay(profile)}</p>
        </div>
        <Link to="/perfil" className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200 shrink-0">
          <span className="text-gray-700 font-bold text-lg">
            {getInitials(profile?.nombre_completo)}
          </span>
        </Link>
      </div>
    </header>
  );
}
