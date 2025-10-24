import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
  onRefresh?: () => void;
}

export function Card({ title, children, className = '', onRefresh }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
