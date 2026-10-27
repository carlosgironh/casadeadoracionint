
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Mail, Shield, CheckCircle, Clock } from 'lucide-react';

export default function PerfilPage() {
  const { user, profile, logout } = useAuth();

  return (
    <div className="py-4 px-5 pb-36 max-w-lg mx-auto select-none">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Mi Perfil</h1>
        <p className="text-xs text-slate-400">Información de cuenta y configuración</p>
      </div>

      <div className="glass-ios rounded-3xl p-6 border border-white/10 flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-xl mb-3">
          <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center text-amber-400">
            <User className="w-9 h-9" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-white">{profile?.nombre || user?.email?.split('@')[0]}</h2>
        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
          <Mail className="w-3.5 h-3.5" /> {user?.email}
        </span>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Shield className="w-3 h-3" /> {profile?.rol || 'Líder'}
          </span>
          <span className={`text-[11px] font-bold uppercase px-3 py-1 rounded-full border flex items-center gap-1 ${
            profile?.aprobado 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            {profile?.aprobado ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {profile?.aprobado ? 'Aprobado' : 'Pendiente'}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="space-y-3">
        <div className="glass-ios rounded-2xl p-4 border border-white/10 text-xs text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-200 mb-1">Casa de Adoración Int — PWA iOS v1.0.0</p>
          <p>Diseñada exclusivamente para líderes en iPhone y iPad. Para soporte o consultas pastorales, contacta a la administración.</p>
        </div>

        <button
          onClick={logout}
          className="w-full py-3.5 px-4 rounded-2xl glass-ios border border-red-500/30 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 active:scale-95 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}


