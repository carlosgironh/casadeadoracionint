import { Play, Pause, Loader2 } from 'lucide-react';
import { useRadio } from '../contexts/RadioContext';

export default function RadioPage() {
  const { isPlaying, isBuffering, togglePlay } = useRadio();

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-cai-gradient flex flex-col items-center justify-center px-4 py-4 pb-28 select-none overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center justify-center my-auto">
        {/* Animated Disc / Artwork (Responsive for compact screens) */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
          {/* Subtle outer glow / shadow */}
          <div className="absolute inset-2 rounded-full bg-blue-500/10 blur-xl" />

          {/* Disc Container with smooth rotation when playing */}
          <div
            className={`relative w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden shadow-2xl border-4 border-white transition-transform duration-700 ${
              isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''
            }`}
          >
            <img
              src="/ios/apple-touch-icon.png"
              alt="Casa de Adoración INT Radio"
              className="w-full h-full object-cover"
            />
            {/* Center disc hole / vinyl look */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/95 shadow-inner border border-slate-200" />
            </div>
          </div>
        </div>

        {/* Info matching Android Song Info */}
        <div className="mt-4 sm:mt-6 text-center px-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0D47A1] tracking-tight">
            Casa de Adoración INT
          </h2>
          <p className="mt-1 text-sm font-semibold transition-colors duration-300">
            {isBuffering ? (
              <span className="text-amber-600 font-medium">Conectando...</span>
            ) : isPlaying ? (
              <span className="text-[#1976D2] flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Transmisión en Vivo
              </span>
            ) : (
              <span className="text-gray-500 font-medium">Radio en Pausa</span>
            )}
          </p>
        </div>

        {/* Play / Pause Button matching Android 80dp Circle button */}
        <div className="mt-6 sm:mt-8 relative flex items-center justify-center">
          {isPlaying && (
            <div className="absolute w-20 h-20 rounded-full bg-[#0D47A1]/20 animate-ping pointer-events-none" />
          )}

          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer ${
              isPlaying ? 'bg-[#0D47A1]' : 'bg-[#37474F]'
            }`}
            aria-label={isPlaying ? 'Pausar radio' : 'Reproducir radio'}
          >
            {isBuffering ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-9 h-9 text-white fill-white" />
            ) : (
              <Play className="w-9 h-9 text-white fill-white ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
