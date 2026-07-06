import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function GraficoAsistencia({ data }: { data: any[] }) {
  // Format data for chart
  const chartData = [...(data || [])].reverse().map(item => ({
    fecha: format(new Date(item.fecha_reunion), 'dd MMM', { locale: es }),
    asistentes: item.asistentes,
  }));

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm h-96 flex flex-col hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Evolución de Asistencia</h3>
      
      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No hay datos suficientes
        </div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="fecha" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#111827', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="asistentes" 
                name="Asistentes"
                stroke="#374151" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#374151', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#111827', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

