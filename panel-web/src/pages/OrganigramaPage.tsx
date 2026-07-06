import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Users, User, Shield, Star, Award, Crown, Edit2, X, UserPlus, Briefcase, Calculator, Monitor, FileText, ChevronDown, ChevronRight } from 'lucide-react';

export default function OrganigramaPage() {
  const { supabase } = useSupabase();

  const { data: usuarios, isLoading, refetch } = useQuery({
    queryKey: ['organigrama'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nivel', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: zonas, isLoading: isLoadingZonas } = useQuery({
    queryKey: ['zonas_expansion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zonas_expansion')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Editar
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editCedula, setEditCedula] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editNivel, setEditNivel] = useState(5);
  const [editSystemRole, setEditSystemRole] = useState('user');
  const [isSaving, setIsSaving] = useState(false);

  // Crear
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCedula, setNewCedula] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newNivel, setNewNivel] = useState(6);
  const [newSystemRole, setNewSystemRole] = useState('user');
  const [createError, setCreateError] = useState('');

  // Collapsed State
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { profile } = useAuth();
  const isAdmin = profile?.system_role === 'admin' || profile?.system_role === 'superadmin';

  const handleEditClick = (user: any) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setEditNombre(user.nombre_completo || '');
    setEditEmail(user.email || '');
    setEditUsername(user.username || '');
    setEditPassword(''); // No cargar la contraseña por seguridad
    setEditCedula(user.cedula || '');
    setEditTelefono(user.telefono || '');
    setEditWhatsapp(user.whatsapp || '');
    setEditNivel(user.nivel ?? 6);
    setEditSystemRole(user.system_role || 'user');
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    
    const { error } = await supabase.rpc('admin_update_user', {
      p_user_id: selectedUser.id,
      p_email: editEmail,
      p_nombre: editNombre,
      p_nivel: editNivel,
      p_system_role: editSystemRole,
      p_cedula: editCedula,
      p_telefono: editTelefono,
      p_whatsapp: editWhatsapp,
      p_username: editUsername,
      p_password: editPassword
    });
    
    setIsSaving(false);
    if (!error) {
      setSelectedUser(null);
      refetch();
    } else {
      alert('Error guardando cambios');
    }
  };

  const handleCreateUser = async () => {
    if (!newNombre || !newEmail || !newPassword || !newCedula || !newTelefono || !newUsername || !newWhatsapp) {
      setCreateError('Nombre, Correo, Usuario, Contraseña, Cédula, Teléfono y WhatsApp son obligatorios');
      return;
    }
    setIsSaving(true);
    setCreateError('');

    try {
      const { error } = await supabase.rpc('admin_create_user', {
        p_email: newEmail,
        p_password: newPassword,
        p_nombre: newNombre,
        p_nivel: newNivel,
        p_system_role: newSystemRole,
        p_username: newUsername,
        p_cedula: newCedula,
        p_telefono: newTelefono,
        p_whatsapp: newWhatsapp
      });

      if (error) throw error;

      setShowCreateModal(false);
      setNewNombre('');
      setNewEmail('');
      setNewUsername('');
      setNewPassword('');
      setNewCedula('');
      setNewTelefono('');
      setNewWhatsapp('');
      setNewNivel(6);
      setNewSystemRole('user');
      refetch();
    } catch (err: any) {
      setCreateError(err.message || 'Error al crear usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const getIconForNivel = (nivel: number) => {
    switch (nivel) {
      case 0: return <Crown className="w-6 h-6 text-[#C9A227]" />;
      case 1: return <Star className="w-6 h-6 text-[#C9A227]" />;
      case 3: return <Shield className="w-6 h-6 text-[#0D509E]" />;
      case 4: return <Award className="w-6 h-6 text-[#0D509E]" />;
      case 5: return <User className="w-6 h-6 text-[#5EBBEC]" />;
      case 6: default: return <Users className="w-6 h-6 text-gray-400" />;
    }
  };

  const getTitleForNivel = (nivel: number) => {
    switch (nivel) {
      case 0: return "Apóstoles";
      case 1: return "Pastores";
      case 3: return "Ministros / Obreros";
      case 4: return "Líderes de Red";
      case 5: return "Líderes de Célula";
      case 6: return "Miembros";
      case 7: default: return "No Eclesiástico";
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'superadmin': return "Administradores Principales (Super Admin)";
      case 'admin': return "Administradores de Sistema";
      case 'secretaria': return "Personal de Secretaría";
      case 'contabilidad': return "Contabilidad y Finanzas";
      case 'soporte': return "Soporte Técnico";
      default: return "Otros Roles";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Crown className="w-6 h-6 text-[#C9A227]" />;
      case 'admin': return <Briefcase className="w-6 h-6 text-[#0D509E]" />;
      case 'secretaria': return <FileText className="w-6 h-6 text-[#5EBBEC]" />;
      case 'contabilidad': return <Calculator className="w-6 h-6 text-green-600" />;
      case 'soporte': return <Monitor className="w-6 h-6 text-gray-500" />;
      default: return <Users className="w-6 h-6 text-gray-400" />;
    }
  };

  if (isLoading || isLoadingZonas) {
    return <div className="p-8 text-gray-500">Cargando organigrama...</div>;
  }

  const getZonaForLider = (liderId: string) => {
    return zonas?.find((z: any) => z.lider_id === liderId);
  };

  // Agrupar usuarios Eclesiásticos (todos por nivel, o tal vez excluir a los que no aplican? No, el usuario dijo separarlo)
  // Agrupar usuarios Eclesiásticos
  const niveles = [0, 1, 3, 4, 5, 6];
  const adminRoles = ['superadmin', 'admin', 'contabilidad', 'secretaria', 'soporte'];

  const usuariosEclesiasticos = (usuarios || []).filter(u => 
    u.nivel !== null && 
    u.nivel >= 0 && 
    u.nivel <= 6
  );
  const usuariosAdministrativos = (usuarios || []).filter(u => adminRoles.includes(u.system_role));

  const usuariosPorNivel = usuariosEclesiasticos.reduce((acc: any, curr) => {
    if (!acc[curr.nivel]) acc[curr.nivel] = [];
    acc[curr.nivel].push(curr);
    return acc;
  }, {});

  const usuariosPorRol = usuariosAdministrativos.reduce((acc: any, curr) => {
    if (!acc[curr.system_role]) acc[curr.system_role] = [];
    acc[curr.system_role].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organigrama Eclesiástico</h1>
          <p className="text-gray-500 mt-1">Estructura jerárquica de Casa de Adoración Internacional</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-[#0D509E] text-white rounded-xl hover:bg-[#0b3c75] transition-colors shadow-sm font-medium"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Crear Usuario
          </button>
        )}
      </div>

      {/* ESTRUCTURA ADMINISTRATIVA */}
      {isAdmin && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#0D509E] mb-6 border-b border-gray-200 pb-2">Estructura Administrativa</h2>
          <div className="space-y-8">
            {adminRoles.map(role => {
              const usuariosRol = usuariosPorRol[role] || [];
              if (usuariosRol.length === 0) return null;

              return (
                <div key={role} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <button 
                    onClick={() => toggleSection(`role-${role}`)}
                    className="w-full bg-[#f8fbff] px-5 py-3 border-b border-[#e0f0ff] flex items-center hover:bg-[#f0f7ff] transition-colors text-left focus:outline-none"
                  >
                    {collapsedSections[`role-${role}`] ? <ChevronRight className="w-5 h-5 text-[#0D509E] mr-3" /> : <ChevronDown className="w-5 h-5 text-[#0D509E] mr-3" />}
                    {getRoleIcon(role)}
                    <h2 className="text-lg font-bold text-[#0D509E] ml-3">{getRoleTitle(role)}</h2>
                    <div className="flex-1"></div>
                    <span className="bg-white text-[#0D509E] text-xs font-bold px-2.5 py-1 rounded-full border border-[#b3d7ff]">
                      {usuariosRol.length}
                    </span>
                  </button>
                  {!collapsedSections[`role-${role}`] && (
                    <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {usuariosRol.map((user: any) => (
                        <div key={user.id} className="border border-gray-100 rounded-xl p-3 flex items-start space-x-3 hover:shadow-md transition-shadow bg-white">
                          <div className="w-10 h-10 rounded-full bg-[#f0f7ff] border border-[#d1e6fb] flex items-center justify-center flex-shrink-0">
                            <span className="text-[#0D509E] font-bold text-base">
                              {user.nombre_completo.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 line-clamp-1">{user.nombre_completo}</p>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mb-1">
                              {user.email || 'Sin correo'}
                            </p>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-1.5 text-gray-400 hover:text-[#0D509E] hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
                              title="Editar usuario"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ESTRUCTURA ECLESIÁSTICA */}
      <div>
        <h2 className="text-2xl font-bold text-[#0D509E] mb-6 border-b border-gray-200 pb-2">Estructura Eclesiástica</h2>
        <div className="space-y-10">
          {niveles.map(nivel => {
            const usuariosNivel = usuariosPorNivel[nivel] || [];
            
            // Si el grupo está vacío, lo ocultamos
            if (usuariosNivel.length === 0) return null;

            return (
              <div key={nivel} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection(`nivel-${nivel}`)}
                  className="w-full bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center hover:bg-gray-100 transition-colors text-left focus:outline-none"
                >
                  {collapsedSections[`nivel-${nivel}`] ? <ChevronRight className="w-5 h-5 text-gray-500 mr-3" /> : <ChevronDown className="w-5 h-5 text-gray-500 mr-3" />}
                  {getIconForNivel(nivel)}
                  <h2 className="text-lg font-bold text-gray-900 ml-3">{getTitleForNivel(nivel)}</h2>
                  <div className="flex-1"></div>
                  <span className="bg-white text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
                    {usuariosNivel.length}
                  </span>
                </button>
                
                {!collapsedSections[`nivel-${nivel}`] && (
                <div className="p-4">
                  {usuariosNivel.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No hay personas registradas en este nivel.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {usuariosNivel.map((user: any) => (
                        <div key={user.id} className="border border-gray-100 rounded-xl p-3 flex items-start space-x-3 hover:shadow-md transition-shadow bg-white">
                          <div className="w-10 h-10 rounded-full bg-[#f0f7ff] border border-[#d1e6fb] flex items-center justify-center flex-shrink-0">
                            <span className="text-[#0D509E] font-bold text-base">
                              {user.nombre_completo.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">{user.nombre_completo}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{user.email || 'Sin correo'}</p>
                            
                            {(() => {
                              const zona = getZonaForLider(user.id);
                              if (zona) {
                                return (
                                  <div className="mt-3 text-xs bg-blue-50 text-[#0D509E] rounded p-2 border border-blue-100">
                                    <span className="font-bold block">ZONA {zona.numero_zona}:</span>
                                    {zona.lugares}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            
                            {(user.telefono || user.whatsapp) && (
                              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                📞 {user.telefono || user.whatsapp}
                              </p>
                            )}
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-1.5 text-gray-400 hover:text-[#0D509E] hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
                              title="Editar usuario"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Editar Usuario</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={editNombre} 
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input 
                    type="text" 
                    value={editUsername} 
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                    placeholder="ej. carlosgiron"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    value={editPassword} 
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                    placeholder="Dejar en blanco para no cambiar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cédula o Pasaporte</label>
                  <input 
                    type="text" 
                    value={editCedula} 
                    onChange={(e) => setEditCedula(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Celular o Teléfono</label>
                  <input 
                    type="text" 
                    value={editTelefono} 
                    onChange={(e) => setEditTelefono(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input 
                    type="text" 
                    value={editWhatsapp} 
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Eclesiástico</label>
                <select 
                  value={editNivel}
                  onChange={(e) => setEditNivel(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
                >
                  <option value={0}>0 - Apóstoles</option>
                  <option value={1}>1 - Pastores</option>
                  <option value={3}>3 - Ministros / Obreros</option>
                  <option value={4}>4 - Líderes de Red</option>
                  <option value={5}>5 - Líderes de Célula</option>
                  <option value={6}>6 - Miembros</option>
                  <option value={7}>7 - Sin nivel eclesiástico (No contar)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol de Sistema</label>
                <select 
                  value={editSystemRole}
                  onChange={(e) => setEditSystemRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
                >
                  <option value="user">Ninguno (Miembro General)</option>
                  <option value="soporte">Soporte IT</option>
                  <option value="secretaria">Secretaría (Panel Web)</option>
                  <option value="contabilidad">Contabilidad y Finanzas</option>
                  <option value="admin">Administrador de Sistema</option>
                  <option value="superadmin">Administrador Principal (Super Admin)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveUserChanges}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0D509E] text-white rounded-lg hover:bg-[#0b3c75] disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Crear Nuevo Usuario</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  value={newNombre} 
                  onChange={(e) => setNewNombre(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                  placeholder="ej. carlosgiron"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cédula o Pasaporte *</label>
                  <input 
                    type="text" 
                    value={newCedula} 
                    onChange={(e) => setNewCedula(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                    placeholder="V-12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Celular o Teléfono *</label>
                  <input 
                    type="text" 
                    value={newTelefono} 
                    onChange={(e) => setNewTelefono(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                    placeholder="0414-0000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                  <input 
                    type="text" 
                    value={newWhatsapp} 
                    onChange={(e) => setNewWhatsapp(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                    placeholder="0414-0000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Eclesiástico</label>
                <select 
                  value={newNivel}
                  onChange={(e) => setNewNivel(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
                >
                  <option value={0}>0 - Apóstoles</option>
                  <option value={1}>1 - Pastores</option>
                  <option value={3}>3 - Ministros / Obreros</option>
                  <option value={4}>4 - Líderes de Red</option>
                  <option value={5}>5 - Líderes de Célula</option>
                  <option value={6}>6 - Miembros</option>
                  <option value={7}>7 - Sin nivel eclesiástico (No contar)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol de Sistema</label>
                <select 
                  value={newSystemRole}
                  onChange={(e) => setNewSystemRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
                >
                  <option value="user">Ninguno (Miembro General)</option>
                  <option value="soporte">Soporte IT</option>
                  <option value="secretaria">Secretaría (Panel Web)</option>
                  <option value="contabilidad">Contabilidad y Finanzas</option>
                  <option value="admin">Administrador de Sistema</option>
                  <option value="superadmin">Administrador Principal (Super Admin)</option>
                </select>
              </div>

              {createError && <p className="text-red-500 text-sm mt-2">{createError}</p>}

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0D509E] text-white rounded-lg hover:bg-[#0b3c75] disabled:opacity-50"
                >
                  {isSaving ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
