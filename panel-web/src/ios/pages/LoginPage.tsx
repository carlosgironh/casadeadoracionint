import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onBackClick?: () => void;
  onRegisterClick: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginPage({ onBackClick, onRegisterClick, onLoginSuccess }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const idClean = identifier.trim();
    if (!idClean || !password) {
      setErrorMsg('Ingresa correo y contraseña');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let emailToUse = idClean;

      // If user provided a username without @, resolve email via Supabase
      if (!idClean.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('email')
          .eq('username', idClean)
          .maybeSingle();

        if (userError || !userData?.email) {
          setErrorMsg('Usuario no encontrado');
          setLoading(false);
          return;
        }
        emailToUse = userData.email;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password
      });

      if (signInError) {
        throw signInError;
      }

      onLoginSuccess?.();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Credenciales inválidas';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: window.location.origin + '/ios/'
      });
      if (error) throw error;
      setResetMsg('Se ha enviado el enlace de recuperación a tu correo.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar enlace';
      setResetMsg(message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-cai-login-gradient flex flex-col text-white select-none overflow-y-auto">
      {/* Top Bar with back button matching Android */}
      <div className="pt-safe px-4 h-14 flex items-center shrink-0">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
            aria-label="Regresar"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Main Form Box */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-sm mx-auto w-full">
        {/* 120dp White Circle with App Logo */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-2xl p-2.5 flex items-center justify-center shrink-0">
          <img
            src="/ios/apple-touch-icon.png"
            alt="Casa de Adoración INT"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Titles matching Android */}
        <div className="mt-4 text-center">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase">
            ¡DIOS TE BENDIGA!
          </h1>
          <p className="mt-1 text-white/80 font-light text-xs sm:text-sm">
            Ingresa a tu portal de líderes
          </p>
        </div>

        {/* Form Inputs matching Android OutlinedTextField RoundedCornerShape(24.dp) */}
        <form onSubmit={handleLogin} className="mt-6 w-full space-y-3">
          {errorMsg && (
            <div className="p-3 bg-red-500/20 border border-red-400/40 rounded-2xl text-red-200 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Identifier Field */}
          <div className="relative">
            <User className="absolute left-4 top-3 w-4 h-4 text-white/80" />
            <input
              type="text"
              required
              placeholder="Correo o Usuario"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value.replace(/\s+/g, ''))}
              className="w-full pl-11 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/40 focus:border-white rounded-full text-white placeholder-white/60 text-sm focus:outline-none transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-4 top-3 w-4 h-4 text-white/80" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s+/g, ''))}
              className="w-full pl-11 pr-11 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/40 focus:border-white rounded-full text-white placeholder-white/60 text-sm focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-white/80 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => {
                setShowResetModal(true);
                setResetMsg('');
              }}
              className="text-xs text-white/90 hover:text-white font-medium cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* LoginButton matching Android 56dp white pill with #0D47A1 bold text */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-3 bg-white active:bg-slate-100 text-[#0D47A1] rounded-full font-black text-base shadow-xl tracking-wider active:scale-97 transition-all flex items-center justify-center cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#0D47A1]" /> : 'INGRESAR'}
          </button>
        </form>

        {/* Register Link directly below the button */}
        <div className="mt-4 text-center pb-8">
          <button
            onClick={onRegisterClick}
            className="text-sm font-bold text-white/95 hover:text-white py-1.5 px-3 rounded-full hover:bg-white/10 cursor-pointer transition-colors"
          >
            No tengo una cuenta. Registrarme.
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#004D40]">Recuperar Contraseña</h3>
            <p className="text-xs text-slate-600">
              Ingresa tu correo para recibir un enlace de restablecimiento.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Correo electrónico"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00796B]"
              />

              {resetMsg && (
                <p
                  className={`text-xs font-semibold ${
                    resetMsg.includes('enviado') ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {resetMsg}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-slate-500 font-semibold text-sm rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="bg-cai-primary-btn text-white px-5 py-2 rounded-xl text-sm font-bold shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {resetLoading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
