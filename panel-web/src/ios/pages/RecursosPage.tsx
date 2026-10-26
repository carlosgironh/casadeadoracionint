import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AnuncioItem } from '../lib/supabase';
import { Bell, BookOpen, Calendar, ChevronRight, X, Sparkles } from 'lucide-react';

export default function RecursosPage() {
  const [activeTab, setActiveTab] = useState<'anuncios' | 'bosquejos'>('anuncios');
  const [anuncios, setAnuncios] = useState<AnuncioItem[]>([]);
  const [bosquejos, setBosquejos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBosquejo, setSelectedBosquejo] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [anunciosRes, bosquejosRes] = await Promise.all([
          supabase.from('anuncios').select('*').order('created_at', { ascending: false }),
          supabase.from('bosquejos').select('*').order('created_at', { ascending: false })
        ]);

        if (anunciosRes.data) setAnuncios(anunciosRes.data);
        if (bosquejosRes.data) setBosquejos(bosquejosRes.data);
      } catch (err) {
        console.error('Error cargando recursos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="py-4 px-5 pb-24 max-w-lg mx-auto select-none">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Recursos <Sparkles className="w-4 h-4 text-amber-400" />
        </h1>
        <p className="text-xs text-slate-400">Anuncios y bosquejos para líderes</p>
      </div>

      {/* Segmented Control iOS */}
      <div className="glass-ios p-1 rounded-2xl flex mb-6">
        <button
          onClick={() => setActiveTab('anuncios')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'anuncios'
              ? 'bg-amber-400 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Anuncios
        </button>
        <button
          onClick={() => setActiveTab('bosquejos')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'bosquejos'
              ? 'bg-amber-400 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Bosquejos
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'anuncios' ? (
        <div className="space-y-4">
          {anuncios.length === 0 ? (
            <div className="glass-ios rounded-3xl p-8 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
              <p className="text-sm">No hay anuncios publicados en este momento.</p>
            </div>
          ) : (
            anuncios.map((anuncio) => (
              <div key={anuncio.id} className="glass-ios rounded-3xl overflow-hidden border border-white/10 space-y-3">
                {anuncio.imagen_url && (
                  <div className="w-full h-44 overflow-hidden relative">
                    <img 
                      src={anuncio.imagen_url} 
                      alt={anuncio.titulo} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  </div>
                )}
                <div className="p-4 pt-1">
                  <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" />
                    {anuncio.fecha ? new Date(anuncio.fecha).toLocaleDateString() : 'Aviso'}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{anuncio.titulo}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{anuncio.contenido}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bosquejos.length === 0 ? (
            <div className="glass-ios rounded-3xl p-8 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
              <p className="text-sm">No hay bosquejos disponibles.</p>
            </div>
          ) : (
            bosquejos.map((bosquejo) => (
              <div 
                key={bosquejo.id} 
                onClick={() => setSelectedBosquejo(bosquejo)}
                className="glass-ios rounded-2xl p-4 border border-white/10 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all hover:border-amber-400/30"
              >
                <div className="flex-1 pr-3">
                  <h3 className="text-sm font-bold text-white mb-0.5">{bosquejo.titulo}</h3>
                  <p className="text-xs text-amber-400 font-medium">{bosquejo.versiculo_base || 'Base bíblica'}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Lector de Bosquejo estilo Sheet iOS */}
      {selectedBosquejo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col justify-end p-0">
          <div className="bg-[#131B2E] border-t border-white/15 rounded-t-[32px] max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Cabecera del modal */}
            <div className="p-5 pb-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Bosquejo Pastoral</span>
                <h2 className="text-lg font-bold text-white line-clamp-1">{selectedBosquejo.titulo}</h2>
              </div>
              <button 
                onClick={() => setSelectedBosquejo(null)}
                className="p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido legible */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-200">
              {selectedBosquejo.versiculo_base && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-serif italic">
                  "{selectedBosquejo.versiculo_base}"
                </div>
              )}

              {selectedBosquejo.introduccion && (
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">Introducción</h4>
                  <p className="text-slate-300 whitespace-pre-line">{selectedBosquejo.introduccion}</p>
                </div>
              )}

              {selectedBosquejo.conclusion && (
                <div className="pt-2 border-t border-white/5">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">Conclusión</h4>
                  <p className="text-slate-300 whitespace-pre-line">{selectedBosquejo.conclusion}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

