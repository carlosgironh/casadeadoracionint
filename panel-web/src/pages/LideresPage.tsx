import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';
import { Search, X, Users, BookOpen, Crown, Star, Shield, Award, User, Contact2 } from 'lucide-react';

export default function LideresPage() {
  const { supabase } = useSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);

  // Consultar todos los líderes (Nivel 0 al 5)
  const { data: lideres, isLoading } = useQuery({
    queryKey: ['directorio_lideres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre_completo, email, nivel, system_role, telefono, whatsapp, cedula')
        .lte('nivel', 5)
        .order('nombre_completo', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const selectedLeader = lideres?.find(l => l.id === selectedLeaderId);

  // Consultar estadísticas del líder seleccionado
  const { data: liderStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['lider_stats', selectedLeaderId],
    enabled: !!selectedLeaderId,
    queryFn: async () => {
      // 1. Obtener sus clases y detalles como asistente (si existe)
      const { data: asistenteData, error: asistenteError } = await supabase
        .from('asistentes_celula')
        .select('clase_juan, clase_tcd, clase_bautismo, clase_vision, clase_liderazgo, celular')
        .eq('usuario_id', selectedLeaderId)
        .maybeSingle();

      if (asistenteError) throw asistenteError;

      // 2. Obtener la cantidad de discípulos bajo su cargo
      const { count: countDiscipulos, error: countError } = await supabase
        .from('asistentes_celula')
        .select('id', { count: 'exact', head: true })
        .eq('lider_id', selectedLeaderId);

      if (countError) throw countError;

      return {
        clases: asistenteData || {
          clase_juan: false, clase_tcd: false, clase_bautismo: false, clase_vision: false, clase_liderazgo: false
        },
        discipulos: countDiscipulos || 0,
      };
    }
  });

  const filteredLideres = lideres?.filter(lider => 
    lider.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lider.cedula?.includes(searchTerm)
  ) || [];

  const getRoleIcon = (nivel: number) => {
    switch (nivel) {
      case 0: return <Crown className="w-5 h-5 text-[#C9A227]" />;
      case 1: return <Star className="w-5 h-5 text-[#C9A227]" />;
      case 3: return <Shield className="w-5 h-5 text-[#0D509E]" />;
      case 4: return <Award className="w-5 h-5 text-[#0D509E]" />;
      case 5: return <User className="w-5 h-5 text-[#5EBBEC]" />;
      default: return <Users className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleTitle = (nivel: number) => {
    switch (nivel) {
      case 0: return "Apóstol";
      case 1: return "Pastor";
      case 3: return "Ministro / Obrero";
      case 4: return "Líder de Red";
      case 5: return "Líder de Célula";
      default: return "Miembro";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="space-y-8 flex">
      {/* Listado principal */}
      <div className={`flex-1 transition-all ${selectedLeaderId ? 'hidden lg:block lg:w-2/3 lg:pr-8' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Contact2 className="w-8 h-8 text-[#0D509E]" /> Directorio de Líderes
            </h1>
            <p className="text-gray-500 mt-1">Busca y revisa el crecimiento de cada líder</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-[#5EBBEC] focus:border-[#5EBBEC]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-gray-500 p-8 text-center bg-white rounded-2xl border border-gray-200">Cargando líderes...</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              {filteredLideres.map(lider => (
                <button
                  key={lider.id}
                  onClick={() => setSelectedLeaderId(lider.id)}
                  className={`w-full text-left p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${selectedLeaderId === lider.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#f0f7ff] border border-[#d1e6fb] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#0D509E] font-bold text-lg">{getInitials(lider.nombre_completo)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{lider.nombre_completo}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleIcon(lider.nivel)}
                      <span className="text-sm text-gray-500">{getRoleTitle(lider.nivel)}</span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-900">{lider.telefono || lider.whatsapp || 'Sin teléfono'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{lider.cedula}</p>
                  </div>
                </button>
              ))}
              {filteredLideres.length === 0 && (
                <div className="p-8 text-center text-gray-500">No se encontraron líderes que coincidan con la búsqueda.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Panel Lateral (Detalles del Líder) */}
      {selectedLeaderId && selectedLeader && (
        <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-2xl shadow-lg flex flex-col h-[calc(100vh-8rem)] sticky top-24">
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-full bg-[#0D509E] flex items-center justify-center text-white font-bold text-xl">
                {getInitials(selectedLeader.nombre_completo)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedLeader.nombre_completo}</h2>
                <div className="flex items-center gap-1 text-[#0D509E] mt-1">
                  {getRoleIcon(selectedLeader.nivel)}
                  <span className="font-medium text-sm">{getRoleTitle(selectedLeader.nivel)}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedLeaderId(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Reporte de Crecimiento</h3>
            
            {isLoadingStats ? (
              <div className="text-gray-500 animate-pulse">Cargando estadísticas...</div>
            ) : (
              <div className="space-y-6">
                
                {/* Estadísticas */}
                <div className="bg-[#f8fbff] border border-[#d1e6fb] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-[#0D509E]">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Discípulos a cargo</p>
                      <p className="text-2xl font-bold text-[#0D509E]">{liderStats?.discipulos}</p>
                    </div>
                  </div>
                </div>

                {/* Progreso de Clases */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#5EBBEC]" /> Formación Eclesiástica
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'clase_juan', label: '1. Evangelio de Juan' },
                      { key: 'clase_bautismo', label: '2. Bautismo' },
                      { key: 'clase_tcd', label: '3. Tu Camino al Destino (TCD)' },
                      { key: 'clase_vision', label: '4. Visión CAI' },
                      { key: 'clase_liderazgo', label: '5. Liderazgo' }
                    ].map(clase => (
                      <div key={clase.key} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-gray-700">{clase.label}</span>
                        {liderStats?.clases[clase.key as keyof typeof liderStats.clases] ? (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Completada</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">Pendiente</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacto */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Información de Contacto</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium">Correo:</span> {selectedLeader.email || 'No registrado'}</p>
                    <p><span className="font-medium">Cédula:</span> {selectedLeader.cedula || 'No registrada'}</p>
                    <p><span className="font-medium">WhatsApp:</span> {selectedLeader.whatsapp || selectedLeader.telefono || 'No registrado'}</p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
