import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Award, Calendar, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PerfilPage() {
  const { profile, user } = useAuth();

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'superadmin': return 'Administrador Principal (Super Admin)';
      case 'admin': return 'Administrador';
      case 'secretaria': return 'Personal de Secretaría';
      case 'contabilidad': return 'Contabilidad y Finanzas';
      case 'soporte': return 'Soporte Técnico';
      case 'user': return 'Usuario Móvil';
      default: return 'Invitado';
    }
  };

  const getNivelDisplay = (nivel?: number) => {
    switch (nivel) {
      case 0: return "Apóstol";
      case 1: return "Profeta";
      case 2: return "Pastor";
      case 3: return "Líder de Célula";
      case 4: return "Ministro / Servidor";
      case 5: default: return "Miembro";
    }
  };

  if (!profile) {
    return <div className="p-8 text-gray-500">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Detalles de tu cuenta y permisos en la plataforma</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[#0D509E] to-[#5EBBEC]"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="h-24 w-24 bg-white rounded-full p-1 border-4 border-white shadow-md">
              <div className="h-full w-full bg-[#e0f0ff] rounded-full flex items-center justify-center">
                <span className="text-[#0D509E] font-bold text-4xl">
                  {profile.nombre_completo ? profile.nombre_completo.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              {/* Espacio para futuros botones de acción, ej. Editar Perfil */}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{profile.nombre_completo}</h2>
            <p className="text-gray-500 flex items-center mt-1">
              <Shield className="w-4 h-4 mr-1 text-[#0D509E]" />
              {getRoleDisplay(profile.system_role)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Información Eclesiástica</h3>
              
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nivel Eclesiástico</p>
                  <p className="font-semibold text-gray-900">{getNivelDisplay(profile.nivel)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Información de Contacto</h3>
              
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Usuario (Login)</p>
                  <p className="text-gray-900 font-mono bg-gray-50 px-2 py-0.5 rounded text-sm inline-block border border-gray-200 mt-1">
                    {profile.username || 'No configurado'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>

              {profile.telefono && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="text-gray-900">{profile.telefono}</p>
                  </div>
                </div>
              )}

              {profile.fecha_nacimiento && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                    <p className="text-gray-900">
                      {format(new Date(profile.fecha_nacimiento), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              )}

              {profile.direccion && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dirección</p>
                    <p className="text-gray-900">{profile.direccion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
