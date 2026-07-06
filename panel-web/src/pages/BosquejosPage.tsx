import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Bosquejo {
  id: string;
  titulo: string;
  versiculo_base: string;
  introduccion: string;
  puntos_desarrollo: string[];
  conclusion: string;
  tipo: 'evangelistico' | 'discipulado';
  red_dirigida_id: string;
  mes: number;
  anio: number;
  autor_id: string;
  publicado: boolean;
  created_at: string;
  redes?: { nombre: string };
}

export default function BosquejosPage() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedBosquejo, setSelectedBosquejo] = useState<Bosquejo | null>(null);

  // Form state
  const [titulo, setTitulo] = useState('');
  const [versiculoBase, setVersiculoBase] = useState('');
  const [introduccion, setIntroduccion] = useState('');
  const [puntos, setPuntos] = useState<{titulo: string, desarrollo: string}[]>([{titulo: '', desarrollo: ''}]);
  const [conclusion, setConclusion] = useState('');
  const [tipo, setTipo] = useState<'evangelistico' | 'discipulado'>('evangelistico');
  const [redId, setRedId] = useState('');
  const [mes] = useState(new Date().getMonth() + 1);
  const [anio] = useState(new Date().getFullYear());
  
  const { data: redes } = useQuery({
    queryKey: ['redes'],
    queryFn: async () => {
      const { data } = await supabase.from('redes').select('*').eq('activa', true);
      return data || [];
    },
  });

  const { data: bosquejos, isLoading } = useQuery({
    queryKey: ['bosquejos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bosquejos')
        .select('*, redes(nombre)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Bosquejo[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (nuevo: Partial<Bosquejo>) => {
      const { data, error } = await supabase.from('bosquejos').insert([nuevo]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bosquejos'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (datos: Partial<Bosquejo> & { id: string }) => {
      const { id, ...resto } = datos;
      const { data, error } = await supabase.from('bosquejos').update(resto).eq('id', id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bosquejos'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bosquejos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bosquejos'] }),
  });

  const openCreateModal = () => {
    setSelectedBosquejo(null);
    setTitulo('');
    setVersiculoBase('');
    setIntroduccion('');
    setPuntos([{ titulo: '', desarrollo: '' }]);
    setConclusion('');
    setTipo('evangelistico');
    setRedId('');
    setShowModal(true);
  };

  const openEditModal = (bosquejo: Bosquejo) => {
    setSelectedBosquejo(bosquejo);
    setTitulo(bosquejo.titulo);
    setVersiculoBase(bosquejo.versiculo_base);
    setIntroduccion(bosquejo.introduccion);
    
    if (bosquejo.puntos_desarrollo && bosquejo.puntos_desarrollo.length > 0) {
      setPuntos(bosquejo.puntos_desarrollo.map(p => {
        const parts = p.split('\n');
        const titulo = parts[0] || '';
        const desarrollo = parts.slice(1).join('\n') || '';
        return { titulo, desarrollo };
      }));
    } else {
      setPuntos([{ titulo: '', desarrollo: '' }]);
    }
    
    setConclusion(bosquejo.conclusion);
    setTipo(bosquejo.tipo);
    setRedId(bosquejo.red_dirigida_id || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBosquejo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      titulo,
      versiculo_base: versiculoBase,
      introduccion,
      puntos_desarrollo: puntos
        .filter(p => p.titulo.trim() !== '' || p.desarrollo.trim() !== '')
        .map(p => p.desarrollo.trim() ? `${p.titulo}\n${p.desarrollo}` : p.titulo),
      conclusion,
      tipo,
      red_dirigida_id: redId || (redes && redes.length > 0 ? redes[0].id : null),
      mes,
      anio,
      autor_id: user.id,
      publicado: true
    };

    if (selectedBosquejo) {
      updateMutation.mutate({ ...payload, id: selectedBosquejo.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bosquejos</h1>
        <button 
          onClick={openCreateModal}
          className="flex items-center bg-[#0D509E] hover:bg-[#0b3c75] text-white font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Bosquejo
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-900">Cargando bosquejos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bosquejos?.map(b => (
            <div key={b.id} className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 text-[10px] font-semibold rounded-md ${b.tipo === 'evangelistico' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                  {b.tipo.toUpperCase()}
                </span>
                <span className="text-[11px] text-gray-500">{format(new Date(b.created_at), 'dd MMM yyyy', { locale: es })}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{b.titulo}</h3>
              <p className="text-[#0D509E] text-xs mb-2 font-medium">{b.versiculo_base}</p>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {b.introduccion}
              </p>
              
              <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-[11px] text-gray-500 font-medium">{b.redes?.nombre || 'General'}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => openEditModal(b)} className="p-1.5 text-[#0D509E] bg-[#0D509E]/10 hover:bg-[#0D509E]/20 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { if(window.confirm('¿Seguro que deseas eliminar este bosquejo?')) deleteMutation.mutate(b.id) }} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {bosquejos?.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-10 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
              No hay bosquejos registrados aún. Haz clic en "Nuevo Bosquejo" para empezar.
            </p>
          )}
        </div>
      )}

      {/* MODAL CREAR / EDITAR BOSQUEJO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedBosquejo ? 'Editar Bosquejo' : 'Crear Nuevo Bosquejo'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Versículo Base</label>
                  <input type="text" required value={versiculoBase} onChange={e => setVersiculoBase(e.target.value)} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all" placeholder="Ej. Juan 3:16" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Bosquejo</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value as any)} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all">
                    <option value="evangelistico">Evangelístico</option>
                    <option value="discipulado">Discipulado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Red Dirigida</label>
                  <select value={redId} onChange={e => setRedId(e.target.value)} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all">
                    <option value="">General (Para todos)</option>
                    {redes?.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Introducción</label>
                <textarea required rows={5} value={introduccion} onChange={e => setIntroduccion(e.target.value)} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puntos de Desarrollo</label>
                <div className="space-y-4">
                  {puntos.map((punto, index) => (
                    <div key={index} className="flex gap-2 items-start border border-gray-200 p-4 rounded-xl bg-white">
                      <div className="flex-1 flex flex-col gap-3">
                        <input 
                          type="text" 
                          value={punto.titulo} 
                          onChange={e => {
                            const newPuntos = [...puntos];
                            newPuntos[index].titulo = e.target.value;
                            setPuntos(newPuntos);
                          }} 
                          placeholder={`Título del Punto ${index + 1}`}
                          className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all" 
                        />
                        <textarea 
                          rows={3}
                          value={punto.desarrollo} 
                          onChange={e => {
                            const newPuntos = [...puntos];
                            newPuntos[index].desarrollo = e.target.value;
                            setPuntos(newPuntos);
                          }} 
                          placeholder={`Desarrollo...`}
                          className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all resize-y" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        {index === puntos.length - 1 && (
                          <button type="button" onClick={() => setPuntos([...puntos, { titulo: '', desarrollo: '' }])} className="px-4 py-2 bg-[#0D509E]/10 hover:bg-[#0D509E]/20 text-[#0D509E] font-bold rounded-xl transition-colors h-11 flex items-center justify-center" title="Agregar nuevo punto">+</button>
                        )}
                        {puntos.length > 1 && (
                          <button type="button" onClick={() => setPuntos(puntos.filter((_, i) => i !== index))} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition-colors h-11 flex items-center justify-center" title="Eliminar punto">-</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conclusión</label>
                <textarea required rows={5} value={conclusion} onChange={e => setConclusion(e.target.value)} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-2.5 rounded-xl bg-[#0D509E] hover:bg-[#0b3c75] text-white font-bold transition-all shadow-md shadow-blue-900/20 disabled:opacity-70 flex items-center">
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Guardando...
                    </span>
                  ) : (
                    selectedBosquejo ? 'Actualizar Bosquejo' : 'Publicar Bosquejo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
