import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Award, Phone } from 'lucide-react';


export default function PerfilPage() {
  const { profile, user } = useAuth();

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
      case 'soporte': sysName = 'Soporte Técnico'; break;
      case 'user': sysName = ''; break;
      default: sysName = 'Invitado'; break;
    }

    if (nivelName && sysName) {
      return `${nivelName} / ${sysName}`;
    }
    return nivelName || sysName || 'Invitado';
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
              {getRoleDisplay(profile)}
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

              {profile.whatsapp && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                    <p className="text-gray-900">{profile.whatsapp}</p>
                  </div>
                </div>
              )}

              {profile.cedula && (
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cédula</p>
                    <p className="text-gray-900">{profile.cedula}</p>
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
