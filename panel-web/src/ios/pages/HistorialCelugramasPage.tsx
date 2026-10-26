import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Users, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface HistorialCelugramasPageProps {
  onBack: () => void;
}

export default function HistorialCelugramasPage({ onBack }: HistorialCelugramasPageProps) {
  const { user } = useAuth();
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistorial() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('informes_celula')
          .select('*')
          .eq('lider_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setReportes(data);
        }
      } catch (err) {
        console.error('Error cargando historial:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistorial();
  }, [user]);

  return (
    <div className="py-4 px-5 pb-24 max-w-lg mx-auto select-none">
      {/* Barra superior con volver */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl glass-ios text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Historial de Reportes</h1>
          <p className="text-xs text-slate-400">Celugramas enviados por tu célula</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reportes.length === 0 ? (
        <div className="glass-ios rounded-3xl p-8 text-center text-slate-400 my-8">
          <Calendar className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <p className="text-sm font-medium">Aún no has enviado ningún reporte de celugrama.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportes.map((rep) => (
            <div key={rep.id} className="glass-ios rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">{rep.nombre_celula || 'Célula'}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  rep.estado === 'aprobado' ? 'bg-emerald-500/20 text-emerald-400' :
                  rep.estado === 'rechazado' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {rep.estado === 'aprobado' ? <CheckCircle2 className="w-3 h-3" /> :
                   rep.estado === 'rechazado' ? <XCircle className="w-3 h-3" /> :
                   <Clock className="w-3 h-3" />}
                  {rep.estado || 'Pendiente'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Fecha</span>
                  <span className="font-semibold text-slate-200">{rep.fecha_reunion || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Asistencia</span>
                  <span className="font-semibold text-slate-200 flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" /> {rep.asistencia_total}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ofrenda</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                    <DollarSign className="w-3 h-3" /> {rep.ofrenda || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

