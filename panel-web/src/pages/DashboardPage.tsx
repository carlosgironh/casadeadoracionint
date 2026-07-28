import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';
import StatsCards from '../components/Dashboard/StatsCards';
import GraficoAsistencia from '../components/Dashboard/GraficoAsistencia';
import GraficoConversiones from '../components/Dashboard/GraficoConversiones';
import ActividadReciente from '../components/Dashboard/ActividadReciente';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { supabase } = useSupabase();

  const { user, profile } = useAuth();
  const isAdmin = profile?.system_role === 'superadmin' || profile?.system_role === 'admin' || profile?.system_role === 'secretaria';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id, isAdmin],
    queryFn: async () => {
      let totalCelulas = 0;
      let totalMiembros = 0;
      let informesSemana = 0;
      let totalConvertidos = 0;
      let asistenciaHistorial: any[] = [];

      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - 7);
      
      const inicioMes = new Date();
      inicioMes.setDate(1);

      if (isAdmin) {
        // ADMIN MODE: Fast global counts
        const { count: cCelulas } = await supabase
          .from('celulas')
          .select('*', { count: 'exact', head: true });
        totalCelulas = cCelulas || 0;

        const { count: cMiembros } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)
          .lte('nivel', 6);
        totalMiembros = cMiembros || 0;

        const { count: cInformes } = await supabase
          .from('informes_celula')
          .select('*', { count: 'exact', head: true })
          .gte('fecha_reunion', inicioSemana.toISOString());
        informesSemana = cInformes || 0;

        const { data: conversionesMes } = await supabase
          .from('informes_celula')
          .select('nuevos_convertidos')
          .gte('fecha_reunion', inicioMes.toISOString());
        totalConvertidos = conversionesMes?.reduce((sum, i) => sum + (i.nuevos_convertidos || 0), 0) || 0;

        const { data: hist } = await supabase
          .from('informes_celula')
          .select('fecha_reunion, asistencia_total')
          .order('fecha_reunion', { ascending: false })
          .limit(20);
        asistenciaHistorial = hist || [];

      } else {
        // LEADER MODE: Fetch and filter
        if (!user) return { totalCelulas: 0, totalMiembros: 0, informesSemana: 0, totalConvertidos: 0, asistenciaHistorial: [] };

        // Celulas
        const { data: celulasData } = await supabase
          .from('celulas')
          .select('lider_id, usuarios!celulas_lider_id_fkey(lider_directo_id)');
        
        if (celulasData) {
          totalCelulas = celulasData.filter((c: any) => c.lider_id === user.id || c.usuarios?.lider_directo_id === user.id).length;
        }

        // Miembros (discípulos)
        const { data: usuariosData } = await supabase
          .from('usuarios')
          .select('id, lider_directo_id')
          .eq('activo', true)
          .lte('nivel', 6);
          
        if (usuariosData) {
          // You count as a member your direct disciples
          totalMiembros = usuariosData.filter(u => u.lider_directo_id === user.id).length;
        }

        // Informes
        const { data: informesData } = await supabase
          .from('informes_celula')
          .select('lider_id, fecha_reunion, nuevos_convertidos, asistencia_total, usuarios!informes_celula_lider_id_fkey(lider_directo_id)');
          
        if (informesData) {
          const myInformes = informesData.filter((i: any) => i.lider_id === user.id || i.usuarios?.lider_directo_id === user.id);
          
          informesSemana = myInformes.filter(i => new Date(i.fecha_reunion) >= inicioSemana).length;
          totalConvertidos = myInformes
            .filter(i => new Date(i.fecha_reunion) >= inicioMes)
            .reduce((sum, i) => sum + (i.nuevos_convertidos || 0), 0);
            
          asistenciaHistorial = myInformes
            .sort((a, b) => new Date(b.fecha_reunion).getTime() - new Date(a.fecha_reunion).getTime())
            .slice(0, 20)
            .map(i => ({ fecha_reunion: i.fecha_reunion, asistencia_total: i.asistencia_total }));
        }
      }

      return {
        totalCelulas,
        totalMiembros,
        informesSemana,
        totalConvertidos,
        asistenciaHistorial,
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

