import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { Bell, Plus, Trash2, Edit2, X, Upload, Maximize2 } from 'lucide-react';

export default function AnunciosPage() {
  const { supabase } = useSupabase();
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnuncio, setSelectedAnuncio] = useState<any>(null);
  const [newAnuncio, setNewAnuncio] = useState({ titulo: '', contenido: '', imagen_url: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAnuncios();
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showModal || viewingImageUrl) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, viewingImageUrl]);

  // Compute image preview URL
  const previewUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return newAnuncio.imagen_url || null;
  }, [imageFile, newAnuncio.imagen_url]);

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
    setNewAnuncio({ titulo: '', contenido: '', imagen_url: '' });
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (anuncio: any) => {
    setSelectedAnuncio(anuncio);
    setNewAnuncio({
      titulo: anuncio.titulo || '',
      contenido: anuncio.contenido || '',
      imagen_url: anuncio.imagen_url || ''
    });
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnuncio(null);
    setImageFile(null);
    setNewAnuncio({ titulo: '', contenido: '', imagen_url: '' });
  };

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('anuncios')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('anuncios')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setNewAnuncio(prev => ({ ...prev, imagen_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = newAnuncio.imagen_url || null;

      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      if (selectedAnuncio) {
        // Edit
        const { error } = await supabase
          .from('anuncios')
          .update({
            titulo: newAnuncio.titulo,
            contenido: newAnuncio.contenido,
            imagen_url: imageUrl,
          })
          .eq('id', selectedAnuncio.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase.from('anuncios').insert([
          {
            titulo: newAnuncio.titulo,
            contenido: newAnuncio.contenido,
            fecha: new Date().toISOString(),
            imagen_url: imageUrl,
          },
        ]);

        if (error) throw error;
      }

      closeModal();
      fetchAnuncios();
    } catch (error: any) {
      console.error('[AnunciosPage] Error guardando anuncio:', error);
      alert(`Error al guardar el anuncio: ${error?.message || 'Verifica la conexión y permisos de Supabase.'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este anuncio?')) {
      const { error } = await supabase.from('anuncios').delete().eq('id', id);
      if (error) {
        console.error('[AnunciosPage] Error al eliminar anuncio:', error);
        alert('Error al eliminar el anuncio. Por favor intenta de nuevo.');
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
              <li key={anuncio.id} className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors">
                <div className="flex gap-4 items-start justify-between">
                  {/* Contenido Izquierda: Icono, Título, Fecha y Texto */}
                  <div className="flex gap-3.5 flex-1 min-w-0 items-start">
                    <div className="bg-blue-50 border border-blue-200/60 p-2.5 rounded-xl text-[#0D509E] shrink-0 mt-0.5">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900">{anuncio.titulo}</h3>
                        <span className="text-xs font-medium text-gray-400">
                          • {anuncio.fecha ? new Date(anuncio.fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : 'Reciente'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {anuncio.contenido}
                      </p>
                    </div>
                  </div>

                  {/* Contenido Derecha: Miniatura compacta y botones de acción */}
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    {anuncio.imagen_url && (
                      <button
                        type="button"
                        onClick={() => setViewingImageUrl(anuncio.imagen_url)}
                        className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:ring-2 hover:ring-[#0D509E] transition-all bg-gray-50 shrink-0"
                        title="Clic para ver imagen completa"
                      >
                        <img 
                          src={anuncio.imagen_url} 
                          alt="Miniatura" 
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover group-hover:scale-105 transition-transform duration-200" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </button>
                    )}

                    <div className="flex flex-col sm:flex-row gap-1">
                      <button
                        onClick={() => openEditModal(anuncio)}
                        className="p-2 text-gray-400 hover:text-[#0D509E] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(anuncio.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

      {/* Modal Lightbox para ver la imagen en tamaño completo */}
      {viewingImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setViewingImageUrl(null)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingImageUrl(null)}
              className="absolute -top-12 right-0 sm:top-2 sm:right-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-colors"
              title="Cerrar vista"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={viewingImageUrl} 
              alt="Imagen completa del anuncio" 
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/10" 
            />
          </div>
        </div>
      )}

      {/* Modal de Crear / Editar Anuncio */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedAnuncio ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
              </h2>
              <button 
                type="button"
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Formulario con cuerpo scrollable independiente */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
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
                    rows={4}
                    value={newAnuncio.contenido}
                    onChange={(e) => setNewAnuncio({ ...newAnuncio, contenido: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D509E] focus:border-transparent outline-none transition-all resize-y"
                    placeholder="Detalles del anuncio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (Opcional)</label>
                  {previewUrl ? (
                    <div className="relative border border-gray-200 rounded-xl p-3 bg-gray-50 flex flex-col items-center">
                      <img 
                        src={previewUrl} 
                        alt="Vista previa" 
                        className="rounded-lg max-h-48 w-full object-cover border border-gray-200"
                      />
                      <div className="flex gap-2 mt-3 w-full justify-end">
                        <label className="cursor-pointer text-xs font-semibold text-[#0D509E] hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors">
                          Cambiar imagen
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setImageFile(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                        >
                          Quitar imagen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#0D509E] transition-all">
                      <Upload className="h-9 w-9 text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600 font-medium text-center">
                        <span className="text-[#0D509E]">Haz clic para subir un archivo</span> o arrastra y suelta
                      </div>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG o WEBP hasta 10MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              
              {/* Footer fijo de acciones */}
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-200/60 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-[#0D509E] text-white hover:bg-[#0b3c75] rounded-xl font-bold shadow-md shadow-blue-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {uploading ? 'Guardando...' : selectedAnuncio ? 'Actualizar' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
