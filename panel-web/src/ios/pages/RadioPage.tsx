import { Play, Pause, Loader2, User } from 'lucide-react';
import { useRadio } from '../contexts/RadioContext';

interface RadioPageProps {
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

export default function RadioPage({ isLoggedIn = false, onLoginClick }: RadioPageProps) {
  const { isPlaying, isBuffering, togglePlay } = useRadio();

  return (
    <div className="min-h-[100dvh] bg-cai-gradient flex flex-col justify-between px-4 pb-28 select-none overflow-y-auto">
      {/* Top transparent action area matching Android RadioScreen topBar */}
      <div className="pt-safe h-16 px-2 flex items-center justify-end shrink-0">
        {!isLoggedIn && onLoginClick && (
          <button
            onClick={onLoginClick}
            className="bg-[#0D47A1] active:bg-[#0A387E] text-white px-4 py-2 rounded-full text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-4 h-4 text-white" />
            <span>Ingresar Líder</span>
          </button>
        )}
      </div>

      {/* Main Content matching Android RadioScreen */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-4">
        {/* Animated Disc / Artwork (Clean circle matching Android Box .clip(CircleShape)) */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          {/* Disc Container with smooth rotation when playing */}
          <div
            className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden shadow-xl border-4 border-white transition-transform duration-700 bg-white ${
              isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''
            }`}
          >
            <img
              src="/ios/apple-touch-icon.png"
              alt="Casa de Adoración INT Radio"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info matching Android:
            Title: color = Color(0xFF0D47A1), fontSize = 24.sp, fontWeight = FontWeight.Bold
            Subtitle: color = if (isPlaying) Color(0xFF1976D2) else Color.Gray
        */}
        <div className="mt-6 text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0D47A1] tracking-tight">
            Casa de Adoración INT
          </h2>
          <p className="mt-1.5 text-base font-medium transition-colors duration-300">
            {isBuffering ? (
              <span className="text-[#0D47A1] font-medium">Conectando...</span>
            ) : isPlaying ? (
              <span className="text-[#1976D2] flex items-center justify-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Transmisión en Vivo
              </span>
            ) : (
              <span className="text-[#757575] font-medium">Radio en Pausa</span>
            )}
          </p>
        </div>

        {/* Play / Pause Button matching Android:
            Surface(color = if (isPlaying) Color(0xFF0D47A1) else Color(0xFF37474F))
            Pulse: Color(0xFF0D47A1).copy(alpha = 0.25f)
        */}
        <div className="mt-8 relative flex items-center justify-center">
          {isPlaying && (
            <div className="absolute w-24 h-24 rounded-full bg-[#0D47A1]/25 animate-ping pointer-events-none" />
          )}

          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer ${
              isPlaying ? 'bg-[#0D47A1]' : 'bg-[#37474F]'
            }`}
            aria-label={isPlaying ? 'Pausar radio' : 'Reproducir radio'}
          >
            {isBuffering ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-10 h-10 text-white fill-white" />
            ) : (
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
