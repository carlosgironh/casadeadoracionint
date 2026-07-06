import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { Mail } from 'lucide-react';

export default function LoginPage() {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [sexo, setSexo] = useState('Masculino');
  const [estadoCivil, setEstadoCivil] = useState('Soltero');
  const [direccion, setDireccion] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isLogin) {
        // Register logic
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const { error: dbError } = await supabase.from('usuarios').insert({
            id: authData.user.id,
            nombre_completo: nombre,
            cedula,
            email,
            telefono,
            fecha_nacimiento: fechaNac,
            sexo,
            estado_civil: estadoCivil,
            direccion,
            nivel: 5,
          });

          if (dbError) throw dbError;
          setSuccess('¡Registro exitoso! Ya puedes iniciar sesión.');
          setIsLogin(true);
        }
      } else {
        // Login logic
        let loginEmail = email;
        
        if (!email.includes('@')) {
          const { data: resolvedEmail, error: rpcError } = await supabase
            .rpc('get_email_by_username', { p_username: email });
            
          if (rpcError || !resolvedEmail) {
            throw new Error('Usuario no encontrado o contraseña incorrecta');
          }
          loginEmail = resolvedEmail;
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (loginError) throw loginError;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#0D509E]">
            CAI Secretaría
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            {isLogin ? 'Ingresa tus credenciales' : 'Registra una nueva cuenta'}
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* CAMPOS COMUNES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {!isLogin ? 'Correo electrónico' : 'Usuario o Correo electrónico'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={!isLogin ? 'email' : 'text'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm transition-colors"
                placeholder={!isLogin ? 'ejemplo@cai.com' : 'usuario o ejemplo@cai.com'}
              />
            </div>
          </div>
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm"
              placeholder="Contraseña"
            />
          </div>

          {/* CAMPOS DE REGISTRO */}
          {!isLogin && (
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm"
                placeholder="Nombre Completo"
              />
              <input
                type="text"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm"
                placeholder="Cédula"
              />
              <input
                type="text"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm"
                placeholder="Teléfono"
              />
              <input
                type="date"
                required
                value={fechaNac}
                onChange={(e) => setFechaNac(e.target.value)}
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm"
              />
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm"
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              <select
                value={estadoCivil}
                onChange={(e) => setEstadoCivil(e.target.value)}
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm"
              >
                <option value="Soltero">Soltero</option>
                <option value="Casado">Casado</option>
                <option value="Divorciado">Divorciado</option>
                <option value="Viudo">Viudo</option>
              </select>
              <textarea
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-[#5EBBEC] focus:border-[#5EBBEC] sm:text-sm"
                placeholder="Dirección Completa"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#0D509E] hover:bg-[#0b3c75] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5EBBEC]"
            >
              {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-sm text-[#0D509E] hover:text-[#5EBBEC]"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
