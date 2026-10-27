import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Share2, Download } from 'lucide-react';

interface Bosquejo {
  id: string;
  titulo: string;
  tipo: string;
  versiculo_base?: string;
  contenido?: string;
  archivo_url?: string;
  created_at: string;
}

export default function BosquejosPage() {
  const [bosquejos, setBosquejos] = useState<Bosquejo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'Todos' | 'Discipulado' | 'Evangelísticos'>('Todos');

  useEffect(() => {
    async function fetchBosquejos() {
      try {
        const { data, error } = await supabase
          .from('bosquejos')
          .select('id, titulo, tipo, versiculo_base, contenido, archivo_url, created_at')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setBosquejos(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBosquejos();
  }, []);

  const filtered = bosquejos.filter((b) => {
    if (selectedTab === 'Todos') return true;
    if (selectedTab === 'Discipulado') return b.tipo?.toLowerCase().includes('discipulado');
    if (selectedTab === 'Evangelísticos') return b.tipo?.toLowerCase().includes('evangelistic') || b.tipo?.toLowerCase().includes('evangelistico');
    return true;
  });

  const handleShare = async (b: Bosquejo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: b.titulo,
          text: `Bosquejo: ${b.titulo}\nVersículo Base: ${b.versiculo_base || ''}\n\n${b.contenido || ''}`,
          url: b.archivo_url || window.location.href
        });
      } catch {
        // Ignored
      }
    } else if (b.archivo_url) {
      window.open(b.archivo_url, '_blank');
    }
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-cai-cyan-gradient px-4 py-6 pb-nav">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-3xl font-extrabold text-[#004D40] tracking-tight">Bosquejos</h2>
          <p className="text-base text-[#007F7F] mt-0.5">Material para tu célula semanal</p>
        </div>

        {/* Tab row matching Android PrimaryTabRow */}
        <div className="flex border-b border-slate-200/80 mb-5">
          {(['Todos', 'Discipulado', 'Evangelísticos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 pb-3 text-sm font-bold text-center transition-colors relative cursor-pointer ${
                selectedTab === tab ? 'text-[#007F7F]' : 'text-gray-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {selectedTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007F7F]" />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-[#007F7F] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-[#007F7F]">Cargando bosquejos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            No hay bosquejos disponibles en esta categoría.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E0F2F1] text-[#00796B]">
                      {b.tipo || 'General'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 leading-snug">{b.titulo}</h3>
                  </div>
                  <button
                    onClick={() => handleShare(b)}
                    className="p-2 text-slate-400 hover:text-[#00796B] hover:bg-slate-50 rounded-full transition-colors cursor-pointer shrink-0"
                    title="Compartir"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {b.versiculo_base && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 font-medium">
                    <span className="font-bold text-[#004D40]">Versículo Base: </span>
                    {b.versiculo_base}
                  </div>
                )}

                {b.contenido && (
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {b.contenido}
                  </p>
                )}

                {b.archivo_url && (
                  <a
                    href={b.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#00796B] hover:underline pt-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar PDF o Material Adjunto</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
