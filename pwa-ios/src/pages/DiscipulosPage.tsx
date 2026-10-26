import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, AsistenteItem } from '../lib/supabase';
import { Users, Search, Phone, MessageCircle, UserPlus, Sparkles, X, Check } from 'lucide-react';

export default function DiscipulosPage() {
  const { user } = useAuth();
  const [discipulos, setDiscipulos] = useState<AsistenteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal para agregar nuevo discípulo
  const [showAddModal, setShowAddModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoWhatsapp, setNuevoWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);

  const loadDiscipulos = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asistentes_celula')
        .select('*')
        .eq('lider_id', user.id)
        .order('nombre', { ascending: true });

      if (!error && data) {
        setDiscipulos(data as AsistenteItem[]);
      }
    } catch (err) {
      console.error('Error cargando discípulos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscipulos();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('asistentes_celula').insert({
        lider_id: user.id,
        nombre: nuevoNombre.trim(),
        telefono: nuevoTelefono.trim(),
        whatsapp: nuevoWhatsapp.trim() || nuevoTelefono.trim(),
      });

      if (!error) {
        setNuevoNombre('');
        setNuevoTelefono('');
        setNuevoWhatsapp('');
        setShowAddModal(false);
        await loadDiscipulos();
      }
    } catch (err) {
      console.error('Error al guardar discípulo:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredDiscipulos = discipulos.filter((d) => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.telefono && d.telefono.includes(searchTerm))
  );

  return (
    <div className="py-4 px-5 pb-24 max-w-lg mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Discípulos <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400">Directorio de miembros y seguimiento</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2.5 rounded-xl gold-gradient text-black font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      {/* Buscador */}
      <div className="glass-ios rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-white/10 mb-5">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredDiscipulos.length === 0 ? (
        <div className="glass-ios rounded-3xl p-8 text-center text-slate-400 my-4">
          <Users className="w-12 h-12 mx-auto text-slate-500 mb-3 opacity-50" />
          <p className="text-sm font-medium">No se encontraron miembros registrados.</p>
          <p className="text-xs text-slate-500 mt-1">Toca en "Nuevo" para agregar un discípulo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDiscipulos.map((item) => {
            const cleanPhone = (item.telefono || '').replace(/\D/g, '');
            return (
              <div key={item.id} className="glass-ios rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{item.nombre}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.telefono || 'Sin teléfono'}</p>
                </div>

                <div className="flex items-center gap-2">
                  {item.telefono && (
                    <a
                      href={`tel:${cleanPhone}`}
                      className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center hover:bg-blue-500/25 active:scale-95 transition-all"
                      title="Llamar"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {item.telefono && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/25 active:scale-95 transition-all"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Agregar Discípulo */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col justify-end p-0">
          <div className="bg-[#131B2E] border-t border-white/15 rounded-t-[32px] p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Nuevo Discípulo</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase pl-1 block mb-1">Nombre Completo *</label>
                <div className="glass-ios rounded-2xl px-4 py-2.5 border border-white/10">
                  <input 
                    type="text" 
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder="Nombre y apellido"
                    required
                    className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase pl-1 block mb-1">Teléfono Móvil</label>
                <div className="glass-ios rounded-2xl px-4 py-2.5 border border-white/10">
                  <input 
                    type="tel" 
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 py-3.5 rounded-2xl gold-gradient text-black font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Guardar Discípulo
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
