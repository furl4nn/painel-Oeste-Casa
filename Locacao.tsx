import { useState, useEffect } from 'react';
import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ScrollToTop } from '../components/ScrollToTop';
import { supabase } from '../lib/supabase';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Imovel {
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
  status: string;
  aceita_permuta?: boolean;
  aceita_financiamento?: boolean;
  caracteristicas?: Record<string, boolean>;
}

export function Locacao() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;
  const [filters, setFilters] = useState({
    tipo: '',
    cidade: '',
    bairro: '',
    quartos: '',
    suites: '',
    banheiros: '',
    vagas: '',
    precoMin: '',
    precoMax: '',
    areaMin: '',
    areaMax: '',
    search: '',
    comodidades: {
      piscina: false,
      churrasqueira: false,
      academia: false,
      salao_festas: false,
      playground: false,
      quadra_esportes: false,
      pet_friendly: false
    }
  });

  useEffect(() => {
    loadImoveis();
  }, [currentPage]);

  async function loadImoveis() {
    setLoading(true);
    try {
      let query = supabase
        .from('imoveis')
        .select('*', { count: 'exact' })
        .eq('status', 'ativo')
        .eq('finalidade', 'Locação');

      if (filters.tipo) query = query.eq('tipo', filters.tipo);
      if (filters.cidade) query = query.ilike('cidade', `%${filters.cidade}%`);
      if (filters.bairro) query = query.ilike('bairro', `%${filters.bairro}%`);
      if (filters.quartos) query = query.gte('quartos', parseInt(filters.quartos));
      if (filters.banheiros) query = query.gte('banheiros', parseInt(filters.banheiros));
      if (filters.vagas) query = query.gte('vagas', parseInt(filters.vagas));
      if (filters.precoMin) query = query.gte('preco', filters.precoMin);
      if (filters.precoMax) query = query.lte('preco', filters.precoMax);
      if (filters.areaMin) query = query.gte('area_total', filters.areaMin);
      if (filters.areaMax) query = query.lte('area_total', filters.areaMax);
      if (filters.search) query = query.or(`titulo.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      let filteredData = data || [];

      const activeComodidades = Object.entries(filters.comodidades)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      if (activeComodidades.length > 0) {
        filteredData = filteredData.filter(imovel => {
          const caracteristicas = imovel.caracteristicas || {};
          return activeComodidades.every(comodidade => caracteristicas[comodidade] === true);
        });
      }

      setImoveis(filteredData);
      if (count !== null) setTotalCount(count);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setFilters({
      tipo: '',
      cidade: '',
      bairro: '',
      quartos: '',
      suites: '',
      banheiros: '',
      vagas: '',
      precoMin: '',
      precoMax: '',
      areaMin: '',
      areaMax: '',
      search: '',
      comodidades: {
        piscina: false,
        churrasqueira: false,
        academia: false,
        salao_festas: false,
        playground: false,
        quadra_esportes: false,
        pet_friendly: false
      }
    });
    setCurrentPage(1);
    setTimeout(() => loadImoveis(), 100);
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="bg-gradient-to-r from-[#C8102E] to-[#A00D25] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Imóveis para Locação</h1>
          <p className="text-gray-100">
            Encontre o imóvel perfeito para alugar
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && loadImoveis()}
                placeholder="Buscar por título ou descrição..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                showFilters ? 'bg-[#C8102E] text-white' : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtros
            </button>
            <button
              onClick={() => {
                setCurrentPage(1);
                loadImoveis();
              }}
              className="px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
            >
              Buscar
            </button>
          </div>

          {showFilters && (
            <div className="border-t pt-6 mt-4 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Tipo e Localização</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <select
                    value={filters.tipo}
                    onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  >
                    <option value="">Tipo de Imóvel</option>
                    <option value="Casa">Casa</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Rural">Rural</option>
                  </select>

                  <input
                    type="text"
                    value={filters.cidade}
                    onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
                    placeholder="Cidade"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />

                  <input
                    type="text"
                    value={filters.bairro}
                    onChange={(e) => setFilters({ ...filters, bairro: e.target.value })}
                    placeholder="Bairro"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Características</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <select
                    value={filters.quartos}
                    onChange={(e) => setFilters({ ...filters, quartos: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  >
                    <option value="">Quartos</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>

                  <select
                    value={filters.banheiros}
                    onChange={(e) => setFilters({ ...filters, banheiros: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  >
                    <option value="">Banheiros</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>

                  <select
                    value={filters.vagas}
                    onChange={(e) => setFilters({ ...filters, vagas: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  >
                    <option value="">Vagas</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Valor Mensal (R$)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={filters.precoMin}
                    onChange={(e) => setFilters({ ...filters, precoMin: e.target.value })}
                    placeholder="Valor Mínimo"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                  <input
                    type="number"
                    value={filters.precoMax}
                    onChange={(e) => setFilters({ ...filters, precoMax: e.target.value })}
                    placeholder="Valor Máximo"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Área (m²)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={filters.areaMin}
                    onChange={(e) => setFilters({ ...filters, areaMin: e.target.value })}
                    placeholder="Área Mínima"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                  <input
                    type="number"
                    value={filters.areaMax}
                    onChange={(e) => setFilters({ ...filters, areaMax: e.target.value })}
                    placeholder="Área Máxima"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Comodidades</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Object.entries({
                    piscina: 'Piscina',
                    churrasqueira: 'Churrasqueira',
                    academia: 'Academia',
                    salao_festas: 'Salão de Festas',
                    playground: 'Playground',
                    quadra_esportes: 'Quadra de Esportes',
                    pet_friendly: 'Pet Friendly'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.comodidades[key as keyof typeof filters.comodidades]}
                        onChange={(e) => setFilters({
                          ...filters,
                          comodidades: {
                            ...filters.comodidades,
                            [key]: e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-[#C8102E] focus:ring-[#C8102E] rounded"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-gray-600">
            {loading ? (
              <span className="inline-block w-32 h-6 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              <>
                <span className="font-semibold text-gray-800">{totalCount}</span> imóveis encontrados
                {totalPages > 1 && (
                  <span className="text-sm ml-2">(Página {currentPage} de {totalPages})</span>
                )}
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : imoveis.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar os filtros ou realizar uma nova busca
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imoveis.map((imovel) => (
                <PropertyCard
                  key={imovel.id}
                  imovel={imovel}
                  onClick={() => window.location.href = `#imovel-publico?id=${imovel.id}`}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      if (page === 2 && currentPage > 4) return 'ellipsis-start';
                      if (page === totalPages - 1 && currentPage < totalPages - 3) return 'ellipsis-end';
                      return false;
                    })
                    .map((page, index) => {
                      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page as number);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-12 h-12 rounded-lg font-semibold transition-colors ${
                            currentPage === page
                              ? 'bg-[#C8102E] text-white'
                              : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage >= totalPages}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <WhatsAppButton />
      <ScrollToTop />
      <PublicFooter />
    </div>
  );
}
