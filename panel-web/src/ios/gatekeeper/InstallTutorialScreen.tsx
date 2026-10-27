import { Share, PlusSquare, Smartphone, Sparkles, ArrowDown } from 'lucide-react';

export default function InstallTutorialScreen() {
  return (
    <div className="min-h-[100dvh] bg-[#0B0F19] text-white flex flex-col justify-between p-5 pb-10 select-none relative overflow-y-auto">
      {/* Luces de fondo sutiles */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera / Identidad */}
      <div className="pt-4 flex flex-col items-center text-center z-10 shrink-0">
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-amber-400/40 via-amber-200/10 to-transparent shadow-xl">
            <img 
              src="/ios/icons/icon-512.png" 
              alt="Casa de Adoración Int" 
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <span className="absolute -bottom-1 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> iOS
          </span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-1">
          Casa de Adoración Int
        </h1>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Para acceder a la aplicación en tu iPhone o iPad, debes agregarla a tu pantalla de inicio.
        </p>
      </div>

      {/* Pasos de Instalación estilo Apple Cards */}
      <div className="my-auto py-4 space-y-2.5 z-10 max-w-sm mx-auto w-full shrink-0">
        {/* Paso 1 */}
        <div className="glass-ios rounded-2xl p-3.5 flex items-center gap-3.5 border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
            <Share className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Paso 1</div>
            <div className="text-xs font-medium text-slate-100">
              Toca el botón <span className="font-semibold text-blue-400">Compartir</span> en la barra de Safari.
            </div>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="glass-ios rounded-2xl p-3.5 flex items-center gap-3.5 border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <PlusSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Paso 2</div>
            <div className="text-xs font-medium text-slate-100">
              Baja y selecciona <span className="font-semibold text-white">"Agregar a inicio"</span>.
            </div>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="glass-ios rounded-2xl p-3.5 flex items-center gap-3.5 border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Paso 3</div>
            <div className="text-xs font-medium text-slate-100">
              Toca <span className="font-semibold text-white">Agregar</span> y abre la app desde tu pantalla de inicio.
            </div>
          </div>
        </div>
      </div>

      {/* Indicador animado inferior */}
      <div className="pt-2 pb-2 flex flex-col items-center text-center z-10 shrink-0 animate-bounce">
        <span className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
          Toca abajo en el botón compartir
        </span>
        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-amber-400">
          <ArrowDown className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
