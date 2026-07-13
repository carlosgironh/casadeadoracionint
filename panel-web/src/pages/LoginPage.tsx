import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Mail, Lock, AlertCircle } from 'lucide-react';

// Límite de intentos de login antes de bloquear temporalmente
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutos

// Helper: mensajes de error seguros (no exponen detalles internos)
function getSecureErrorMessage(error: any): string {
  const code = error?.code || error?.status || '';
  const msg = (error?.message || '').toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Usuario o contraseña incorrectos.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Tu cuenta no ha sido confirmada. Contacta al administrador.';
  }
  if (msg.includes('too many requests') || code === 429) {
    return 'Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.';
  }
  if (msg.includes('user not found') || msg.includes('no encontrado')) {
    return 'Usuario o contraseña incorrectos.';
  }
  // Error genérico — no exponer detalles internos
  console.error('[LoginPage] Error de autenticación (no expuesto al usuario):', error);
  return 'Ha ocurrido un error. Por favor intenta de nuevo más tarde.';
}

export default function LoginPage() {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Rate limiting en cliente
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const isLockedOut = lockoutUntil && new Date() < lockoutUntil;

  const getRemainingLockoutSeconds = (): number => {
    if (!lockoutUntil) return 0;
    return Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar bloqueo por intentos fallidos
    if (isLockedOut) {
      setError(
        `Demasiados intentos fallidos. Espera ${getRemainingLockoutSeconds()} segundos.`
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      let loginEmail = email.trim();

      // Resolver username → email si el input no parece un email
      if (!loginEmail.includes('@')) {
        const { data: resolvedEmail, error: rpcError } = await supabase
          .rpc('get_email_by_username', { p_username: loginEmail });

        if (rpcError || !resolvedEmail) {
          throw new Error('invalid_credentials');
        }
        loginEmail = resolvedEmail;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (loginError) throw loginError;

      // Login exitoso — resetear contador de intentos fallidos
      setFailedAttempts(0);
      setLockoutUntil(null);
      navigate('/');
    } catch (err: any) {
      // Incrementar contador de intentos fallidos
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockout = new Date(Date.now() + LOCKOUT_DURATION_MS);
        setLockoutUntil(lockout);
        setError(
          `Has superado el límite de ${MAX_FAILED_ATTEMPTS} intentos. ` +
          `Tu acceso está bloqueado por 5 minutos.`
        );
      } else {
        setError(getSecureErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#0D509E]">
            Casa de Adoracion Int
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Ingresa tus credenciales para acceder al panel administrativo
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Campo: Usuario o Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario o Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="login-email"
                type="text"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!isLockedOut || loading}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="usuario o ejemplo@casadeadoracionint.com"
              />
            </div>
          </div>

          {/* Campo: Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!!isLockedOut || loading}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Contraseña"
              />
            </div>
          </div>

          {/* Mensajes de error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Indicador de intentos restantes */}
          {failedAttempts > 0 && !isLockedOut && (
            <p className="text-xs text-amber-600 text-center">
              Intento {failedAttempts} de {MAX_FAILED_ATTEMPTS}. 
              {MAX_FAILED_ATTEMPTS - failedAttempts} intentos restantes antes del bloqueo.
            </p>
          )}

          {/* Botón de submit */}
          <div>
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !!isLockedOut}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#0D509E] hover:bg-[#0b3c75] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5EBBEC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verificando...' : isLockedOut ? `Bloqueado (${getRemainingLockoutSeconds()}s)` : 'Iniciar Sesión'}
            </button>
          </div>

          {/* Nota de acceso */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Solo el personal autorizado puede acceder a este panel.
            Si necesitas acceso, contacta al administrador del sistema.
          </p>
        </form>
      </div>
    </div>
  );
}
