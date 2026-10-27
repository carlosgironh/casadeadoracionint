import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

interface Red {
  id: string;
  nombre: string;
}

interface Equipo {
  id: string;
  nombre: string;
  red_id: string;
}

interface RegistroPageProps {
  onBackClick: () => void;
  onSwitchToLogin: () => void;
}

export default function RegistroPage({ onBackClick, onSwitchToLogin }: RegistroPageProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [username, setUsername] = useState('');
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');

  const [redes, setRedes] = useState<Red[]>([]);
  const [selectedRedId, setSelectedRedId] = useState('');
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selectedEquipoId, setSelectedEquipoId] = useState('');

  const [planFelipe, setPlanFelipe] = useState(false);
  const [capacitacion, setCapacitacion] = useState('No');
  const [ministerio, setMinisterio] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchRedes() {
      try {
        const { data, error } = await supabase
          .from('redes')
          .select('id, nombre')
          .eq('activa', true)
          .order('nombre', { ascending: true });

        if (!error && data) {
          setRedes(data);
          if (data.length > 0) {
            setSelectedRedId(data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchRedes();
  }, []);

  useEffect(() => {
    if (!selectedRedId) {
      setEquipos([]);
      setSelectedEquipoId('');
      return;
    }

    async function fetchEquipos() {
      try {
        const { data, error } = await supabase
          .from('equipos')
          .select('id, nombre, red_id')
          .eq('red_id', selectedRedId)
          .order('nombre', { ascending: true });

        if (!error && data) {
          setEquipos(data);
          if (data.length > 0) {
            setSelectedEquipoId(data[0].id);
          } else {
            setSelectedEquipoId('');
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchEquipos();
  }, [selectedRedId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !username.trim() ||
      !cedula.trim() ||
      !password ||
      !email.trim() ||
      !selectedRedId ||
      !selectedEquipoId
    ) {
      setErrorMsg('Todos los campos obligatorios deben ser completados.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`;
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().replace(/\s+/g, '');
    const cleanCedula = cedula.trim();

    try {
      // 1. Verify duplicates in database
      const { data: existingUsers, error: checkError } = await supabase
        .from('usuarios')
        .select('id, email, username, cedula')
        .or(`username.eq.${cleanUsername},cedula.eq.${cleanCedula},email.eq.${cleanEmail}`);

      if (checkError) throw checkError;

      if (existingUsers && existingUsers.length > 0) {
        const dup = existingUsers[0];
        if (dup.email?.toLowerCase() === cleanEmail) {
          setErrorMsg(`El correo '${cleanEmail}' ya está registrado.`);
        } else if (dup.username === cleanUsername) {
          setErrorMsg(`El nombre de usuario '${cleanUsername}' ya está en uso.`);
        } else {
          setErrorMsg(`El documento '${cleanCedula}' ya se encuentra registrado.`);
        }
        setLoading(false);
        return;
      }

      // 2. Sign up in Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            username: cleanUsername,
            nombre_completo: nombreCompleto
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered')) {
          setErrorMsg('El correo ya tiene una cuenta registrada.');
        } else {
          setErrorMsg(`Error de autenticación: ${signUpError.message}`);
        }
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setErrorMsg('No se pudo obtener el identificador tras el registro.');
        setLoading(false);
        return;
      }

      // 3. Insert record in public.usuarios
      const { error: insertError } = await supabase.from('usuarios').insert({
        id: userId,
        email: cleanEmail,
        nombre_completo: nombreCompleto,
        username: cleanUsername,
        cedula: cleanCedula,
        equipo_lider_id: selectedEquipoId,
        red_asignada_id: selectedRedId,
        nivel: 1,
        plan_felipe: planFelipe,
        capacitacion: capacitacion,
        ministerio: ministerio.trim() || 'Ninguno',
        pendiente_aprobacion: true,
        whatsapp: whatsapp.trim() || null,
        direccion: direccion.trim() || 'Por definir'
      });

      if (insertError) throw insertError;

      setSuccessMsg('¡Registro completado! Tu cuenta está en proceso de aprobación por tu líder directo.');
      setTimeout(() => {
        onSwitchToLogin();
      }, 2500);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Error al procesar el registro';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-800">
      {/* Top Bar with Back Arrow */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200/80 pt-safe px-4 shadow-xs">
        <div className="h-16 flex items-center gap-3">
          <button
            onClick={onBackClick}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800 text-lg">Registro de Líder</span>
        </div>
      </div>

      {/* Main Content matching Android RegistroScreen */}
      <div className="flex-1 max-w-md mx-auto w-full p-4 sm:p-6 space-y-4 pb-12">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0D509E] tracking-tight">
            Darse de Alta como Líder
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Regístrate seleccionando tu Red y Líder Directo.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Apellido *</label>
            <input
              type="text"
              required
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre de Usuario *</label>
            <input
              type="text"
              required
              placeholder="ej. juanperez123"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Documento / Cédula *</label>
            <input
              type="text"
              required
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Correo Electrónico *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Contraseña *</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\s+/g, ''))}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">WhatsApp / Teléfono</label>
            <input
              type="tel"
              placeholder="+507 6000-0000"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Dirección</label>
            <input
              type="text"
              placeholder="Ciudad, barriada, calle"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            />
          </div>

          {/* Red Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600">Selecciona tu Red *</label>
            <select
              value={selectedRedId}
              onChange={(e) => setSelectedRedId(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            >
              {redes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Equipo / Líder Directo Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600">Líder Directo / Equipo *</label>
            <select
              value={selectedEquipoId}
              onChange={(e) => setSelectedEquipoId(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            >
              {equipos.length === 0 ? (
                <option value="">No hay equipos disponibles en esta red</option>
              ) : (
                equipos.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nombre}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Plan Felipe Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="planFelipe"
              checked={planFelipe}
              onChange={(e) => setPlanFelipe(e.target.checked)}
              className="w-4 h-4 accent-[#00796B] rounded"
            />
            <label htmlFor="planFelipe" className="text-xs font-semibold text-slate-700 cursor-pointer">
              ¿Ha culminado el Plan Felipe?
            </label>
          </div>

          {/* Capacitación */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-700">¿Ha recibido capacitación?</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="capacitacion"
                  value="Sí"
                  checked={capacitacion === 'Sí'}
                  onChange={() => setCapacitacion('Sí')}
                  className="accent-[#00796B]"
                />
                Sí
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="capacitacion"
                  value="No"
                  checked={capacitacion === 'No'}
                  onChange={() => setCapacitacion('No')}
                  className="accent-[#00796B]"
                />
                No
              </label>
            </div>
          </div>

          {/* Ministerio */}
          <div>
            <label className="text-xs font-semibold text-slate-600">Ministerio o Servicio</label>
            <input
              type="text"
              placeholder="Ej. Alabanza, Ujieres, Medios (o Ninguno)"
              value={ministerio}
              onChange={(e) => setMinisterio(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0D509E]"
            />
          </div>

          {/* Submit Button (CaiPrimaryButton gradient) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-4 bg-cai-primary-btn text-white rounded-2xl font-bold text-base shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              'Completar Registro'
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onSwitchToLogin}
            className="text-sm font-semibold text-[#0D509E] hover:underline"
          >
            ¿Ya tienes una cuenta? Iniciar Sesión.
          </button>
        </div>
      </div>
    </div>
  );
}
