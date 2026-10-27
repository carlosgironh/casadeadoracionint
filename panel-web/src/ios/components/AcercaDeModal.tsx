import { ArrowLeft, ExternalLink } from 'lucide-react';

interface AcercaDeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AcercaDeModal({ isOpen, onClose }: AcercaDeModalProps) {
  if (!isOpen) return null;

  const contacts = [
    { title: 'YouTube', subtitle: 'youtube.com/c/casadeadoraciónint', color: '#FF0000', url: 'https://www.youtube.com/c/casadeadoraci%C3%B3nint' },
    { title: 'Facebook', subtitle: 'CasadeAdoracionInt', color: '#1877F2', url: 'https://www.facebook.com/CasadeAdoracionInt' },
    { title: 'Instagram', subtitle: '@casadeadoracion_int', color: '#E1306C', url: 'https://www.instagram.com/casadeadoracion_int/' },
    { title: 'WhatsApp', subtitle: '+507 6289-1790', color: '#25D366', url: 'https://api.whatsapp.com/send/?phone=50762891790&text&type=phone_number&app_absent=0' },
    { title: 'Ubicación', subtitle: 'Ver en el mapa', color: '#004D40', url: 'https://casadeadoracionint.com/rese%C3%B1a-historica' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#F9FAFB] flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* TopAppBar matching Android */}
      <div className="sticky top-0 z-10 bg-[#004D40] text-white pt-safe shadow-md">
        <div className="h-16 px-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">Acerca de Nosotros</h2>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-4 pb-12">
        {/* Logo */}
        <div className="py-6 flex justify-center">
          <img
            src="/ios/apple-touch-icon.png"
            alt="Logo Casa de Adoración"
            className="w-36 h-36 rounded-full shadow-lg object-cover"
          />
        </div>

        {/* Misión y Visión Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-[#004D40]">Nuestra Misión</h3>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Establecer el reino de Dios y su justicia, ganar almas y hacer discípulos en todas las naciones.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-lg font-bold text-[#004D40]">Nuestra Visión</h3>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Ser una iglesia de influencia mundial, que adora a Dios en espíritu y en verdad, levantando generaciones apasionadas por la presencia del Espíritu Santo.
            </p>
          </div>
        </div>

        {/* Contactos Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-[#004D40] mb-4">Contáctanos</h3>
          <div className="divide-y divide-slate-100">
            {contacts.map((c) => (
              <a
                key={c.title}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors rounded-xl px-2 -mx-2"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-xs shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.title.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800">{c.title}</div>
                  <div className="text-xs text-slate-500 truncate">{c.subtitle}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
