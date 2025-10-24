import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down';
}

export function StatCard({ title, value, change, icon: Icon, iconColor = '#C8102E', trend }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>

          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-sm font-semibold ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change > 0 && '+'}
                {change}%
              </span>
              <span className="text-xs text-gray-500">vs. mês anterior</span>
            </div>
          )}
        </div>

        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
