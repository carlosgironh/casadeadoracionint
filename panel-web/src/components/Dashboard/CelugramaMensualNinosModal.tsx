import { useState } from 'react';
import { X, Printer, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../../hooks/useSupabase';

interface CelugramaMensualNinosModalProps {
  celula: any;
  onClose: () => void;
}

export default function CelugramaMensualNinosModal({ celula, onClose }: CelugramaMensualNinosModalProps) {
  const { supabase } = useSupabase();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  // Fetch Asistentes
  const { data: asistentes } = useQuery({
    queryKey: ['asistentes_ninos', celula.lider_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asistentes_celula')
        .select('*')
        .eq('lider_id', celula.lider_id);
      if (error) throw error;
      return data;
    }
  });

  // Fetch Informes of the selected month
  const { data: informesData } = useQuery({
    queryKey: ['informes_mensuales_ninos', celula.lider_id, selectedMonth],
    queryFn: async () => {
      const startDate = `${selectedMonth}-01T00:00:00Z`;
      // End of month calculation
      const [year, month] = selectedMonth.split('-');
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).toISOString();

      const { data: informes, error: infError } = await supabase
        .from('informes_celula')
        .select('*')
        .eq('lider_celula_id', celula.lider_id)
        .gte('fecha_reunion', startDate)
        .lte('fecha_reunion', endDate)
        .order('fecha_reunion', { ascending: true });
        
      if (infError) throw infError;

      if (!informes || informes.length === 0) return { informes: [], asistencias: [] };

      const informeIds = informes.map(i => i.id);
      const { data: asistencias, error: asisError } = await supabase
        .from('asistencia_reunion')
        .select('*')
        .in('informe_id', informeIds)
        .eq('asistio', true);

      if (asisError) throw asisError;

      return { informes, asistencias };
    },
    enabled: !!selectedMonth
  });

  const informes = informesData?.informes || [];
  const asistencias = informesData?.asistencias || [];

  // Prepare up to 20 rows
  const rows = [];
  for (let i = 0; i < 20; i++) {
    rows.push(asistentes && asistentes.length > i ? asistentes[i] : null);
  }

  // Prepare exactly 5 weeks
  const weeks: any[] = [];
  for (let i = 0; i < 5; i++) {
    weeks.push(informes.length > i ? informes[i] : null);
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white print:p-0 print:absolute print:inset-0 print:z-50">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl print:shadow-none print:border-none print:max-w-full print:max-h-none print:w-full print:overflow-visible">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 print:hidden">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0D509E]" />
            Celugrama Mensual - Niños
          </h2>
          <div className="flex items-center gap-4">
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={handlePrint} className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 print:p-4 bg-white text-black font-sans text-xs">
          {/* Cabecera */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase">CASA DE ADORACIÓN INT.</h1>
            <h2 className="text-lg font-bold uppercase mt-1">CELUGRAMA CELULA DE NIÑOS</h2>
          </div>

          {/* Tabla de Asistencia */}
          <table className="w-full border-collapse border border-black text-center mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1 w-8">#</th>
                <th className="border border-black p-1 text-left w-48">NOMBRE</th>
                <th className="border border-black p-1">MES:</th>
                <th className="border border-black p-1">1</th>
                <th className="border border-black p-1">2</th>
                <th className="border border-black p-1">3</th>
                <th className="border border-black p-1">4</th>
                <th className="border border-black p-1">5</th>
                <th className="border border-black p-1">EDAD</th>
                <th className="border border-black p-1">SEXO</th>
                <th className="border border-black p-1 w-48">DIRECCION</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((nino, index) => (
                <tr key={index} className="h-6">
                  <td className="border border-black p-0.5">{index + 1}.</td>
                  <td className="border border-black p-0.5 text-left truncate">{nino?.nombre || ''}</td>
                  <td className="border border-black p-0.5 bg-gray-50"></td>
                  {weeks.map((week, wIndex) => {
                    const didAttend = week && nino && asistencias.some((a: any) => a.informe_id === week.id && a.asistente_id === nino.id);
                    return (
                      <td key={wIndex} className="border border-black p-0.5 font-bold">
                        {didAttend ? 'X' : ''}
                      </td>
                    );
                  })}
                  <td className="border border-black p-0.5">{nino?.edad || ''}</td>
                  <td className="border border-black p-0.5">{nino?.sexo || ''}</td>
                  <td className="border border-black p-0.5 text-left text-[10px] truncate">{nino?.direccion || ''}</td>
                </tr>
              ))}
              {/* Filas extra Lider */}
              <tr className="h-6">
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5 text-left font-bold" colSpan={2}>LIDER: {celula?.usuarios?.nombre_completo || ''}</td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
              </tr>
              <tr className="h-6">
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5 text-left font-bold" colSpan={2}>LIDER:</td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
                <td className="border border-black p-0.5"></td>
              </tr>
            </tbody>
          </table>

          <div className="flex gap-4 mb-4 font-bold text-sm">
            <div>MES: <span className="font-normal underline decoration-dashed">{format(new Date(`${selectedMonth}-01`), 'MMMM yyyy', { locale: es }).toUpperCase()}</span></div>
            <div>RED: <span className="font-normal underline decoration-dashed">{celula?.usuarios?.redes?.nombre || '____________________'}</span></div>
            <div>ZONA: <span className="font-normal underline decoration-dashed">{celula?.zona || '______'}</span></div>
          </div>

          <div className="flex gap-8">
            <table className="flex-1 text-left text-xs border-none">
              <thead>
                <tr>
                  <th className="pb-2">DIA</th>
                  <th className="pb-2">TEMAS</th>
                  <th className="pb-2">TEXTO</th>
                  <th className="pb-2">OFRENDA</th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, index) => (
                  <tr key={index} className="h-8">
                    <td className="pr-2">{week ? format(new Date(week.fecha_reunion), 'dd/MM') : '___: ___'}</td>
                    <td className="pr-2 truncate max-w-[150px]">{week?.tema_manual || week?.tema_tratado || '___________________'}</td>
                    <td className="pr-2 truncate max-w-[100px]">{week?.versiculo_manual || '_________'}</td>
                    <td className="pr-2">{week?.ofrenda != null ? `$${week.ofrenda}` : '_________'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex-1 space-y-4 text-xs font-bold pt-6">
              <div>LIDER: <span className="font-normal underline decoration-dashed">{celula?.usuarios?.nombre_completo || '______________________'}</span> CELULAR: <span className="font-normal underline decoration-dashed">____________</span></div>
              <div>LIDER: <span className="font-normal underline decoration-dashed">______________________</span> CELULAR: <span className="font-normal underline decoration-dashed">____________</span></div>
              <div>DIRECCION DE LA CELULA: <span className="font-normal underline decoration-dashed">{celula?.direccion || '______________________'}</span></div>
              <div><span className="font-normal underline decoration-dashed">__________________________________________________</span></div>
              <div>HORA: <span className="font-normal underline decoration-dashed">_________</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
