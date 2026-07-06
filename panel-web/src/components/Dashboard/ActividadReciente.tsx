import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../../hooks/useSupabase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ActividadReciente() {
  const { supabase } = useSupabase();

  const { data: actividades, isLoading } = useQuery({
    queryKey: ['actividad-reciente'],
    queryFn: async () => {
      // Obtenemos los últimos informes creados (usando created_at o fecha_reunion)
      const { data, error } = await supabase
        .from('informes_celula')
        .select('id, nombre_celula, fecha_reunion, nuevos_convertidos, usuarios(nombre_completo)')
        .order('fecha_reunion', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Actividad Reciente</h2>
      
      {isLoading ? (
        <div className="text-gray-400 text-sm">Cargando actividad...</div>
      ) : (
        <div className="space-y-3">
          {actividades?.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay actividad reciente.</p>
          ) : (
            actividades?.map((act: any) => (
              <div key={act.id} className="flex items-center space-x-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold text-[10px] uppercase">
                    {act.usuarios?.nombre_completo?.charAt(0) || 'C'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 truncate">
                    <span className="font-semibold">{act.usuarios?.nombre_completo || 'Líder Desconocido'}</span> 
                    <span className="text-gray-500 font-normal"> envió informe de </span> 
                    {act.nombre_celula}
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center mt-0.5">
                    {formatDistanceToNow(new Date(act.fecha_reunion), { addSuffix: true, locale: es })}
                    {act.nuevos_convertidos > 0 && (
                      <span className="ml-1.5 text-gray-600 font-medium bg-gray-100 px-1 py-0.5 rounded-sm">
                        +{act.nuevos_convertidos} conv.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

