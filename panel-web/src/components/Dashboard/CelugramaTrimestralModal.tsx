import { useState, useMemo } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../../hooks/useSupabase';

interface CelugramaTrimestralModalProps {
  celula: any;
  onClose: () => void;
}

export default function CelugramaTrimestralModal({ celula, onClose }: CelugramaTrimestralModalProps) {
  const { supabase } = useSupabase();

  // Determine current Quarter based on today
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentQuarter = Math.floor(today.getMonth() / 3) + 1; // 1, 2, 3, or 4

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter); // 1 = Jan-Mar, 2 = Apr-Jun, etc.

  // Calculamos las fechas de inicio y fin del trimestre
  const { startDate, endDate, months } = useMemo(() => {
    const startMonth = (selectedQuarter - 1) * 3;
    const startD = new Date(selectedYear, startMonth, 1);
    const endD = new Date(selectedYear, startMonth + 2, 31, 23, 59, 59);

    return {
      startDate: startD.toISOString(),
      endDate: endD.toISOString(),
      months: [
        new Date(selectedYear, startMonth, 1),
        new Date(selectedYear, startMonth + 1, 1),
        new Date(selectedYear, startMonth + 2, 1)
      ]
    };
  }, [selectedYear, selectedQuarter]);

  // Fetch Asistentes
  const { data: asistentes } = useQuery({
    queryKey: ['asistentes_celula', celula.lider_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asistentes_celula')
        .select('*')
        .eq('lider_id', celula.lider_id);
      if (error) throw error;
      return data;
    }
  });

  // Fetch Informes of the selected quarter
  const { data: informesData } = useQuery({
    queryKey: ['informes_trimestrales', celula.id, startDate, endDate],
    queryFn: async () => {
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
    }
  });

  const informes = informesData?.informes || [];
  const asistencias = informesData?.asistencias || [];

  // Agrupar informes por mes y ordenarlos por fecha (mas antiguo a mas reciente)
  const informesByMonth = useMemo(() => {
    return months.map(m => {
      const monthStr = format(m, 'yyyy-MM');
      const infs = (informes || [])
        .filter(i => format(parseISO(i.fecha_reunion), 'yyyy-MM') === monthStr)
        .sort((a, b) => new Date(a.fecha_reunion).getTime() - new Date(b.fecha_reunion).getTime());
      
      const padded = [...infs];
      while (padded.length < 5) padded.push(null as any);
      return padded.slice(0, 5);
    });
  }, [informes, months]);

  // Nombres de líderes (extraer hasta 4 nombres y separarlos)
  const displayNames = useMemo(() => {
    if (!celula) return ['', '', '', ''];
    
    const directNames = [
      celula?.usuarios?.nombre_completo,
      celula?.colider?.nombre_completo,
    ].filter(Boolean) as string[];
    
    const adicionales = celula.lideres_adicionales ? celula.lideres_adicionales.split(',').map((n: string) => n.trim()) : [];
    
    let finalNames: string[] = [];
    [...directNames, ...adicionales].forEach(name => {
      // Separar por " y ", " & " o comas para extraer nombres individuales
      const parts = name.split(/,| y | & /i).map((n: string) => n.trim()).filter(Boolean);
      finalNames = finalNames.concat(parts);
    });
    
    const uniqueNames = Array.from(new Set(finalNames));
    return [...uniqueNames, '', '', '', ''].slice(0, 4);
  }, [celula]);

  // Prepare up to 15 rows for assistants
  const rows = [];
  for (let i = 0; i < 15; i++) {
    rows.push(asistentes && asistentes.length > i ? asistentes[i] : null);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white print:p-0 print:absolute print:inset-0 print:z-50">
      <style>{`
        @media print {
          @page { size: letter landscape; margin: 8mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-scale {
            zoom: 0.85;
          }
        }
      `}</style>
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-[1200px] max-h-[90vh] overflow-y-auto shadow-2xl print:shadow-none print:border-none print:max-w-full print:max-h-none print:w-full print:overflow-visible">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 print:hidden">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0D509E]" />
            Celugrama Trimestral General
          </h2>
          <div className="flex items-center gap-4">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select 
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value={1}>Trimestre 1 (Ene - Mar)</option>
              <option value={2}>Trimestre 2 (Abr - Jun)</option>
              <option value={3}>Trimestre 3 (Jul - Sep)</option>
              <option value={4}>Trimestre 4 (Oct - Dic)</option>
            </select>

            <button onClick={() => window.print()} className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div className="p-8 print:p-0 print:pt-1 bg-white text-black font-sans text-[10px] uppercase mx-auto print-scale" style={{ maxWidth: '28cm' }}>
          
          <div className="flex justify-between items-end mb-2 hidden">
            {/* Hiding old header since it's now integrated inside the table */}
          </div>

          {/* MAIN GRID */}
          <table className="w-full border-collapse text-center mb-1 relative z-0">
            <thead>
              <tr className="h-40">
                <th className="w-64 p-0 align-bottom border-none relative bg-white z-10">
                  <div className="absolute top-0 left-0 right-0 flex flex-col items-start pr-4 pb-1">
                    <h1 className="text-[20px] font-black tracking-tighter leading-none mb-1">CELULAS CASA DE ADORACION INT</h1>
                    <div className="w-24 mt-1 mx-auto mb-2">
                      <img src="/logo.png" alt="Casa de Adoracion Int Logo" className="w-full h-auto grayscale" />
                    </div>
                    <div className="w-full mt-auto text-[10px] text-left">
                      <div className="flex mb-1 items-end">
                        <span className="font-bold mr-1 leading-none">DIA</span>
                        <div className="border-b border-black w-24 h-4 text-center leading-none">{celula?.dia_reunion || ''}</div>
                        <span className="font-bold mx-1 leading-none">HORA</span>
                        <div className="border-b border-black w-24 h-4 text-center leading-none">{celula?.hora_reunion || ''}</div>
                      </div>
                      <div className="flex items-end">
                        <span className="font-bold mr-1 leading-none">RED:</span>
                        <div className="border-b border-black flex-1 h-4 leading-none">{celula?.red || celula?.usuarios?.redes?.nombre || ''}</div>
                      </div>
                    </div>
                  </div>
                </th>
                
                {/* 3 Meses Headers */}
                {months.map((m, i) => (
                  <th key={i} className="relative border-b-2 border-black p-0 w-[70px]">
                    <div className="absolute bottom-0 left-0 w-[200px] border-b-2 border-black origin-bottom-left -rotate-[55deg] z-0" />
                    <div className="absolute bottom-8 left-6 origin-bottom-left -rotate-[55deg] whitespace-nowrap text-[12px] font-bold z-10">
                      {format(m, 'MMMM', { locale: es }).toUpperCase()}
                    </div>
                  </th>
                ))}
                
                {/* Checkbox columns (16) */}
                {[
                  'Libro de juan', 'Pre TCD Meta 1', 'Tiempo con Dios', 'Pos TCD Meta 2',
                  'Bautismo', 'Discipulado #1', 'Modulo #1 Esc. Lideres', 'Seminario Vision y Mision',
                  'Modulo #2 Esc. Lid', 'Seminario Servicio y Lid', 'Modulo #3', 'Lanzamiento',
                  'Pos Lanz Apertura Celula', 'Graduado', 'Dirije Celula Evangelistica', 'Dirije Celula de Discipulado'
                ].map((colName, i) => (
                  <th key={i} className="relative border-b-2 border-black p-0 w-4">
                    <div className="absolute bottom-0 left-0 w-[200px] border-b-2 border-black origin-bottom-left -rotate-[55deg] z-0" />
                    <div className="absolute bottom-2 left-[6px] origin-bottom-left -rotate-[55deg] whitespace-nowrap text-[9px] font-bold z-10">
                      {colName}
                    </div>
                  </th>
                ))}
                {/* 3 Empty columns for Edad, Fecha Nac, Telefono in the first row */}
                <th className="border-b-2 border-black w-6"></th>
                <th className="border-b-2 border-black w-14"></th>
                <th className="border-b-2 border-black w-14"></th>

                {/* Fecha Apertura Header */}
                <th className="relative border-b-2 border-black align-bottom p-2 text-center w-48 border-l-0">
                  <div className="absolute bottom-0 left-0 w-[200px] border-b-2 border-black origin-bottom-left -rotate-[55deg] z-0" />
                  <div className="relative z-10 flex flex-col items-center justify-end h-full pl-12">
                    <div className="font-bold text-[11px] leading-tight mb-1">Fecha de Apertura<br/>de Celula</div>
                    <div className="border border-black h-5 w-24 flex items-center justify-center font-bold bg-white">
                      {celula?.fecha_apertura ? format(new Date(celula.fecha_apertura), 'dd/MM/yyyy') : ''}
                    </div>
                  </div>
                </th>
              </tr>
              
              <tr className="bg-gray-50 text-[9px] text-center font-bold">
                <th className="border border-black p-1 text-left">Nombre de la persona</th>
                
                {/* Weeks 1-5 for each month */}
                {[...Array(3)].map((_, mIdx) => (
                  <th key={mIdx} colSpan={1} className="p-0 border border-black">
                    <div className="flex w-full">
                      {[1, 2, 3, 4, 5].map(w => (
                        <div key={w} className="flex-1 border-r border-black last:border-r-0 py-1 font-normal">{w}</div>
                      ))}
                    </div>
                  </th>
                ))}
                
                {/* Headers under diagonal text */}
                <th colSpan={6} className="border border-black p-0 font-normal">Crecimiento</th>
                <th colSpan={8} className="border border-black p-0 font-normal">Formacion de Lider</th>
                <th colSpan={2} className="border border-black p-0 font-normal">Liderazgo</th>
                <th colSpan={1} className="border border-black p-0 font-normal">Edad</th>
                <th colSpan={1} className="border border-black p-0 font-normal leading-tight">Fecha de Nac</th>
                <th colSpan={1} className="border border-black p-0 font-normal">Teléfono</th>
                <th className="border border-black p-0"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((asis, idx) => (
                <tr key={idx} className="h-[18px]">
                  <td className="border border-black text-left px-1 truncate font-bold text-[10px] w-64">{idx + 1}. {asis?.nombre || ''}</td>
                  
                  {/* Attendance logic */}
                  {informesByMonth.map((monthInformes, mIdx) => (
                    <td key={mIdx} className="border border-black p-0 w-[70px]">
                      <div className="flex w-full h-full">
                        {monthInformes.map((informe, wIdx) => {
                          const didAttend = informe && asis && asistencias.some((a: any) => a.informe_id === informe.id && a.asistente_id === asis.id);
                          return (
                            <div key={wIdx} className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center font-bold text-[11px]">
                              {didAttend ? 'X' : ''}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  ))}

                  <td className="border border-black">{asis?.libro_juan ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.pre_tcd_1 ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.tiempo_con_dios ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.pos_tcd_2 ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.bautismo ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.discipulado_1 ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.modulo_1_escuela ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.seminario_vision ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.modulo_2_escuela ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.seminario_servicio ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.modulo_3 ? 'X' : ''}</td>
                  
                  <td className="border border-black">{asis?.lanzamiento ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.pos_lanzamiento ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.graduado ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.dirige_evangelistica ? 'X' : ''}</td>
                  <td className="border border-black">{asis?.dirige_discipulado ? 'X' : ''}</td>
                  
                  <td className="border border-black">{asis?.edad || ''}</td>
                  <td className="border border-black">{asis?.fecha_nacimiento || ''}</td>
                  <td className="border border-black">{asis?.telefono || asis?.whatsapp || ''}</td>
                  <td className="border border-black"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* BOTTOM SECTION */}
          <div className="flex gap-4">
            {/* Left side: Lider names, Ofrendas, Dias especiales */}
            <div className="w-[45%] flex flex-col gap-2">
              
              <div className="text-[12px] leading-tight w-full mt-1 pr-4">
                {displayNames.map((name, idx) => (
                  <div key={idx} className="flex border-b border-black">
                    <span className="font-bold w-32 border-r border-black mr-2">NOMBRE DEL LIDER</span>
                    <span className="flex-1 font-bold truncate px-1">{name.toUpperCase()}</span>
                  </div>
                ))}
              </div>

              <div>
                <table className="w-full border-collapse text-center mt-1">
                  <thead>
                    <tr>
                      <th className="font-bold text-left w-28 pb-1 border-b border-black">Ofrenda por Semana</th>
                      <th className="font-bold pb-1 w-[12%] border-b border-black">1</th>
                      <th className="font-bold pb-1 w-[12%] border-b border-black">2</th>
                      <th className="font-bold pb-1 w-[12%] border-b border-black">3</th>
                      <th className="font-bold pb-1 w-[12%] border-b border-black">4</th>
                      <th className="font-bold pb-1 w-[12%] border-b border-black">5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((m, mIdx) => (
                      <tr key={mIdx} className="h-5">
                        <td className="font-bold text-left align-middle pr-2">{format(m, 'MMM', { locale: es }).toUpperCase()}</td>
                        {[0, 1, 2, 3, 4].map((wIdx) => {
                          const inf = informesByMonth[mIdx][wIdx];
                          return (
                            <td key={wIdx} className="border border-black bg-white">
                              {inf?.ofrenda ? `$${inf.ofrenda.toFixed(0)}` : ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pr-4">
                <div className="text-center font-bold mb-1 mt-0">Días Especiales del Lider</div>
                <table className="w-full border-collapse border-2 border-black text-left h-16">
                  <tbody>
                    {[
                      { label: 'Cumpleaño', val: celula?.fecha_cumpleanos },
                      { label: 'Aniversario', val: celula?.fecha_aniversario },
                      { label: 'Vacaciones', val: celula?.vacaciones },
                      { label: 'Otros', val: '' }
                    ].map((row, i) => {
                       const parts = row.val ? row.val.split(',').map((s: string) => s.trim()) : [];
                       const cols = [...parts, '', '', '', ''].slice(0, 4);
                       return (
                         <tr key={i}>
                           <td className="border border-black font-bold px-2 w-24">{row.label}</td>
                           <td className="border border-black font-bold px-1 text-center text-[10px] w-[19%]">{cols[0]}</td>
                           <td className="border border-black font-bold px-1 text-center text-[10px] w-[19%]">{cols[1]}</td>
                           <td className="border border-black font-bold px-1 text-center text-[10px] w-[19%]">{cols[2]}</td>
                           <td className="border border-black font-bold px-1 text-center text-[10px] w-[19%]">{cols[3]}</td>
                         </tr>
                       );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Right side: Temas y Textos Biblicos */}
            <div className="flex-1 flex flex-col justify-between pl-4">
              {months.map((m, mIdx) => (
                <div key={mIdx} className="mb-1">
                  <div className="flex items-end font-bold text-[9px] mb-1">
                    <span className="w-8">DIA</span>
                    <span className="mr-2">MES:</span>
                    <span className="border-b border-black flex-1 max-w-[200px] text-center">{format(m, 'MMMM yyyy', { locale: es }).toUpperCase()}</span>
                    <span className="flex-1 text-right">TEXTO BIBLICO</span>
                  </div>
                  <div className="space-y-0.5">
                    {[0, 1, 2, 3, 4].map((wIdx) => {
                      const inf = informesByMonth[mIdx][wIdx];
                      const dayStr = inf ? format(parseISO(inf.fecha_reunion), 'dd') : '';
                      const tema = inf?.uso_bosquejo ? inf?.bosquejos?.titulo : (inf?.tema_manual || inf?.tema_tratado || '');
                      const versiculo = inf?.uso_bosquejo ? inf?.bosquejos?.versiculo_base : (inf?.versiculo_manual || '');
                      return (
                        <div key={wIdx} className="flex items-center gap-1">
                          <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-[9px]">{dayStr}</div>
                          <span className="text-[9px]">{wIdx + 1}</span>
                          <div className="border-b border-black flex-1 h-4 text-[9px] overflow-hidden whitespace-nowrap px-1 leading-tight">{tema?.toUpperCase()}</div>
                          <div className="border-b border-black w-32 h-4 text-center text-[9px] overflow-hidden whitespace-nowrap leading-tight">{versiculo?.toUpperCase()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
