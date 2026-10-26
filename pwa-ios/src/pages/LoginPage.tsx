import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const res = await login(email, password);
    setLoading(false);

    if (res.error) {
      if (res.error.includes('Invalid login credentials')) {
        setErrorMsg('Correo o contraseña incorrectos');
      } else {
        setErrorMsg(res.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Luces sutiles de fondo */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pt-10 flex flex-col items-center text-center z-10">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-amber-400/40 via-amber-200/10 to-transparent shadow-xl">
            <img 
              src="/ios/icons/icon-512.png" 
              alt="Casa de Adoración" 
              className="w-full h-full object-cover rounded-[18px]" 
            />
          </div>
          <span className="absolute -bottom-1 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow">
            Líderes
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Bienvenido
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ingresa con tus credenciales de líder
        </p>
      </div>

      {/* Formulario */}
      <div className="my-auto py-6 z-10 max-w-sm mx-auto w-full">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Correo Electrónico
            </label>
            <div className="glass-ios rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10 focus-within:border-amber-400/50 transition-all">
              <Mail className="w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                autoCapitalize="none"
                autoCorrect="off"
                className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Contraseña
            </label>
            <div className="glass-ios rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10 focus-within:border-amber-400/50 transition-all">
              <Lock className="w-4 h-4 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-sm w-full outline-none text-white placeholder-slate-500"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón de Entrada */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl gold-gradient text-black font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer / Switch a Registro */}
      <div className="pb-8 text-center z-10">
        <p className="text-xs text-slate-400">
          ¿No tienes una cuenta de líder?{' '}
          <button 
            type="button" 
            onClick={onSwitchToRegister}
            className="text-amber-400 font-semibold hover:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}
