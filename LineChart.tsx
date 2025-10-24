interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  color?: string;
  height?: number;
}

export function LineChart({ data, color = '#C8102E', height = 200 }: Props) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (point.value / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-4">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ height: `${height}px` }}
        className="w-full"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <polyline
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${color})`}
        />

        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - (point.value / maxValue) * 80;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              vectorEffect="non-scaling-stroke"
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </circle>
          );
        })}
      </svg>

      <div className="flex justify-between text-xs text-gray-500">
        {data.map((point, index) => (
          <div key={index} className="text-center flex-1">
            <div className="font-medium text-gray-700">{point.value}</div>
            <div className="truncate">{point.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
