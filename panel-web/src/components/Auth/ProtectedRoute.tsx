import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.system_role === 'user') {
    // Si es un usuario regular, no puede entrar al panel web.
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Acceso Denegado</h1>
        <p className="text-gray-500 text-center mb-6">Esta cuenta pertenece a la Aplicación Móvil. No tienes permisos para acceder al Panel Web Administrativo.</p>
      </div>
    );
  }

  if (allowedRoles && profile?.system_role && !allowedRoles.includes(profile.system_role)) {
    return <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">No tienes los permisos requeridos.</div>;
  }

  return <Outlet />;
}
