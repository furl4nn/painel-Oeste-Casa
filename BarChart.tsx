interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  valuePrefix?: string;
}

export function BarChart({ data, color = '#3CAF47', valuePrefix = '' }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">{item.label}</span>
              <span className="text-gray-600 font-semibold">
                {valuePrefix}{item.value.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 transition-all duration-500 rounded-lg"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
