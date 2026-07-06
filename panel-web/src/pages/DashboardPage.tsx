import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';
import StatsCards from '../components/Dashboard/StatsCards';
import GraficoAsistencia from '../components/Dashboard/GraficoAsistencia';
import GraficoConversiones from '../components/Dashboard/GraficoConversiones';
import ActividadReciente from '../components/Dashboard/ActividadReciente';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { supabase } = useSupabase();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Total de células activas
      const { count: totalCelulas } = await supabase
        .from('celulas')
        .select('*', { count: 'exact', head: true });

      // Total de miembros (excluyendo nivel 7 - no contar)
      const { count: totalMiembros } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
        .lte('nivel', 6);

      // Informes esta semana
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - 7);
      
      const { count: informesSemana } = await supabase
        .from('informes_celula')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_reunion', inicioSemana.toISOString());

      // Nuevos convertidos este mes
      const inicioMes = new Date();
      inicioMes.setDate(1);
      
      const { data: conversionesMes } = await supabase
        .from('informes_celula')
        .select('nuevos_convertidos')
        .gte('fecha_reunion', inicioMes.toISOString());

      const totalConvertidos = conversionesMes?.reduce((sum, i) => sum + (i.nuevos_convertidos || 0), 0) || 0;

      // Asistencia promedio últimas 4 semanas
      const { data: asistenciaHistorial } = await supabase
        .from('informes_celula')
        .select('fecha_reunion, asistentes')
        .order('fecha_reunion', { ascending: false })
        .limit(20);

      return {
        totalCelulas: totalCelulas || 0,
        totalMiembros: totalMiembros || 0,
        informesSemana: informesSemana || 0,
        totalConvertidos,
        asistenciaHistorial: asistenciaHistorial || [],
      };
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <button className="inline-flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Nuevo Bosquejo</span>
        </button>
      </div>

      <StatsCards stats={stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoAsistencia data={stats?.asistenciaHistorial || []} />
        <GraficoConversiones />
      </div>

      <ActividadReciente />
    </div>
  );
}

