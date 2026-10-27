import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, Users, CheckCircle2 } from 'lucide-react';

interface InformeSimple {
  id: string;
  nombre_celula: string;
  fecha_reunion: string;
  asistencia_total: number;
  estado: string;
}

interface HistorialCelugramasPageProps {
  onBack: () => void;
}

export default function HistorialCelugramasPage({ onBack }: HistorialCelugramasPageProps) {
  const { user } = useAuth();
  const [informes, setInformes] = useState<InformeSimple[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInformes() {
      if (!user) return;
      try {
        const { data: usuarioDB } = await supabase
          .from('usuarios')
          .select('id, conyuge_id')
          .eq('id', user.id)
          .single();

        const leaderIds = [user.id];
        if (usuarioDB?.conyuge_id) {
          leaderIds.push(usuarioDB.conyuge_id);
        }

        const { data, error } = await supabase
          .from('informes_celula')
          .select('id, nombre_celula, fecha_reunion, asistencia_total, estado')
          .in('lider_id', leaderIds)
          .order('fecha_reunion', { ascending: false });

        if (!error && data) {
          setInformes(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchInformes();
  }, [user]);

  return (
    <div className="fixed inset-0 z-50 bg-[#F9FAFB] flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* TopAppBar matching Android HistorialCelugramasScreen */}
      <div className="sticky top-0 z-10 bg-[#004D40] text-white pt-safe shadow-md">
        <div className="h-16 px-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">Historial de Celugramas</h2>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-3 pb-12">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-[#004D40] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-[#004D40]">Cargando historial...</p>
          </div>
        ) : informes.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            No tienes celugramas registrados previamente.
          </div>
        ) : (
          informes.map((inf) => (
            <div
              key={inf.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-base">{inf.nombre_celula}</h4>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {inf.estado || 'Enviado'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(inf.fecha_reunion).toLocaleDateString('es-PA', { dateStyle: 'medium' })}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-[#00796B]">
                  <Users className="w-3.5 h-3.5" />
                  <span>Asistentes: {inf.asistencia_total ?? 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
