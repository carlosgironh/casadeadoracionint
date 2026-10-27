import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, ChevronDown, ChevronUp, Check, Plus, Phone, Award } from 'lucide-react';

interface Asistente {
  id: string;
  nombre: string;
  cedula?: string;
  whatsapp?: string;
  libro_juan?: boolean;
  bautismo?: boolean;
  seminario_vision?: boolean;
  liderazgo?: boolean;
  usuario_id?: string;
  lider_id?: string;
}

interface LiderFormacion {
  id: string;
  nombre_completo: string;
  cedula?: string;
  nivel?: number;
  pendiente_aprobacion?: boolean;
  whatsapp?: string;
}

export default function DiscipulosPage() {
  const { user } = useAuth();
  const [discipulos, setDiscipulos] = useState<Asistente[]>([]);
  const [lideresFormacion, setLideresFormacion] = useState<LiderFormacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandLideres, setExpandLideres] = useState(true);
  const [expandDiscipulos, setExpandDiscipulos] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [cedulaInput, setCedulaInput] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');

  async function fetchData() {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get current user's profile and spouse ID
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id, conyuge_id, equipo_id')
        .eq('id', user.id)
        .single();

      const leaderIds = [user.id];
      if (userData?.conyuge_id) {
        leaderIds.push(userData.conyuge_id);
      }

      // 2. Fetch disciples
      const { data: discipulosData } = await supabase
        .from('asistentes_celula')
        .select('*')
        .in('lider_id', leaderIds)
        .order('nombre', { ascending: true });

      if (discipulosData) {
        setDiscipulos(discipulosData);
      }

      // 3. Fetch leaders in training
      if (userData?.equipo_id) {
        const { data: leadersData } = await supabase
          .from('usuarios')
          .select('id, nombre_completo, cedula, nivel, pendiente_aprobacion, whatsapp')
          .eq('equipo_lider_id', userData.equipo_id)
          .neq('id', user.id)
          .order('nombre_completo', { ascending: true });

        if (leadersData) {
          setLideresFormacion(leadersData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [user]);

  async function handleAprobarLider(liderId: string) {
    try {
      await supabase
        .from('usuarios')
        .update({ pendiente_aprobacion: false })
        .eq('id', liderId);

      setLideresFormacion((prev) =>
        prev.map((l) => (l.id === liderId ? { ...l, pendiente_aprobacion: false } : l))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClaimDiscipulo() {
    if (!cedulaInput.trim() || !user) return;
    setClaimLoading(true);
    setClaimMsg('');
    try {
      const { data: found } = await supabase
        .from('asistentes_celula')
        .select('*')
        .eq('cedula', cedulaInput.trim())
        .limit(1);

      if (found && found.length > 0) {
        const disc = found[0];
        await supabase
          .from('asistentes_celula')
          .update({ lider_id: user.id })
          .eq('id', disc.id);

        setClaimMsg('¡Discípulo vinculado exitosamente a tu red!');
        setTimeout(() => {
          setShowAddModal(false);
          setCedulaInput('');
          setClaimMsg('');
          fetchData();
        }, 1200);
      } else {
        setClaimMsg('No se encontró ningún discípulo registrado con esa cédula.');
      }
    } catch (err) {
      console.error(err);
      setClaimMsg('Ocurrió un error al vincular el discípulo.');
    } finally {
      setClaimLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#F4F6F9] px-4 py-6 pb-28">
      <div className="max-w-md mx-auto space-y-6">
        {/* Title matching MisDiscipulosScreen.kt:
            Text("Mis Discípulos", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF004D40))
            CaiIconButton(icon = Icons.Filled.Add, containerColor = Color(0xFF0D509E))
        */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-[#004D40] tracking-tight">Mis Discípulos</h2>
            <p className="text-sm text-[#757575]">Gestión de tu red y células</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0D509E] active:bg-[#0A3D78] text-white p-2.5 rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title="Vincular Discípulo"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-[#007F7F] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-[#007F7F]">Cargando red...</p>
          </div>
        ) : (
          <>
            {/* Section: Mis Líderes en Formación matching color Color(0xFF007F7F) */}
            <div className="space-y-3">
              <button
                onClick={() => setExpandLideres(!expandLideres)}
                className="w-full flex items-center justify-between py-2 text-left cursor-pointer group"
              >
                <span className="text-xl font-bold text-[#007F7F]">Mis Líderes en Formación</span>
                {expandLideres ? (
                  <ChevronUp className="w-5 h-5 text-[#007F7F]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#007F7F]" />
                )}
              </button>

              {expandLideres && (
                <div className="space-y-3">
                  {lideresFormacion.length === 0 ? (
                    <p className="text-[#757575] italic text-sm py-2">
                      No tienes líderes en formación registrados.
                    </p>
                  ) : (
                    lideresFormacion.map((lider) => (
                      <div
                        key={lider.id}
                        className="bg-[#F3F4F6] rounded-2xl shadow-xs border border-slate-200/60 p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-white text-[#0D509E] flex items-center justify-center shrink-0 shadow-xs">
                            <User className="w-6 h-6 text-[#0D509E]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-[#1F2937] text-base truncate">
                              {lider.nombre_completo}
                            </h4>
                            <p className="text-xs text-[#757575]">Nivel: {lider.nivel || 1}</p>
                            {lider.pendiente_aprobacion && (
                              <span className="inline-block mt-1 text-[11px] font-bold text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-full">
                                Pendiente de Aprobación
                              </span>
                            )}
                          </div>
                        </div>

                        {lider.pendiente_aprobacion && (
                          <button
                            onClick={() => handleAprobarLider(lider.id)}
                            className="bg-[#00796B] active:bg-[#004D40] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aprobar</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Section: Mis Discípulos */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setExpandDiscipulos(!expandDiscipulos)}
                className="w-full flex items-center justify-between py-2 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#007F7F]">Mis Discípulos</span>
                  <span className="bg-[#E0F2F1] text-[#00796B] text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    {discipulos.length}
                  </span>
                </div>
                {expandDiscipulos ? (
                  <ChevronUp className="w-5 h-5 text-[#007F7F]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#007F7F]" />
                )}
              </button>

              {expandDiscipulos && (
                <div className="space-y-3">
                  {discipulos.length === 0 ? (
                    <p className="text-[#757575] italic text-sm py-2">
                      No tienes discípulos asignados aún.
                    </p>
                  ) : (
                    discipulos.map((disc) => {
                      const badges = [
                        { label: 'Juan', active: disc.libro_juan },
                        { label: 'Bautismo', active: disc.bautismo },
                        { label: 'Visión', active: disc.seminario_vision },
                        { label: 'Liderazgo', active: disc.liderazgo }
                      ].filter((b) => b.active);

                      return (
                        <div
                          key={disc.id}
                          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#E0F7FA] text-[#00796B] flex items-center justify-center font-bold text-sm shrink-0">
                                {disc.nombre.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-snug">
                                  {disc.nombre}
                                </h4>
                                {disc.cedula && (
                                  <p className="text-xs text-slate-400">Doc: {disc.cedula}</p>
                                )}
                              </div>
                            </div>

                            {disc.whatsapp && (
                              <a
                                href={`https://wa.me/${disc.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                          </div>

                          {/* Progress badges matching color Color(0xFF00796B) and Color(0xFFE0F2F1) */}
                          {badges.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-50">
                              {badges.map((b) => (
                                <span
                                  key={b.label}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#E0F2F1] text-[#00796B] px-2 py-0.5 rounded-full"
                                >
                                  <Award className="w-2.5 h-2.5" />
                                  {b.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-[#004D40]">Vincular o Trasladar Discípulo</h3>
            <p className="text-xs text-slate-500">
              Ingresa el documento o cédula del discípulo registrado para asignarlo a tu célula.
            </p>

            <input
              type="text"
              placeholder="Número de Cédula o Documento"
              value={cedulaInput}
              onChange={(e) => setCedulaInput(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
            />

            {claimMsg && (
              <p
                className={`text-xs font-semibold ${
                  claimMsg.includes('exitosamente') ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {claimMsg}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setCedulaInput('');
                  setClaimMsg('');
                }}
                className="px-4 py-2 text-slate-500 font-semibold text-sm rounded-xl hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleClaimDiscipulo}
                disabled={claimLoading || !cedulaInput.trim()}
                className="bg-cai-primary-btn text-white px-5 py-2 rounded-xl text-sm font-bold shadow-xs active:scale-95 disabled:opacity-50"
              >
                {claimLoading ? 'Buscando...' : 'Vincular'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
