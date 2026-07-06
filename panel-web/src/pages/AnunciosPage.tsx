import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { Bell, Plus, Trash2, Edit2, X } from 'lucide-react';

export default function AnunciosPage() {
  const { supabase } = useSupabase();
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnuncio, setSelectedAnuncio] = useState<any>(null);
  const [newAnuncio, setNewAnuncio] = useState({ titulo: '', contenido: '' });

  useEffect(() => {
    fetchAnuncios();
  }, []);

  const fetchAnuncios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anuncios')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching anuncios:', error);
    } else {
      setAnuncios(data || []);
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setSelectedAnuncio(null);
    setNewAnuncio({ titulo: '', contenido: '' });
    setShowModal(true);
  };

  const openEditModal = (anuncio: any) => {
    setSelectedAnuncio(anuncio);
    setNewAnuncio({ titulo: anuncio.titulo, contenido: anuncio.contenido });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnuncio(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAnuncio) {
      // Edit
      const { error } = await supabase
        .from('anuncios')
        .update({
          titulo: newAnuncio.titulo,
          contenido: newAnuncio.contenido,
        })
        .eq('id', selectedAnuncio.id);

      if (error) {
        alert('Error editando anuncio: ' + error.message);
      } else {
        closeModal();
        fetchAnuncios();
      }
    } else {
      // Create
      const { error } = await supabase.from('anuncios').insert([
        {
          titulo: newAnuncio.titulo,
          contenido: newAnuncio.contenido,
        },
      ]);

      if (error) {
        alert('Error creando anuncio: ' + error.message);
      } else {
        closeModal();
        fetchAnuncios();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este anuncio?')) {
      const { error } = await supabase.from('anuncios').delete().eq('id', id);
      if (error) {
        alert('Error al eliminar: ' + error.message);
      } else {
        fetchAnuncios();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Anuncios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los anuncios que se mostrarán en la aplicación móvil a los líderes.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#0D509E] text-white px-4 py-2 rounded-xl hover:bg-[#0b3c75] flex items-center transition-colors font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Anuncio
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando anuncios...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {anuncios.map((anuncio) => (
              <li key={anuncio.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-blue-100/50 border border-blue-200 p-2.5 rounded-xl text-[#0D509E] shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{anuncio.titulo}</h3>
                      <p className="text-xs font-semibold text-gray-400 mt-0.5 mb-1.5">
                        {new Date(anuncio.fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{anuncio.contenido}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 shrink-0 ml-3">
                    <button
                      onClick={() => openEditModal(anuncio)}
                      className="p-1.5 text-gray-400 hover:text-[#0D509E] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(anuncio.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {anuncios.length === 0 && (
              <li className="p-10 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <Bell className="w-12 h-12 text-gray-300 mb-3" />
                  <p>No hay anuncios publicados. Haz clic en "Nuevo Anuncio" para empezar.</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-0 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedAnuncio ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={newAnuncio.titulo}
                  onChange={(e) => setNewAnuncio({ ...newAnuncio, titulo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all"
                  placeholder="Ej: Ayuno General"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea
                  required
                  rows={5}
                  value={newAnuncio.contenido}
                  onChange={(e) => setNewAnuncio({ ...newAnuncio, contenido: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all"
                  placeholder="Detalles del anuncio..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0D509E] text-white hover:bg-[#0b3c75] rounded-xl font-bold shadow-md shadow-blue-900/20 transition-all"
                >
                  {selectedAnuncio ? 'Actualizar' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
