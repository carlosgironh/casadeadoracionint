import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../../hooks/useSupabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GraficoConversiones() {
  const { supabase } = useSupabase();

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['conversiones-visitas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('informes_celula')
        .select('nuevos_convertidos, visitas, fecha_reunion')
        .order('fecha_reunion', { ascending: false })
        .limit(10);
      
      if (error) throw error;

      // Agrupar por mes o semana? Por simplicidad, usemos los últimos informes agregados.
      // O simplemente la suma total para hacer un comparativo global.
      const totales = data.reduce(
        (acc, item) => {
          acc.visitas += item.visitas || 0;
          acc.nuevos_convertidos += item.nuevos_convertidos || 0;
          return acc;
        },
        { visitas: 0, nuevos_convertidos: 0 }
      );

      return [
        { name: 'Visitas', cantidad: totales.visitas, fill: '#9ca3af' },
        { name: 'Nuevos Convertidos', cantidad: totales.nuevos_convertidos, fill: '#374151' }
      ];
    }
  });

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm h-96 flex flex-col hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Visitas vs Convertidos</h3>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Cargando datos...</div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                cursor={{ fill: '#f9fafb' }}
                itemStyle={{ color: '#111827', fontWeight: 'bold' }}
              />
              <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

