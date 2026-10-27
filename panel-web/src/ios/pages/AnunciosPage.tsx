import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, X } from 'lucide-react';

interface Anuncio {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  imagen_url?: string;
}

export default function AnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnuncios() {
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select('id, titulo, contenido, fecha, imagen_url')
          .order('fecha', { ascending: false });

        if (!error && data) {
          setAnuncios(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnuncios();
  }, []);

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-cai-cyan-gradient px-4 py-6 pb-nav">
      <div className="max-w-md mx-auto">
        {/* Header matching Android AnunciosScreen */}
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-[#004D40] tracking-tight">Anuncios</h2>
          <p className="text-base text-[#007F7F] mt-0.5">Comunicados y eventos de la iglesia</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-[#007F7F] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-[#007F7F]">Cargando anuncios...</p>
          </div>
        ) : anuncios.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            No hay anuncios por el momento.
          </div>
        ) : (
          <div className="space-y-4">
            {anuncios.map((anuncio) => (
              <div
                key={anuncio.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden"
              >
                {anuncio.imagen_url && (
                  <div
                    onClick={() => setSelectedImage(anuncio.imagen_url!)}
                    className="w-full h-48 bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={anuncio.imagen_url}
                      alt={anuncio.titulo}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#00796B] font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(anuncio.fecha).toLocaleDateString('es-PA', { dateStyle: 'long' })}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">{anuncio.titulo}</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{anuncio.contenido}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer animate-in fade-in"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Anuncio"
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
