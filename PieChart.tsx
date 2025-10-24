interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
}

export function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let currentAngle = 0;
  const slices = data.map(item => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    return { ...item, percentage, angle, startAngle };
  });

  const createSlicePath = (startAngle: number, angle: number) => {
    const centerX = 100;
    const centerY = 100;
    const radius = 80;

    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (startAngle + angle - 90) * Math.PI / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex items-center gap-8">
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        {slices.map((slice, index) => (
          <path
            key={index}
            d={createSlicePath(slice.startAngle, slice.angle)}
            fill={slice.color}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
      </svg>

      <div className="space-y-2 flex-1">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-800">{item.value}</span>
                <span className="text-gray-500 ml-1">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
