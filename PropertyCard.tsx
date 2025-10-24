import { MapPin, Bed, Bath, Square, Car, Eye } from 'lucide-react';
import { PropertyImage } from './PropertyImage';

interface PropertyCardProps {
  imovel: {
    id: string;
    titulo: string;
    tipo: string;
    finalidade: string;
    preco: string;
    bairro: string;
    cidade: string;
    estado: string;
    quartos?: number;
    banheiros?: number;
    vagas?: number;
    area_total?: string;
    views?: number;
  };
  onClick?: () => void;
}

export function PropertyCard({ imovel, onClick }: PropertyCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative overflow-hidden">
        <PropertyImage
          imovelId={imovel.id}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          alt={imovel.titulo}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-[#C8102E] text-white px-3 py-1 rounded-full text-xs font-semibold">
            {imovel.finalidade}
          </span>
          <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
            {imovel.tipo}
          </span>
        </div>
        {imovel.views !== undefined && (
          <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{imovel.views}</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#C8102E] transition-colors">
          {imovel.titulo}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4 text-[#C8102E]" />
          <span className="text-sm">{imovel.bairro}, {imovel.cidade} - {imovel.estado}</span>
        </div>

        <div className="flex items-center gap-4 mb-4 text-gray-600 text-sm">
          {imovel.quartos !== undefined && imovel.quartos > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{imovel.quartos}</span>
            </div>
          )}
          {imovel.banheiros !== undefined && imovel.banheiros > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{imovel.banheiros}</span>
            </div>
          )}
          {imovel.vagas !== undefined && imovel.vagas > 0 && (
            <div className="flex items-center gap-1">
              <Car className="w-4 h-4" />
              <span>{imovel.vagas}</span>
            </div>
          )}
          {imovel.area_total && (
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span>{imovel.area_total}m²</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-2xl font-bold text-[#C8102E]">
            R$ {Number(imovel.preco).toLocaleString('pt-BR')}
          </p>
          {imovel.finalidade === 'Locação' && (
            <p className="text-xs text-gray-500 mt-1">por mês</p>
          )}
        </div>
      </div>
    </div>
  );
}
