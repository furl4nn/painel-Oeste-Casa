import { useState, useEffect } from 'react';
import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { ScrollToTop } from '../components/ScrollToTop';
import { supabase } from '../lib/supabase';
import { Search, Home as HomeIcon, Building2, MapPin, Star, Award, Users } from 'lucide-react';

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
}

export function PortalHome() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    tipo: '',
    finalidade: 'Venda',
    cidade: '',
    bairro: '',
    quartos: '',
    suites: '',
    banheiros: '',
    codigo: ''
  });

  useEffect(() => {
    loadImoveis();
  }, []);

  async function loadImoveis() {
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      if (data) setImoveis(data);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    setLoading(true);
    try {
      let query = supabase
        .from('imoveis')
        .select('*')
        .eq('status', 'ativo');

      if (searchFilters.finalidade) {
        query = query.eq('finalidade', searchFilters.finalidade);
      }
      if (searchFilters.tipo) {
        query = query.eq('tipo', searchFilters.tipo);
      }
      if (searchFilters.cidade) {
        query = query.ilike('cidade', `%${searchFilters.cidade}%`);
      }
      if (searchFilters.bairro) {
        query = query.ilike('bairro', `%${searchFilters.bairro}%`);
      }
      if (searchFilters.quartos) {
        query = query.gte('quartos', parseInt(searchFilters.quartos));
      }
      if (searchFilters.suites) {
        query = query.gte('suites', parseInt(searchFilters.suites));
      }
      if (searchFilters.banheiros) {
        query = query.gte('banheiros', parseInt(searchFilters.banheiros));
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setImoveis(data);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  }

  async function searchByCodigo() {
    if (!searchFilters.codigo) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('id', searchFilters.codigo)
        .eq('status', 'ativo')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        window.location.href = `#imovel-publico?id=${data.id}`;
      } else {
        alert('Imóvel não encontrado com este código.');
      }
    } catch (error) {
      console.error('Erro na busca por código:', error);
    } finally {
      setLoading(false);
    }
  }

  const imoveisVenda = imoveis.filter(i => i.finalidade === 'Venda');
  const imoveisLocacao = imoveis.filter(i => i.finalidade === 'Locação');

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <section
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24 md:py-32"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-[#C8102E] font-semibold mb-3 text-lg">Imóveis à Venda e Locação em São Paulo</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Encontre o imóvel ideal para você e sua família
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Navegue por milhares de imóveis para a venda e locação e encontre o melhor lugar para sua família. Venha conhecer todos os imóveis.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSearchFilters({ ...searchFilters, finalidade: 'Venda' })}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  searchFilters.finalidade === 'Venda'
                    ? 'bg-[#C8102E] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Venda
              </button>
              <button
                onClick={() => setSearchFilters({ ...searchFilters, finalidade: 'Locação' })}
                className={`px-8 py-3 rounded-full font-semibold transition-all ${
                  searchFilters.finalidade === 'Locação'
                    ? 'bg-[#C8102E] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Locação
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <select
                value={searchFilters.tipo}
                onChange={(e) => setSearchFilters({ ...searchFilters, tipo: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-gray-700"
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
                value={searchFilters.cidade}
                onChange={(e) => setSearchFilters({ ...searchFilters, cidade: e.target.value })}
                placeholder="Cidade"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-gray-700"
              />

              <input
                type="text"
                value={searchFilters.bairro}
                onChange={(e) => setSearchFilters({ ...searchFilters, bairro: e.target.value })}
                placeholder="Bairro"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-gray-700"
              />

              <select
                value={searchFilters.quartos}
                onChange={(e) => setSearchFilters({ ...searchFilters, quartos: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-gray-700"
              >
                <option value="">Quartos</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>

              <select
                value={searchFilters.suites}
                onChange={(e) => setSearchFilters({ ...searchFilters, suites: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-gray-700"
              >
                <option value="">Suítes</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>

              <select
                value={searchFilters.banheiros}
                onChange={(e) => setSearchFilters({ ...searchFilters, banheiros: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-gray-700"
              >
                <option value="">Banheiros</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>

              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors flex items-center justify-center gap-2 md:col-span-2"
              >
                <Search className="w-5 h-5" />
                Procurar
              </button>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-gray-700 font-semibold mb-3">Pesquise pelo código do imóvel</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchFilters.codigo}
                  onChange={(e) => setSearchFilters({ ...searchFilters, codigo: e.target.value })}
                  placeholder="Digite o código do imóvel"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-gray-700"
                />
                <button
                  onClick={searchByCodigo}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                >
                  Pesquisar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">IMÓVEIS À VENDA</h2>
            <div className="w-20 h-1 bg-[#C8102E] mx-auto"></div>
          </div>

          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
            <button className="px-6 py-2 bg-[#C8102E] text-white rounded-full font-semibold whitespace-nowrap">
              Casas
            </button>
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors whitespace-nowrap">
              Apartamentos
            </button>
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors whitespace-nowrap">
              Comercial
            </button>
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors whitespace-nowrap">
              Terrenos
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : imoveisVenda.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <HomeIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Não há imóveis para esta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {imoveisVenda.slice(0, 4).map((imovel) => (
                <PropertyCard
                  key={imovel.id}
                  imovel={imovel}
                  onClick={() => window.location.href = `#imovel-publico?id=${imovel.id}`}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => window.location.href = '#imoveis-lista?finalidade=Venda'}
              className="px-8 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
            >
              TODOS OS IMÓVEIS
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">IMÓVEIS P/ LOCAÇÃO</h2>
            <div className="w-20 h-1 bg-[#C8102E] mx-auto"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : imoveisLocacao.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Não há imóveis para esta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {imoveisLocacao.slice(0, 4).map((imovel) => (
                <PropertyCard
                  key={imovel.id}
                  imovel={imovel}
                  onClick={() => window.location.href = `#imovel-publico?id=${imovel.id}`}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => window.location.href = '#imoveis-lista?finalidade=Locação'}
              className="px-8 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
            >
              TODOS OS IMÓVEIS
            </button>
          </div>
        </div>
      </section>

      <section
        className="py-24 relative"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">O MELHOR PARA VOCÊ</h3>
              <p className="text-gray-300">
                Com diversos imóveis em nosso portfólio, oferecemos o melhor negócio para você e sua família.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">OFERTA ESPECIAL</h3>
              <p className="text-gray-300">
                Valores e Condições especiais em unidades selecionadas. Saiba mais.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">FACILIDADE E ESCOLHA</h3>
              <p className="text-gray-300">
                Seja qual for sua necessidade, nós temos o imóvel ideal para você e sua família.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">CONHEÇA TODOS OS IMÓVEIS</h2>
            <p className="text-gray-600">Navegue e encontre mais o que busca de acordo com o mapa</p>
          </div>

          <div className="bg-gradient-to-r from-[#C8102E] to-[#A00D25] rounded-2xl p-8 text-white text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Mapa de Imóveis em Breve</h3>
            <p className="text-gray-100 mb-6">
              Em breve você poderá visualizar todos os imóveis em um mapa interativo
            </p>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => window.location.href = '#imoveis-lista'}
              className="px-8 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
            >
              TODOS OS IMÓVEIS
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                alt="Corretor"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Anuncie seu imóvel aqui!</h2>
              <p className="text-gray-600 mb-6">
                Se você é corretor ou proprietário, essa é lugar certo para divulgar seu imóvel.
                Entre em contato e converse nas páginas de acesso personalizado para conhecer e
                anunciar de forma rápida e fácil.
              </p>

              <h3 className="text-xl font-bold text-gray-800 mb-4">Vantagens de anunciar:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600"><strong>Mais visibilidade:</strong> Seu imóvel no radar de centenas de compradores</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600"><strong>Zero burocracia:</strong> A gente cuida de tudo para você anunciar com tranquilidade</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600"><strong>Acesso exclusivo:</strong> Tenha seu próprio login para acompanhar e gerenciar seus anúncios</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600"><strong>Suporte personalizado:</strong> Nossa equipe sempre pronta para te ajudar sempre</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#C8102E] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600"><strong>Plataforma confiável:</strong> Anuncie em um ambiente seguro e lícito para gerar tranquilidade</p>
                </li>
              </ul>

              <button
                onClick={() => window.location.href = '#login'}
                className="px-8 py-4 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors text-lg"
              >
                QUERO ANUNCIAR NO SITE
              </button>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppButton />
      <ScrollToTop />
      <PublicFooter />
    </div>
  );
}
