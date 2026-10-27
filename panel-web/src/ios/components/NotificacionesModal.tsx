import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Notificacion {
  id: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
}

interface NotificacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCountUpdate?: (count: number) => void;
}

export default function NotificacionesModal({ isOpen, onClose, onCountUpdate }: NotificacionesModalProps) {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    async function fetchNotificaciones() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notificaciones')
          .select('id, mensaje, leido, created_at')
          .eq('usuario_id', user!.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setNotificaciones(data);
          const unread = data.filter((n) => !n.leido).length;
          onCountUpdate?.(unread);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotificaciones();
  }, [isOpen, user]);

  async function handleClose() {
    const unreadIds = notificaciones.filter((n) => !n.leido).map((n) => n.id);
    if (unreadIds.length > 0) {
      try {
        await supabase
          .from('notificaciones')
          .update({ leido: true })
          .in('id', unreadIds);
        setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
        onCountUpdate?.(0);
      } catch (err) {
        console.error(err);
      }
    }
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        <h3 className="text-xl font-bold text-[#004D40] mb-3">Notificaciones</h3>

        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          {loading ? (
            <div className="text-center py-6 text-gray-400 text-sm">Cargando notificaciones...</div>
          ) : notificaciones.length === 0 ? (
            <p className="text-[#64748B] text-sm py-4">No tienes notificaciones.</p>
          ) : (
            notificaciones.map((noti) => (
              <div
                key={noti.id}
                className={`p-3.5 rounded-2xl text-sm transition-colors ${
                  noti.leido ? 'bg-[#F1F5F9] text-slate-700 font-normal' : 'bg-[#E0F2FE] text-slate-900 font-bold'
                }`}
              >
                {noti.mensaje}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-2 flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-[#004D40] font-bold text-sm rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
