import { Share, PlusSquare, Smartphone, ArrowDown } from 'lucide-react';

export default function InstallTutorialScreen() {
  return (
    <div className="min-h-[100dvh] bg-cai-gradient text-slate-800 flex flex-col justify-between p-5 pb-10 select-none relative overflow-y-auto">
      {/* Cabecera / Identidad matching Android */}
      <div className="pt-6 flex flex-col items-center text-center z-10 shrink-0">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full p-1 bg-white shadow-xl flex items-center justify-center">
            <img 
              src="/ios/apple-touch-icon.png" 
              alt="Casa de Adoración Int" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-[#0D47A1] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
            iOS
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-[#0D47A1] mb-1">
          Casa de Adoración INT
        </h1>
        <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
          Para disfrutar de la mejor experiencia en tu iPhone o iPad, instala la app en tu pantalla de inicio.
        </p>
      </div>

      {/* Pasos de Instalación estilo Cards Blancas */}
      <div className="my-auto py-6 space-y-3 z-10 max-w-sm mx-auto w-full shrink-0">
        {/* Paso 1 */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0D47A1] flex items-center justify-center shrink-0">
            <Share className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[11px] font-bold text-[#00796B] uppercase tracking-wider">Paso 1</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">
              Toca el botón <span className="font-extrabold text-[#0D47A1]">Compartir</span> en la barra de Safari.
            </div>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#00796B] flex items-center justify-center shrink-0">
            <PlusSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[11px] font-bold text-[#00796B] uppercase tracking-wider">Paso 2</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">
              Baja y presiona <span className="font-extrabold text-[#0D47A1]">"Agregar a inicio"</span>.
            </div>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[11px] font-bold text-[#00796B] uppercase tracking-wider">Paso 3</div>
            <div className="text-xs font-semibold text-slate-700 mt-0.5">
              Presiona <span className="font-extrabold text-[#0D47A1]">Agregar</span> y abre la app desde tu inicio.
            </div>
          </div>
        </div>
      </div>

      {/* Indicador animado inferior */}
      <div className="pt-2 pb-4 flex flex-col items-center text-center z-10 shrink-0 animate-bounce">
        <span className="text-xs font-bold text-[#00796B] mb-1.5 flex items-center gap-1.5">
          Toca abajo en el botón compartir de Safari
        </span>
        <div className="w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-[#0D47A1]">
          <ArrowDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
