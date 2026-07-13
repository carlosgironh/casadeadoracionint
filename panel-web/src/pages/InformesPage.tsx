import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Printer, X, Eye, Users, Calendar, Filter, Search, CheckSquare, Square } from 'lucide-react';
import { useState, useMemo } from 'react';
import CelugramaMensualNinosModal from '../components/Dashboard/CelugramaMensualNinosModal';
import CelugramaTrimestralModal from '../components/Dashboard/CelugramaTrimestralModal';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Interfaces
interface Asistente {
  id: string;
  nombre: string;
  cedula: string;
  whatsapp?: string;
  telefono?: string;
  direccion?: string;
  edad?: number;
  libro_juan?: boolean;
  pre_tcd_1?: boolean;
  tiempo_con_dios?: boolean;
  pos_tcd_2?: boolean;
  bautismo?: boolean;
  discipulado_1?: boolean;
  modulo_1_escuela?: boolean;
  seminario_vision?: boolean;
  modulo_2_escuela?: boolean;
  seminario_servicio?: boolean;
  modulo_3?: boolean;
  lanzamiento?: boolean;
  consolidacion?: boolean;
  plan_felipe?: boolean;
  retiro?: boolean;
  encuentro?: boolean;
  liderazgo?: boolean;
}

interface AsistenciaReunion {
  asistente_id: string;
  asistio: boolean;
  asistentes_celula: Asistente;
}

interface Informe {
  id: string;
  lider_id: string;
  nombre_celula: string;
  lugar: string;
  fecha_reunion: string;
  nuevos_convertidos: number;
  visitas: number;
  estado: string;
  asistencia_total?: number;
  ofrenda?: number;
  uso_bosquejo?: boolean;
  tema_manual?: string;
  versiculo_manual?: string;
  usuarios?: { nombre_completo: string };
  bosquejos?: { titulo: string };
}

interface Celula {
  id: string;
  lider_id: string;
  zona?: string;
  direccion?: string;
  categoria?: string;
  dia_reunion?: string;
  hora_reunion?: string;
  red?: string;
  lideres_adicionales?: string;
  fecha_cumpleanos?: string;
  fecha_aniversario?: string;
  vacaciones?: string;
  fecha_apertura?: string;
  colider_id?: string;
  colider?: { nombre_completo: string };
  usuarios?: {
    nombre_completo: string;
    plan_felipe?: boolean;
    capacitacion?: string;
    ministerio?: string;
    lider_directo_id?: string;
    equipo_lider_id?: string;
    red_asignada_id?: string;
    redes?: { nombre: string };
    lider_directo?: { nombre_completo: string };
    equipo_lider?: { nombre: string };
  };
}

export default function InformesPage() {
  const { supabase } = useSupabase();
  const [activeTab, setActiveTab] = useState<'celugramas' | 'aperturas'>('celugramas');

  // Modals state
  const [selectedInforme, setSelectedInforme] = useState<Informe | null>(null);
  const [selectedCelula, setSelectedCelula] = useState<Celula | null>(null);
  const [ninosModalCelula, setNinosModalCelula] = useState<Celula | null>(null);
  const [trimestralModalCelula, setTrimestralModalCelula] = useState<Celula | null>(null);

  // Queries
  const { data: informes, isLoading: isLoadingInformes } = useQuery({
    queryKey: ['informes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('informes_celula')
        .select('*, usuarios(nombre_completo), bosquejos(titulo, versiculo_base)')
        .order('fecha_reunion', { ascending: false });

      if (error) throw error;
      return data as Informe[];
    },
  });

  const { data: celulas, isLoading: isLoadingCelulas } = useQuery({
    queryKey: ['celulas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('celulas')
        .select('*, colider:colider_id(nombre_completo), usuarios!celulas_lider_id_fkey(nombre_completo, plan_felipe, capacitacion, ministerio, lider_directo:lider_directo_id(nombre_completo), equipo_lider:equipo_lider_id(nombre), redes:red_asignada_id(nombre))')
        .order('fecha_apertura', { ascending: false });

      if (error) throw error;
      return data as Celula[];
    },
  });

  const { data: asistencias } = useQuery({
    queryKey: ['asistencia_reunion', selectedInforme?.id],
    enabled: !!selectedInforme,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asistencia_reunion')
        .select('asistente_id, asistio, asistentes_celula(*)')
        .eq('informe_id', selectedInforme!.id)
        .eq('asistio', true);
      if (error) throw error;
      return data as unknown as AsistenciaReunion[];
    }
  });

  const { data: discipulosApertura } = useQuery({
    queryKey: ['asistentes_apertura', selectedCelula?.lider_id],
    enabled: !!selectedCelula,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asistentes_celula')
        .select('*')
        .eq('lider_id', selectedCelula!.lider_id);
      if (error) throw error;
      return data as Asistente[];
    }
  });

  // --- FILTERS STATE (Excel style) ---
  const [filtersCelugramas, setFiltersCelugramas] = useState<Record<string, string[]>>({
    lider: [],
    lugar: []
  });

  const [filtersAperturas, setFiltersAperturas] = useState<Record<string, string[]>>({
    lider: [],
    zona: [],
    red: []
  });

  // Unique values for dropdowns
  const uniqueCelugramaLideres = useMemo(() => Array.from(new Set(informes?.map(i => i.usuarios?.nombre_completo || 'Desconocido'))).sort(), [informes]);
  const uniqueCelugramaLugares = useMemo(() => Array.from(new Set(informes?.map(i => i.lugar || ''))).sort(), [informes]);

  const uniqueAperturaLideres = useMemo(() => Array.from(new Set(celulas?.map(c => c.usuarios?.nombre_completo || 'Desconocido'))).sort(), [celulas]);
  const uniqueAperturaZonas = useMemo(() => Array.from(new Set(celulas?.map(c => c.zona || '-'))).sort(), [celulas]);
  const uniqueAperturaRedes = useMemo(() => Array.from(new Set(celulas?.map(c => c.red || c.usuarios?.redes?.nombre || '-'))).sort(), [celulas]);

  // Apply filters
  const filteredInformes = useMemo(() => {
    return informes?.filter(informe => {
      const matchLider = filtersCelugramas.lider.length === 0 || filtersCelugramas.lider.includes(informe.usuarios?.nombre_completo || 'Desconocido');
      const matchLugar = filtersCelugramas.lugar.length === 0 || filtersCelugramas.lugar.includes(informe.lugar || '');
      return matchLider && matchLugar;
    });
  }, [informes, filtersCelugramas]);

  const filteredCelulas = useMemo(() => {
    return celulas?.filter(celula => {
      const matchLider = filtersAperturas.lider.length === 0 || filtersAperturas.lider.includes(celula.usuarios?.nombre_completo || 'Desconocido');
      const matchZona = filtersAperturas.zona.length === 0 || filtersAperturas.zona.includes(celula.zona || '-');
      const redVal = celula.red || celula.usuarios?.redes?.nombre || '-';
      const matchRed = filtersAperturas.red.length === 0 || filtersAperturas.red.includes(redVal);
      return matchLider && matchZona && matchRed;
    });
  }, [celulas, filtersAperturas]);

  // Toggle filter helper
  const toggleFilter = (tab: 'celugramas' | 'aperturas', column: string, value: string) => {
    if (tab === 'celugramas') {
      setFiltersCelugramas(prev => {
        const current = prev[column] || [];
        return { ...prev, [column]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
      });
    } else {
      setFiltersAperturas(prev => {
        const current = prev[column] || [];
        return { ...prev, [column]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
      });
    }
  };

  const clearFilters = (tab: 'celugramas' | 'aperturas', column: string) => {
    if (tab === 'celugramas') {
      setFiltersCelugramas(prev => ({ ...prev, [column]: [] }));
    } else {
      setFiltersAperturas(prev => ({ ...prev, [column]: [] }));
    }
  };

  // Reusable Excel-like Header component
  const FilterHeader = ({
    title,
    options,
    activeFilters,
    onToggle,
    onClear
  }: {
    title: string,
    options: string[],
    activeFilters: string[],
    onToggle: (val: string) => void,
    onClear: () => void
  }) => {
    const [search, setSearch] = useState('');
    const filteredOptions = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

    return (
      <Popover className="relative inline-block text-left w-full h-full">
        {({ open }) => (
          <>
            <Popover.Button className={`group flex items-center justify-between w-full outline-none hover:bg-gray-200/50 p-2 -m-2 rounded transition-colors ${activeFilters.length > 0 ? 'text-[#0D509E] font-bold' : ''}`}>
              <span>{title}</span>
              <Filter className={`w-3.5 h-3.5 ml-2 transition-opacity ${open || activeFilters.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Popover.Panel className="absolute z-10 w-56 mt-2 origin-top-left bg-white rounded-lg shadow-xl ring-1 ring-black/5 focus:outline-none">
                <div className="p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-md py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D509E] focus:border-transparent"
                      placeholder="Buscar..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredOptions.length === 0 ? (
                      <div className="text-xs text-gray-500 py-2 text-center">No hay opciones</div>
                    ) : (
                      filteredOptions.map((option) => (
                        <label key={option} className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-50 rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={activeFilters.includes(option)}
                            onChange={() => onToggle(option)}
                          />
                          {activeFilters.includes(option) ? (
                            <CheckSquare className="w-4 h-4 text-[#0D509E] mr-2 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0" />
                          )}
                          <span className="truncate" title={option}>{option}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {activeFilters.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => { e.preventDefault(); onClear(); }}
                        className="w-full text-xs text-center text-red-600 hover:text-red-700 font-medium py-1"
                      >
                        Limpiar filtro
                      </button>
                    </div>
                  )}
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  return (
    <div className="print:m-0 print:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Informes y Células</h1>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-6 print:hidden">
        <button
          onClick={() => setActiveTab('celugramas')}
          className={`pb-3 px-1 font-semibold text-sm transition-colors relative ${activeTab === 'celugramas'
              ? 'text-[#0D509E]'
              : 'text-gray-500 hover:text-gray-800'
            }`}
        >
          Celugramas Semanales
          {activeTab === 'celugramas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D509E] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('aperturas')}
          className={`pb-3 px-1 font-semibold text-sm transition-colors relative ${activeTab === 'aperturas'
              ? 'text-[#0D509E]'
              : 'text-gray-500 hover:text-gray-800'
            }`}
        >
          Aperturas de Célula
          {activeTab === 'aperturas' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D509E] rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'celugramas' && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden print:hidden">
          {isLoadingInformes ? (
            <div className="p-10 text-center text-gray-500 text-sm">Cargando informes...</div>
          ) : (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600">
                    <th className="px-4 py-2 border-r border-gray-100 w-1/4">
                      <FilterHeader
                        title="Célula / Lugar"
                        options={uniqueCelugramaLugares}
                        activeFilters={filtersCelugramas.lugar}
                        onToggle={(val) => toggleFilter('celugramas', 'lugar', val)}
                        onClear={() => clearFilters('celugramas', 'lugar')}
                      />
                    </th>
                    <th className="px-4 py-2 border-r border-gray-100 w-1/4">
                      <FilterHeader
                        title="Líder"
                        options={uniqueCelugramaLideres}
                        activeFilters={filtersCelugramas.lider}
                        onToggle={(val) => toggleFilter('celugramas', 'lider', val)}
                        onClear={() => clearFilters('celugramas', 'lider')}
                      />
                    </th>
                    <th className="px-4 py-2 border-r border-gray-100 font-semibold w-1/6">Fecha</th>
                    <th className="px-4 py-2 border-r border-gray-100 font-semibold text-center w-1/6">Asistencia</th>
                    <th className="px-4 py-2 font-semibold text-center w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInformes?.map(informe => (
                    <tr key={informe.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-4 py-2.5 align-middle border-r border-gray-50">
                        <div className="font-medium text-gray-900">{informe.nombre_celula}</div>
                        <div className="text-xs text-gray-500">{informe.lugar}</div>
                      </td>
                      <td className="px-4 py-2.5 align-middle border-r border-gray-50 text-gray-700">
                        {informe.usuarios?.nombre_completo || 'Desconocido'}
                      </td>
                      <td className="px-4 py-2.5 align-middle border-r border-gray-50 text-gray-600">
                        {format(new Date(informe.fecha_reunion), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-4 py-2.5 align-middle border-r border-gray-50 text-center">
                        <span className="inline-flex items-center justify-center bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {informe.asistencia_total || 0}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 align-middle text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setSelectedInforme(informe)}
                            className="p-1.5 text-gray-400 hover:text-[#0D509E] hover:bg-blue-50 rounded transition-colors"
                            title="Ver Detalles (Semanal)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const cel = celulas?.find(c => c.lider_id === informe.lider_id || c.lider_id === (informe as any).lider_celula_id);
                              if (cel) {
                                setTrimestralModalCelula(cel);
                              } else {
                                alert('No se pudo encontrar la información completa de la célula asociada.');
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Ver Celugrama Trimestral Histórico"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredInformes?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        No se encontraron informes con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'aperturas' && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden print:hidden">
          {isLoadingCelulas ? (
            <div className="p-10 text-center text-gray-500 text-sm">Cargando aperturas...</div>
          ) : (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600">
                    <th className="px-4 py-2 border-r border-gray-100 w-1/5">
                      <FilterHeader
                        title="Zona"
                        options={uniqueAperturaZonas}
                        activeFilters={filtersAperturas.zona}
                        onToggle={(val) => toggleFilter('aperturas', 'zona', val)}
                        onClear={() => clearFilters('aperturas', 'zona')}
                      />
                    </th>
                    <th className="px-4 py-2 border-r border-gray-100 w-1/5">
                      <FilterHeader
                        title="Red"
                        options={uniqueAperturaRedes}
                        activeFilters={filtersAperturas.red}
                        onToggle={(val) => toggleFilter('aperturas', 'red', val)}
                        onClear={() => clearFilters('aperturas', 'red')}
                      />
                    </th>
                    <th className="px-4 py-2 border-r border-gray-100 w-1/5">
                      <FilterHeader
                        title="Líder"
                        options={uniqueAperturaLideres}
                        activeFilters={filtersAperturas.lider}
                        onToggle={(val) => toggleFilter('aperturas', 'lider', val)}
                        onClear={() => clearFilters('aperturas', 'lider')}
                      />
                    </th>
                    <th className="px-4 py-2 border-r border-gray-100 font-semibold w-1/6">Fecha Apertura</th>
                    <th className="px-4 py-2 font-semibold text-center w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCelulas?.map(celula => (
                    <tr key={celula.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-4 py-2.5 align-middle border-r border-gray-50">
                        <div className="font-medium text-gray-900">{celula.zona || '-'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{celula.direccion || '-'}</div>
                      </td>
                      <td className="px-4 py-2.5 align-middle border-r border-gray-50 text-gray-700">
                        {celula.red || celula.usuarios?.redes?.nombre || '-'}
                      </td>
                      <td className="px-4 py-2.5 align-middle border-r border-gray-50 text-gray-700">
                        {celula.usuarios?.nombre_completo || 'Desconocido'}
                      </td>
                      <td className="px-4 py-2.5 align-middle border-r border-gray-50 text-gray-600">
                        {celula.fecha_apertura ? format(new Date(celula.fecha_apertura), 'dd MMM yyyy', { locale: es }) : '-'}
                      </td>
                      <td className="px-4 py-2.5 align-middle text-center">
                        <div className="flex justify-center gap-1">
                          {celula.categoria === 'Niños' && (
                            <button
                              onClick={() => setNinosModalCelula(celula)}
                              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                              title="Ver Celugrama Mensual (Niños)"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCelula(celula)}
                            className="p-1.5 text-gray-400 hover:text-[#0D509E] hover:bg-blue-50 rounded transition-colors"
                            title="Ver Apertura"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCelulas?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        No se encontraron aperturas con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Celugrama Semanal */}
      {selectedInforme && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white print:p-0 print:absolute print:inset-0 print:z-50">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl print:shadow-none print:border-none print:max-w-full print:max-h-none print:w-full print:overflow-visible">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 print:hidden">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0D509E]" />
                Detalle del Celugrama
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button onClick={() => setSelectedInforme(null)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 print:p-8 space-y-8 print:w-[21cm] print:h-[29.7cm] print:mx-auto print:bg-white">
              <div className="text-center pb-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Reporte de Célula Semanal</h1>
                <p className="text-gray-500 mt-1">Casa de Adoración Internacional</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Información General</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700">Líder:</span> {selectedInforme.usuarios?.nombre_completo}</p>
                    <p><span className="font-medium text-gray-700">Célula / Zona:</span> {selectedInforme.nombre_celula}</p>
                    <p><span className="font-medium text-gray-700">Lugar:</span> {selectedInforme.lugar}</p>
                    <p><span className="font-medium text-gray-700">Fecha:</span> {format(new Date(selectedInforme.fecha_reunion), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Estadísticas</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700">Asistencia Total:</span> <span className="font-bold text-lg">{selectedInforme.asistencia_total || 0}</span></p>
                    <p><span className="font-medium text-gray-700">Ofrenda:</span> ${selectedInforme.ofrenda?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Detalle de Asistencia</h3>
                <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden print:border-black print:rounded-none">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-100 print:bg-gray-200 print:border-black">
                        <th className="px-4 py-2 font-semibold print:border-r print:border-black">Nombre del Discípulo</th>
                        <th className="px-4 py-2 font-semibold text-center print:border-r print:border-black">Plan Felipe</th>
                        <th className="px-4 py-2 font-semibold text-center print:border-r print:border-black">Bautismo</th>
                        <th className="px-4 py-2 font-semibold text-center">Libro de Juan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 print:divide-black">
                      {asistencias?.map(a => (
                        <tr key={a.asistente_id} className="bg-white">
                          <td className="px-4 py-2 font-medium print:border-r print:border-black">{a.asistentes_celula.nombre}</td>
                          <td className="px-4 py-2 text-center print:border-r print:border-black">{a.asistentes_celula.plan_felipe ? '✓' : '-'}</td>
                          <td className="px-4 py-2 text-center print:border-r print:border-black">{a.asistentes_celula.bautismo ? '✓' : '-'}</td>
                          <td className="px-4 py-2 text-center">{a.asistentes_celula.libro_juan ? '✓' : '-'}</td>
                        </tr>
                      ))}
                      {(!asistencias || asistencias.length === 0) && (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No hay detalle de asistencia registrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Apertura de Célula (PDF Format) */}
      {selectedCelula && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white print:p-0 print:absolute print:inset-0 print:z-50">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl print:shadow-none print:border-none print:max-w-full print:max-h-none print:w-full print:overflow-visible">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 print:hidden">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0D509E]" />
                Apertura de Célula
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  <Printer className="w-4 h-4" /> Imprimir Documento
                </button>
                <button onClick={() => setSelectedCelula(null)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* INICIO FORMATO OFICIAL DE IMPRESIÓN (Márgenes ajustados para A4/Letter) */}
            <div className="p-10 print:p-0 print:pt-8 font-sans bg-white text-black mx-auto" style={{ maxWidth: '21cm' }}>
              <div className="flex justify-between items-center mb-10">
                <img src="/logo.png" alt="Logo Casa de Adoracion Int" className="w-28 h-auto object-contain" />
                <div className="text-center">
                  <h1 className="text-[17px] font-semibold mb-3">CASA DE ADORACIÓN</h1>
                  <h2 className="text-[19px] font-bold tracking-wide">APERTURA DE CELULA</h2>
                </div>
                <img src="/logo.png" alt="Logo Casa de Adoracion Int" className="w-28 h-auto object-contain" />
              </div>

              <div className="space-y-6 text-[13px] uppercase font-semibold leading-relaxed tracking-wide">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 whitespace-nowrap">
                    ZONA <span className="border-b border-black inline-block px-2 min-w-[120px] text-center" style={{ minWidth: '100px' }}>{selectedCelula.zona || ''}</span>
                    RED <span className="border-b border-black inline-block px-2 flex-1 text-center" style={{ minWidth: '150px' }}>{selectedCelula.red || selectedCelula.usuarios?.redes?.nombre || ''}</span>
                  </div>
                  <div className="flex-1 whitespace-nowrap text-right">
                    CÉLULA DE: <span className="border-b border-black inline-block px-2 text-center" style={{ minWidth: '180px' }}>{selectedCelula.usuarios?.nombre_completo || ''}</span>
                    FECHA: <span className="border-b border-black inline-block px-2 text-center" style={{ minWidth: '100px' }}>{selectedCelula.fecha_apertura ? format(new Date(selectedCelula.fecha_apertura), 'dd/MM/yyyy') : ''}</span>
                  </div>
                </div>

                <div className="whitespace-nowrap flex items-end w-full">
                  <span className="mr-2">NOMBRE DE LIDERES:</span> 
                  <span className="border-b border-black inline-block flex-1 text-center">{selectedCelula.usuarios?.nombre_completo || ''}</span>
                  <span className="mx-2">Y</span>
                  <span className="border-b border-black inline-block flex-1 text-center">{selectedCelula.colider?.nombre_completo || selectedCelula.lideres_adicionales || ''}</span>
                </div>

                <div className="whitespace-nowrap flex items-end w-full">
                  <span className="mr-2">LIDERES INMEDIATOS:</span> 
                  <span className="border-b border-black inline-block flex-1 text-center">
                    {selectedCelula.usuarios?.equipo_lider 
                      ? selectedCelula.usuarios.equipo_lider.nombre.split(/ y | Y /)[0] 
                      : (selectedCelula.usuarios?.lider_directo?.nombre_completo || '')}
                  </span>
                  <span className="mx-2">Y</span>
                  <span className="border-b border-black inline-block flex-1 text-center">
                    {selectedCelula.usuarios?.equipo_lider 
                      ? selectedCelula.usuarios.equipo_lider.nombre.split(/ y | Y /)[1] || ''
                      : ''}
                  </span>
                </div>

                <div className="whitespace-nowrap flex items-end w-full">
                  <span className="mr-2">DIRECCIÓN DE CELULA:</span>
                  <span className="border-b border-black inline-block flex-1 px-2">{selectedCelula.direccion || ''}</span>
                </div>

                <div className="whitespace-nowrap flex items-end w-full">
                  <span>ENTRENADO EN PLAN FELIPE ? SI</span>
                  <span className="border-b border-black inline-block w-12 mx-1 text-center">{selectedCelula.usuarios?.plan_felipe ? 'X' : ''}</span>
                  <span>NO</span>
                  <span className="border-b border-black inline-block w-12 mx-1 text-center">{!selectedCelula.usuarios?.plan_felipe ? 'X' : ''}</span>
                  <span className="ml-4 mr-2">RECIBIENDO CAPACITACIÓN</span>
                  <span className="border-b border-black inline-block flex-1 text-center px-2">{selectedCelula.usuarios?.capacitacion || ''}</span>
                </div>

                <div className="whitespace-nowrap flex items-end w-full">
                  <span className="mr-2">MINISTERIO EN EL QUE SIRVE:</span>
                  <span className="border-b border-black inline-block flex-1 px-2">{selectedCelula.usuarios?.ministerio || ''}</span>
                </div>
              </div>

              <div className="mt-12">
                <table className="w-full border-collapse border border-black text-[11px] uppercase">
                  <thead>
                    <tr>
                      <th className="border border-black p-1.5 w-8 text-center bg-gray-100 print:bg-white">#</th>
                      <th className="border border-black p-1.5 bg-gray-100 print:bg-white">NOMBRE DE DISCÍPULOS</th>
                      <th className="border border-black p-1.5 text-center w-16 bg-gray-100 print:bg-white">EDAD</th>
                      <th className="border border-black p-1.5 text-center w-24 bg-gray-100 print:bg-white">ASISTENCIA</th>
                      <th className="border border-black p-1.5 bg-gray-100 print:bg-white">DIRECCION</th>
                      <th className="border border-black p-1.5 w-32 bg-gray-100 print:bg-white">TELÉFONO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Imprimir exactamente 12 filas como se acostumbra en estos formatos físicos */}
                    {Array.from({ length: Math.max(12, discipulosApertura?.length || 0) }).map((_, i) => {
                      const d = discipulosApertura?.[i];
                      return (
                        <tr key={i} className="h-7">
                          <td className="border border-black p-1 text-center font-bold">{i + 1}</td>
                          <td className="border border-black p-1">{d?.nombre || ''}</td>
                          <td className="border border-black p-1 text-center">{d?.edad || ''}</td>
                          <td className="border border-black p-1 text-center">{d ? 'SI' : ''}</td>
                          <td className="border border-black p-1 truncate max-w-[200px]">{d?.direccion || ''}</td>
                          <td className="border border-black p-1">{d?.telefono || d?.whatsapp || ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* FIN FORMATO OFICIAL */}
          </div>
        </div>
      )}

      {/* Modal Celugrama Mensual Niños */}
      {ninosModalCelula && (
        <CelugramaMensualNinosModal
          celula={ninosModalCelula}
          onClose={() => setNinosModalCelula(null)}
        />
      )}

      {/* Modal Celugrama Trimestral General */}
      {trimestralModalCelula && (
        <CelugramaTrimestralModal 
          celula={trimestralModalCelula} 
          onClose={() => setTrimestralModalCelula(null)} 
        />
      )}
    </div>
  );
}
