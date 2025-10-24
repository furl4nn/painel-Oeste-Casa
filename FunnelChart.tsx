import { CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface FunnelData {
  contato: number;
  visita: number;
  proposta: number;
  negociacao: number;
  fechado: number;
  perdidos: number;
  ativos: number;
}

interface FunnelChartProps {
  data: FunnelData;
}

export function FunnelChart({ data }: FunnelChartProps) {
  const stages = [
    { label: 'Contato', value: data.contato, color: '#3B82F6' },
    { label: 'Visita', value: data.visita, color: '#60A5FA' },
    { label: 'Proposta', value: data.proposta, color: '#93C5FD' },
    { label: 'Negociação', value: data.negociacao, color: '#BFDBFE' },
    { label: 'Fechado', value: data.fechado, color: '#DBEAFE' }
  ];

  const maxValue = data.contato;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{stage.label}</span>
                <span className="text-gray-600">{stage.value}</span>
              </div>
              <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500 flex items-center justify-center text-white font-semibold"
                  style={{
                    width: `${width}%`,
                    backgroundColor: stage.color,
                    minWidth: stage.value > 0 ? '60px' : '0'
                  }}
                >
                  {stage.value > 0 && stage.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-xs text-gray-500">Ganhos</p>
            <p className="font-semibold text-gray-800">{data.fechado}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-xs text-gray-500">Perdidos</p>
            <p className="font-semibold text-gray-800">{data.perdidos}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Ativos</p>
            <p className="font-semibold text-gray-800">{data.ativos}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
