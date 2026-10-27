import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, ChevronDown, DollarSign, Send, AlertCircle, Save } from 'lucide-react';

interface Celula {
  id: string;
  zona: string;
  direccion: string;
  categoria?: string;
  dia_reunion?: string;
  hora_reunion?: string;
  lider_id?: string;
  colider_id?: string;
}

interface Asistente {
  id: string;
  nombre: string;
  cedula?: string;
}

interface Bosquejo {
  id: string;
  titulo: string;
  versiculo_base?: string;
}

export default function CelugramaPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [activeCell, setActiveCell] = useState<Celula | null>(null);
  const [selectedTab, setSelectedTab] = useState<'reporte' | 'datos'>('reporte');
  const [showCellDropdown, setShowCellDropdown] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isPendiente, setIsPendiente] = useState(false);

  // Form State: Reporte Semanal
  const [usoBosquejo, setUsoBosquejo] = useState(true);
  const [latestBosquejo, setLatestBosquejo] = useState<Bosquejo | null>(null);
  const [temaManual, setTemaManual] = useState('');
  const [versiculoManual, setVersiculoManual] = useState('');
  const [discipulos, setDiscipulos] = useState<Asistente[]>([]);
  const [asistenciaMap, setAsistenciaMap] = useState<Record<string, boolean>>({});
  const [ofrenda, setOfrenda] = useState('');
  const [sending, setSending] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State: Nueva Célula
  const [nuevaZona, setNuevaZona] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Evangelística');
  const [nuevoDia, setNuevoDia] = useState('Viernes');
  const [nuevaHora, setNuevaHora] = useState('19:00');
  const [creatingCell, setCreatingCell] = useState(false);

  // Form State: Editar Célula
  const [editDireccion, setEditDireccion] = useState('');
  const [editDia, setEditDia] = useState('');
  const [editHora, setEditHora] = useState('');
  const [savingDatos, setSavingDatos] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      if (!user) return;
      try {
        // 1. Check user status
        const { data: usuarioDB } = await supabase
          .from('usuarios')
          .select('id, conyuge_id, pendiente_aprobacion')
          .eq('id', user.id)
          .single();

        if (usuarioDB?.pendiente_aprobacion) {
          setIsPendiente(true);
          setLoading(false);
          return;
        }

        const leaderIds = [user.id];
        if (usuarioDB?.conyuge_id) {
          leaderIds.push(usuarioDB.conyuge_id);
        }

        // 2. Load assigned cells
        const { data: celulasData } = await supabase
          .from('celulas')
          .select('*')
          .or(`lider_id.in.(${leaderIds.join(',')}),colider_id.in.(${leaderIds.join(',')})`);

        if (celulasData && celulasData.length > 0) {
          setCelulas(celulasData);
          setActiveCell(celulasData[0]);
          setEditDireccion(celulasData[0].direccion || '');
          setEditDia(celulasData[0].dia_reunion || 'Viernes');
          setEditHora(celulasData[0].hora_reunion || '19:00');
        }

        // 3. Load latest outline
        const { data: bosquejosData } = await supabase
          .from('bosquejos')
          .select('id, titulo, versiculo_base')
          .order('created_at', { ascending: false })
          .limit(1);

        if (bosquejosData && bosquejosData.length > 0) {
          setLatestBosquejo(bosquejosData[0]);
        }

        // 4. Load disciples
        const { data: discipulosData } = await supabase
          .from('asistentes_celula')
          .select('id, nombre, cedula')
          .in('lider_id', leaderIds)
          .order('nombre', { ascending: true });

        if (discipulosData) {
          setDiscipulos(discipulosData);
          const initialMap: Record<string, boolean> = {};
          discipulosData.forEach((d) => {
            initialMap[d.id] = false;
          });
          setAsistenciaMap(initialMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, [user]);

  useEffect(() => {
    if (activeCell) {
      setEditDireccion(activeCell.direccion || '');
      setEditDia(activeCell.dia_reunion || 'Viernes');
      setEditHora(activeCell.hora_reunion || '19:00');
    }
  }, [activeCell]);

  const toggleAsistencia = (id: string) => {
    setAsistenciaMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalAsistentes = Object.values(asistenciaMap).filter(Boolean).length;

  async function handleEnviarCelugrama() {
    if (!user || !activeCell) return;
    setSending(true);
    setFeedbackMsg(null);

    try {
      const attendedIds = Object.keys(asistenciaMap).filter((id) => asistenciaMap[id]);

      const payload = {
        lider_id: user.id,
        lider_celula_id: user.id,
        nombre_celula: activeCell.zona || 'Célula App',
        lugar: activeCell.direccion || 'Asignado',
        estado: 'enviado',
        fecha_reunion: new Date().toISOString(),
        nuevos_convertidos: 0,
        visitas: 0,
        asistencia_total: attendedIds.length,
        ofrenda: ofrenda ? parseFloat(ofrenda) : 0,
        uso_bosquejo: usoBosquejo,
        bosquejo_id: usoBosquejo && latestBosquejo ? latestBosquejo.id : null,
        tema_manual: !usoBosquejo ? temaManual : null,
        versiculo_manual: !usoBosquejo ? versiculoManual : null,
        tema_tratado: usoBosquejo ? latestBosquejo?.titulo || 'Bosquejo Semanal' : temaManual || 'Tema General'
      };

      const { data: insertedReport, error: repError } = await supabase
        .from('informes_celula')
        .insert(payload)
        .select('id')
        .single();

      if (repError) throw repError;

      // Link attendees
      if (attendedIds.length > 0 && insertedReport?.id) {
        const attendanceRows = attendedIds.map((asId) => ({
          informe_id: insertedReport.id,
          asistente_id: asId,
          asistio: true,
          created_at: new Date().toISOString()
        }));
        await supabase.from('asistencia_reunion').insert(attendanceRows);
      }

      setFeedbackMsg({ type: 'success', text: '¡Informe de Celugrama enviado con éxito!' });
      // Reset form
      setOfrenda('');
      setTemaManual('');
      setVersiculoManual('');
      const resetMap: Record<string, boolean> = {};
      discipulos.forEach((d) => {
        resetMap[d.id] = false;
      });
      setAsistenciaMap(resetMap);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Error al enviar informe';
      setFeedbackMsg({ type: 'error', text: message });
    } finally {
      setSending(false);
    }
  }

  async function handleCrearCelula(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !nuevaZona || !nuevaDireccion) return;
    setCreatingCell(true);
    try {
      const { data: newCell, error } = await supabase
        .from('celulas')
        .insert({
          lider_id: user.id,
          zona: nuevaZona,
          direccion: nuevaDireccion,
          categoria: nuevaCategoria,
          dia_reunion: nuevoDia,
          hora_reunion: nuevaHora
        })
        .select('*')
        .single();

      if (error) throw error;
      if (newCell) {
        setCelulas((prev) => [...prev, newCell]);
        setActiveCell(newCell);
        setIsCreatingNew(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingCell(false);
    }
  }

  async function handleGuardarDatosCelula() {
    if (!activeCell) return;
    setSavingDatos(true);
    try {
      const { error } = await supabase
        .from('celulas')
        .update({
          direccion: editDireccion,
          dia_reunion: editDia,
          hora_reunion: editHora
        })
        .eq('id', activeCell.id);

      if (!error) {
        setCelulas((prev) =>
          prev.map((c) =>
            c.id === activeCell.id
              ? { ...c, direccion: editDireccion, dia_reunion: editDia, hora_reunion: editHora }
              : c
          )
        );
        setActiveCell((prev) =>
          prev ? { ...prev, direccion: editDireccion, dia_reunion: editDia, hora_reunion: editHora } : null
        );
        setFeedbackMsg({ type: 'success', text: 'Datos de la célula actualizados.' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDatos(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#007F7F] border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-[#007F7F]">Cargando célula...</p>
      </div>
    );
  }

  if (isPendiente) {
    return (
      <div className="min-h-[calc(100dvh-64px)] p-6 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-amber-700">Cuenta Pendiente de Aprobación</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Tu líder directo debe confirmar tu registro de líder para que puedas reportar reuniones o aperturar células.
        </p>
      </div>
    );
  }

  if (isCreatingNew || celulas.length === 0) {
    return (
      <div className="min-h-[calc(100dvh-64px)] bg-[#F8FAFC] px-4 py-6 pb-nav">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="text-xl font-bold text-[#004D40]">Apertura de Célula</h3>
          <p className="text-xs text-slate-500">Registra una nueva célula bajo tu liderazgo.</p>

          <form onSubmit={handleCrearCelula} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Zona o Nombre de Célula *</label>
              <input
                type="text"
                required
                placeholder="Ej. Zona Norte / Célula Betel"
                value={nuevaZona}
                onChange={(e) => setNuevaZona(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Dirección Exacta *</label>
              <input
                type="text"
                required
                placeholder="Calle, número de casa, referencia"
                value={nuevaDireccion}
                onChange={(e) => setNuevaDireccion(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Tipo de Célula</label>
              <select
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
              >
                <option value="Evangelística">Evangelística</option>
                <option value="Discipulado">Discipulado</option>
                <option value="Niños">Niños</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Día de Reunión</label>
                <select
                  value={nuevoDia}
                  onChange={(e) => setNuevoDia(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
                >
                  {['Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Hora</label>
                <input
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              {celulas.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 text-slate-500 font-semibold text-sm rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={creatingCell}
                className="bg-cai-primary-btn text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs active:scale-95 disabled:opacity-50"
              >
                {creatingCell ? 'Guardando...' : 'Crear Célula'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#F8FAFC] pb-nav">
      {/* Top Cell Selector Bar matching Android */}
      <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setShowCellDropdown(!showCellDropdown)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-xs text-sm font-bold text-[#004D40] flex items-center justify-between cursor-pointer"
          >
            <span className="truncate">{activeCell?.zona || 'Seleccionar Célula'}</span>
            <ChevronDown className="w-4 h-4 text-[#004D40] shrink-0" />
          </button>

          {showCellDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl py-1 z-30">
              {celulas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCell(c);
                    setShowCellDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 truncate"
                >
                  {c.zona} - {c.direccion}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="p-2.5 bg-[#00796B] active:bg-[#004D40] text-white rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          title="Nueva Célula"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* TabRow matching Android TabRow */}
      <div className="max-w-md mx-auto px-4">
        <div className="bg-[#E0F7FA] rounded-2xl p-1 flex">
          <button
            onClick={() => setSelectedTab('reporte')}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
              selectedTab === 'reporte'
                ? 'bg-white text-[#00796B] shadow-xs'
                : 'text-[#00796B]/70 hover:text-[#00796B]'
            }`}
          >
            Reporte Semanal
          </button>
          <button
            onClick={() => setSelectedTab('datos')}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
              selectedTab === 'datos'
                ? 'bg-white text-[#00796B] shadow-xs'
                : 'text-[#00796B]/70 hover:text-[#00796B]'
            }`}
          >
            Datos de Célula
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-md mx-auto p-4">
        {feedbackMsg && (
          <div
            className={`mb-4 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {selectedTab === 'reporte' ? (
          <div className="space-y-4">
            {/* Outline Topic Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Usar Bosquejo Semanal</span>
                <input
                  type="checkbox"
                  checked={usoBosquejo}
                  onChange={(e) => setUsoBosquejo(e.target.checked)}
                  className="w-5 h-5 accent-[#00796B] rounded cursor-pointer"
                />
              </div>

              {usoBosquejo ? (
                latestBosquejo ? (
                  <div className="bg-[#E0F7FA]/50 rounded-xl p-3 border border-[#E0F7FA] text-xs space-y-1">
                    <p className="font-bold text-[#004D40] text-sm">{latestBosquejo.titulo}</p>
                    {latestBosquejo.versiculo_base && (
                      <p className="text-slate-600">Base: {latestBosquejo.versiculo_base}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No hay bosquejo cargado para esta semana.</p>
                )
              ) : (
                <div className="space-y-2 pt-2">
                  <input
                    type="text"
                    placeholder="Tema Tratado"
                    value={temaManual}
                    onChange={(e) => setTemaManual(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Versículo Base"
                    value={versiculoManual}
                    onChange={(e) => setVersiculoManual(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              )}
            </div>

            {/* Attendance Checklist Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-800 text-sm">Asistencia de la Célula</h4>
                <span className="bg-[#E0F2F1] text-[#00796B] text-xs font-extrabold px-3 py-1 rounded-full">
                  Total: {totalAsistentes}
                </span>
              </div>

              {discipulos.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No hay asistentes registrados en tu red para marcar asistencia.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {discipulos.map((d) => (
                    <label
                      key={d.id}
                      className="py-2.5 flex items-center justify-between cursor-pointer group"
                    >
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-[#00796B]">
                        {d.nombre}
                      </span>
                      <input
                        type="checkbox"
                        checked={!!asistenciaMap[d.id]}
                        onChange={() => toggleAsistencia(d.id)}
                        className="w-5 h-5 accent-[#00796B] rounded cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Ofrenda Field */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-2">
              <label className="text-sm font-bold text-slate-800">Ofrenda Recolectada ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={ofrenda}
                  onChange={(e) => setOfrenda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#00796B]"
                />
              </div>
            </div>

            {/* Submit Button (CaiPrimaryButton gradient) */}
            <button
              onClick={handleEnviarCelugrama}
              disabled={sending}
              className="w-full h-14 bg-cai-primary-btn active:opacity-90 text-white rounded-2xl font-extrabold text-base shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-5 h-5" />
              <span>{sending ? 'ENVIANDO INFORME...' : 'ENVIAR INFORME'}</span>
            </button>
          </div>
        ) : (
          /* Datos de Célula Tab */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <h4 className="font-bold text-slate-800 text-base">Configuración de la Célula</h4>

            <div>
              <label className="text-xs font-semibold text-slate-600">Dirección de la Célula</label>
              <input
                type="text"
                value={editDireccion}
                onChange={(e) => setEditDireccion(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Día de Reunión</label>
                <select
                  value={editDia}
                  onChange={(e) => setEditDia(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {['Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Hora</label>
                <input
                  type="time"
                  value={editHora}
                  onChange={(e) => setEditHora(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleGuardarDatosCelula}
              disabled={savingDatos}
              className="w-full mt-2 h-12 bg-cai-primary-btn text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingDatos ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
