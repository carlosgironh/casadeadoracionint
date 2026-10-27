import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, LogOut, CheckCircle2 } from 'lucide-react';

interface PerfilPageProps {
  onBack: () => void;
}

export default function PerfilPage({ onBack }: PerfilPageProps) {
  const { user, signOut } = useAuth();
  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [cedula, setCedula] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [direccion, setDireccion] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchPerfil() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('nombre_completo, username, cedula, whatsapp, direccion')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setNombre(data.nombre_completo || '');
          setUsername(data.username || '');
          setCedula(data.cedula || '');
          setWhatsapp(data.whatsapp || '');
          setDireccion(data.direccion || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPerfil();
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setFeedback(null);

    try {
      // 1. Update public.usuarios
      const { error: userError } = await supabase
        .from('usuarios')
        .update({
          nombre_completo: nombre,
          username: username.replace(/\s+/g, ''),
          cedula: cedula.trim(),
          whatsapp: whatsapp.trim() || null,
          direccion: direccion.trim() || null
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // 2. Update password if provided
      if (newPassword.trim()) {
        const { error: passError } = await supabase.auth.updateUser({
          password: newPassword.trim()
        });
        if (passError) throw passError;
        setNewPassword('');
      }

      setFeedback({ type: 'success', text: 'Perfil actualizado con éxito.' });
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Error al guardar cambios';
      setFeedback({ type: 'error', text: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F9FAFB] flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* TopAppBar matching Android Scaffold: containerColor = Color.White, back arrow = Color(0xFF004D40) */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200/80 pt-safe shadow-xs">
        <div className="h-16 px-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-[#004D40] cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#004D40]" />
          </button>
          <h2 className="text-xl font-bold text-slate-800">Mi Perfil</h2>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-6 pb-16">
        <div>
          <h3 className="text-3xl font-extrabold text-[#004D40] tracking-tight">Mi Perfil</h3>
          <p className="text-sm text-[#6B7280] mt-0.5">Visualiza y edita tus datos</p>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-[#E0F2F1] text-[#004D40] border border-[#00796B]'
                : 'bg-[#FFEBEE] text-[#C62828] border border-red-200'
            }`}
          >
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#004D40]" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-[#00796B] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-[#00796B]">Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <h4 className="font-bold text-[#374151] text-base">Datos Personales</h4>

              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre de Usuario</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Documento / Cédula</label>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">WhatsApp / Teléfono</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+507 6000-0000"
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Dirección</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-600">Cambiar Contraseña (opcional)</label>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
                />
              </div>
            </div>

            {/* Save Button (gradient: listOf(Color(0xFF00796B), Color(0xFF004D40))) */}
            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 bg-cai-primary-btn text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>

            {/* Logout Button (gradient: listOf(Color(0xFFDC2626), Color(0xFF991B1B)) matching Android PerfilScreen line 249) */}
            <button
              type="button"
              onClick={signOut}
              className="w-full h-12 bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer mt-3"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
