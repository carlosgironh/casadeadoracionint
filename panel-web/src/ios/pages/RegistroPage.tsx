import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface RegistroPageProps {
  onSwitchToLogin: () => void;
}

export default function RegistroPage({ onSwitchToLogin }: RegistroPageProps) {
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) {
      setErrorMsg('Por favor completa todos los campos requeridos');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await register(nombre, email, password, telefono);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">¡Registro enviado con éxito!</h2>
        <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
          Tu cuenta ha sido creada. Una vez que el administrador apruebe tu acceso, podrás gestionar tus celugramas y discípulos.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="py-3 px-6 rounded-2xl gold-gradient text-black font-bold text-sm shadow-lg active:scale-95 transition-all"
        >
          Ir al Inicio de Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0B0F19] text-white flex flex-col justify-start p-5 pb-16 select-none relative overflow-y-auto">
      {/* Luces sutiles de fondo */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pt-4 pb-2 flex flex-col items-center text-center z-10 shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Registro de Líder
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Crea tu cuenta para reportar reuniones de célula
        </p>
      </div>

      {/* Formulario */}
      <div className="my-2 py-2 z-10 max-w-sm mx-auto w-full shrink-0">
        {errorMsg && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Nombre Completo *
            </label>
            <div className="glass-ios rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-white/10">
              <User className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                required
                className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Correo Electrónico *
            </label>
            <div className="glass-ios rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-white/10">
              <Mail className="w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@correo.com"
                required
                autoCapitalize="none"
                className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Teléfono / WhatsApp
            </label>
            <div className="glass-ios rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-white/10">
              <Phone className="w-4 h-4 text-slate-400" />
              <input 
                type="tel" 
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 300 000 0000"
                className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Contraseña *
            </label>
            <div className="glass-ios rounded-2xl px-4 py-2.5 flex items-center gap-3 border border-white/10">
              <Lock className="w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-2xl gold-gradient text-black font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Completar Registro'
            )}
          </button>
        </form>
      </div>

      <div className="pt-2 pb-8 text-center z-10 shrink-0">
        <p className="text-xs text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            className="text-amber-400 font-semibold hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
