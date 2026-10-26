import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle, AlertCircle, History, Sparkles, DollarSign, Users, UserPlus } from 'lucide-react';

interface CelugramaPageProps {
  onViewHistory: () => void;
}

export default function CelugramaPage({ onViewHistory }: CelugramaPageProps) {
  const { user } = useAuth();
  const [nombreCelula, setNombreCelula] = useState('');
  const [lugar, setLugar] = useState('');
  const [fechaReunion, setFechaReunion] = useState(new Date().toISOString().split('T')[0]);
  const [asistenciaTotal, setAsistenciaTotal] = useState('');
  const [nuevosConvertidos, setNuevosConvertidos] = useState('0');
  const [visitas, setVisitas] = useState('0');
  const [ofrenda, setOfrenda] = useState('');
  const [usoBosquejo, setUsoBosquejo] = useState(true);
  const [temaManual, setTemaManual] = useState('');
  const [versiculoManual, setVersiculoManual] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCelula.trim() || !asistenciaTotal) {
      setErrorMsg('Por favor completa el nombre de la célula y la asistencia.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('informes_celula').insert({
        lider_id: user?.id,
        nombre_celula: nombreCelula.trim(),
        lugar: lugar.trim(),
        fecha_reunion: fechaReunion,
        asistencia_total: parseInt(asistenciaTotal) || 0,
        nuevos_convertidos: parseInt(nuevosConvertidos) || 0,
        visitas: parseInt(visitas) || 0,
        ofrenda: parseFloat(ofrenda) || 0,
        uso_bosquejo: usoBosquejo,
        tema_manual: usoBosquejo ? null : temaManual.trim(),
        versiculo_manual: usoBosquejo ? null : versiculoManual.trim(),
        estado: 'pendiente',
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNombreCelula('');
    setLugar('');
    setAsistenciaTotal('');
    setNuevosConvertidos('0');
    setVisitas('0');
    setOfrenda('');
    setTemaManual('');
    setVersiculoManual('');
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">¡Celugrama Enviado!</h2>
        <p className="text-sm text-slate-400 max-w-xs mb-6">
          El reporte semanal de tu célula ha sido registrado y está en revisión administrativa.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onViewHistory}
            className="w-full py-3.5 px-4 rounded-2xl glass-ios border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <History className="w-4 h-4 text-amber-400" />
            Ver Historial de Reportes
          </button>
          <button
            onClick={handleReset}
            className="w-full py-3.5 px-4 rounded-2xl gold-gradient text-black font-bold text-sm shadow-lg"
          >
            Enviar Otro Reporte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-5 pb-24 max-w-lg mx-auto select-none">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Celugrama <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400">Reporte semanal de reunión de célula</p>
        </div>
        <button
          onClick={onViewHistory}
          className="p-2.5 rounded-xl glass-ios text-amber-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
        >
          <History className="w-4 h-4" />
          Historial
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre de la célula */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
            Nombre de la Célula *
          </label>
          <div className="glass-ios rounded-2xl px-4 py-3 border border-white/10">
            <input 
              type="text"
              value={nombreCelula}
              onChange={(e) => setNombreCelula(e.target.value)}
              placeholder="Ej: Célula Betel"
              required
              className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Lugar y Fecha en grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Lugar / Dirección
            </label>
            <div className="glass-ios rounded-2xl px-3 py-3 border border-white/10">
              <input 
                type="text"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Casa de Hno. Juan"
                className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Fecha de Reunión
            </label>
            <div className="glass-ios rounded-2xl px-3 py-3 border border-white/10">
              <input 
                type="date"
                value={fechaReunion}
                onChange={(e) => setFechaReunion(e.target.value)}
                className="bg-transparent text-sm w-full outline-none text-white"
              />
            </div>
          </div>
        </div>

        {/* Asistencias y Métricas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider pl-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" /> Total Asist.
            </label>
            <div className="glass-ios rounded-2xl px-3 py-3 border border-white/10">
              <input 
                type="number"
                min="0"
                value={asistenciaTotal}
                onChange={(e) => setAsistenciaTotal(e.target.value)}
                placeholder="0"
                required
                className="bg-transparent text-base font-bold text-center w-full outline-none text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider pl-1 flex items-center gap-1">
              <UserPlus className="w-3 h-3 text-blue-400" /> Visitas
            </label>
            <div className="glass-ios rounded-2xl px-3 py-3 border border-white/10">
              <input 
                type="number"
                min="0"
                value={visitas}
                onChange={(e) => setVisitas(e.target.value)}
                placeholder="0"
                className="bg-transparent text-base font-bold text-center w-full outline-none text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider pl-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Convertidos
            </label>
            <div className="glass-ios rounded-2xl px-3 py-3 border border-white/10">
              <input 
                type="number"
                min="0"
                value={nuevosConvertidos}
                onChange={(e) => setNuevosConvertidos(e.target.value)}
                placeholder="0"
                className="bg-transparent text-base font-bold text-center w-full outline-none text-white"
              />
            </div>
          </div>
        </div>

        {/* Ofrenda */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Ofrenda Recaudada ($)
          </label>
          <div className="glass-ios rounded-2xl px-4 py-3 flex items-center gap-2 border border-white/10">
            <span className="text-amber-400 font-bold">$</span>
            <input 
              type="number"
              step="0.01"
              min="0"
              value={ofrenda}
              onChange={(e) => setOfrenda(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500 font-semibold"
            />
          </div>
        </div>

        {/* Switch Uso de Bosquejo */}
        <div className="glass-ios rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">¿Se utilizó el bosquejo oficial?</div>
            <div className="text-xs text-slate-400">Predicación provista por la congregación</div>
          </div>
          <button
            type="button"
            onClick={() => setUsoBosquejo(!usoBosquejo)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${usoBosquejo ? 'bg-amber-500' : 'bg-slate-700'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${usoBosquejo ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Si no usó bosquejo oficial: Tema y versículo manual */}
        {!usoBosquejo && (
          <div className="space-y-3 pt-1">
            <div className="glass-ios rounded-2xl px-4 py-3 border border-white/10">
              <input 
                type="text"
                value={temaManual}
                onChange={(e) => setTemaManual(e.target.value)}
                placeholder="Tema predicado"
                className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
              />
            </div>
            <div className="glass-ios rounded-2xl px-4 py-3 border border-white/10">
              <input 
                type="text"
                value={versiculoManual}
                onChange={(e) => setVersiculoManual(e.target.value)}
                placeholder="Versículo bíblico base"
                className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3.5 px-4 rounded-2xl gold-gradient text-black font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar Reporte Semanal
            </>
          )}
        </button>
      </form>
    </div>
  );
}

