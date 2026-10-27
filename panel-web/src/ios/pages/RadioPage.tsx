import { useRadio } from '../contexts/RadioContext';
import { Play, Pause, Radio as RadioIcon, Volume2, Sparkles } from 'lucide-react';

export default function RadioPage() {
  const { isPlaying, isBuffering, togglePlay, volume, setVolume } = useRadio();

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100dvh-120px)] py-4 px-6 text-center select-none overflow-y-auto">
      {/* Badge Superior */}
      <div className="pt-1 shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-red-500' : 'bg-slate-500'}`}></span>
          </span>
          <span className="font-semibold">{isPlaying ? 'EN VIVO' : 'RADIO EN ESPERA'}</span>
        </div>
      </div>

      {/* Disco central / Carátula giratoria */}
      <div className="my-auto py-4 flex flex-col items-center shrink-0">
        <div className="relative">
          {isPlaying && (
            <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-ping pointer-events-none scale-125" />
          )}

          <div 
            className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full p-2 bg-gradient-to-tr from-amber-500/30 via-slate-800 to-amber-300/10 shadow-2xl shadow-black/80 flex items-center justify-center transition-transform duration-1000 ${
              isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-900 bg-slate-950 flex items-center justify-center relative">
              <img 
                src="/ios/icons/icon-512.png" 
                alt="Radio Casa de Adoración" 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-400/50 shadow-inner flex items-center justify-center">
                <RadioIcon className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Título de la emisora */}
        <div className="mt-5">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Casa de Adoración <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Transmisión Oficial 24/7</p>
        </div>
      </div>

      {/* Controles de Reproducción */}
      <div className="w-full max-w-xs space-y-4 pb-6 shrink-0">
        <div className="flex items-center justify-center">
          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className="w-18 h-18 rounded-full gold-gradient text-black flex items-center justify-center shadow-xl shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {isBuffering ? (
              <div className="w-7 h-7 border-3 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Control de Volumen */}
        <div className="glass-ios rounded-2xl px-4 py-2 flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
