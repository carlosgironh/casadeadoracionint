import { Users, BookOpen, TrendingUp, UserPlus } from 'lucide-react';

interface StatsProps {
  stats?: {
    totalCelulas: number;
    totalMiembros: number;
    informesSemana: number;
    totalConvertidos: number;
  };
  isLoading: boolean;
}

const cards = [
  { key: 'totalCelulas', label: 'Células Activas', icon: Users, color: 'text-gray-700 bg-gray-100' },
  { key: 'totalMiembros', label: 'Miembros Totales', icon: UserPlus, color: 'text-gray-700 bg-gray-100' },
  { key: 'informesSemana', label: 'Informes (Semana)', icon: BookOpen, color: 'text-gray-700 bg-gray-100' },
  { key: 'totalConvertidos', label: 'Conversiones (Mes)', icon: TrendingUp, color: 'text-gray-700 bg-gray-100' },
];

export default function StatsCards({ stats, isLoading }: StatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key as keyof typeof stats] ?? 0;
        
        return (
          <div key={card.key} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{card.label}</p>
            </div>
            <div className="mt-2">
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
              ) : (
                <span className="text-2xl font-bold text-gray-900">{value}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
