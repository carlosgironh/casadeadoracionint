import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../contexts/SupabaseContext';
import { User, Mail, Shield, Award, Phone, Save, X, Edit2 } from 'lucide-react';

export default function PerfilPage() {
  const { profile, user } = useAuth();
  const { supabase } = useSupabase();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    username: '',
    telefono: '',
    whatsapp: '',
    cedula: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nombre_completo: profile.nombre_completo || '',
        username: profile.username || '',
        telefono: profile.telefono || '',
        whatsapp: profile.whatsapp || '',
        cedula: profile.cedula || ''
      });
    }
  }, [profile]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre_completo: formData.nombre_completo,
          username: formData.username,
          telefono: formData.telefono,
          whatsapp: formData.whatsapp,
          cedula: formData.cedula
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Force reload to update profile in context, or just let the user know they need to refresh
      window.location.reload();
      
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Hubo un error al guardar los cambios.");
      setIsSaving(false);
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
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f0f7ff] text-[#0D509E] font-medium rounded-lg border border-[#d1e6fb] hover:bg-[#e0f0ff] transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Editar Perfil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      // Restablecer valores
                      setFormData({
                        nombre_completo: profile.nombre_completo || '',
                        username: profile.username || '',
                        telefono: profile.telefono || '',
                        whatsapp: profile.whatsapp || '',
                        cedula: profile.cedula || ''
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0D509E] text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            {isEditing ? (
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{profile.nombre_completo}</h2>
                <p className="text-gray-500 flex items-center mt-1">
                  <Shield className="w-4 h-4 mr-1 text-[#0D509E]" />
                  {getRoleDisplay(profile)}
                </p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Información Eclesiástica</h3>
              
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nivel Eclesiástico</p>
                  <p className="font-semibold text-gray-900">{getNivelDisplay(profile.nivel)}</p>
                  {isEditing && <p className="text-xs text-orange-500 mt-1">Este campo solo puede ser modificado por un Administrador.</p>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Información de Contacto</h3>
              
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Usuario (Login)</p>
                  {isEditing ? (
                    <input 
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
                    />
                  ) : (
                    <p className="text-gray-900 font-mono bg-gray-50 px-2 py-0.5 rounded text-sm inline-block border border-gray-200 mt-1">
                      {profile.username || 'No configurado'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                  <p className="text-gray-900 mt-1">{user?.email}</p>
                  {isEditing && <p className="text-xs text-gray-400 mt-1">El correo no se puede cambiar aquí.</p>}
                </div>
              </div>

              {(profile.telefono || isEditing) && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{profile.telefono}</p>
                    )}
                  </div>
                </div>
              )}

              {(profile.whatsapp || isEditing) && (
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{profile.whatsapp}</p>
                    )}
                  </div>
                </div>
              )}

              {(profile.cedula || isEditing) && (
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Cédula</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        name="cedula"
                        value={formData.cedula}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{profile.cedula}</p>
                    )}
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
