import { useState, useEffect } from 'react';
import { supabase, Imovel } from '../lib/supabase';
import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';
import { useToast } from '../components/ToastContainer';
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Square,
  Phone,
  Mail,
  Send,
  Eye,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Home as HomeIcon
} from 'lucide-react';

interface ImovelImage {
  id: string;
  url: string;
  ordem: number;
  legenda?: string;
}

export function ImovelPublicoNovo() {
  const { showToast } = useToast();
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [images, setImages] = useState<ImovelImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: 'Olá! Tenho interesse neste imóvel. Por favor, entre em contato.'
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const id = params.get('id');
    if (id) {
      loadImovel(id);
    }
  }, []);

  async function loadImovel(id: string) {
    try {
      const { data: imovelData, error: imovelError } = await supabase
        .from('imoveis')
        .select('*')
        .eq('id', id)
        .eq('status', 'ativo')
        .maybeSingle();

      if (imovelError) throw imovelError;

      if (imovelData) {
        setImovel(imovelData);

        await supabase
          .from('imoveis')
          .update({ views: (imovelData.views || 0) + 1 })
          .eq('id', id);

        const { data: imagesData } = await supabase
          .from('imovel_images')
          .select('*')
          .eq('imovel_id', id)
          .order('ordem', { ascending: true });

        if (imagesData && imagesData.length > 0) {
          setImages(imagesData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar imóvel:', error);
      showToast('Erro ao carregar imóvel', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imovel) return;

    setSending(true);

    try {
      const { error } = await supabase.from('leads').insert({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        observacoes: formData.mensagem,
        origem: 'Site - Página de Imóvel',
        imovel_id: imovel.id,
        corretor_id: imovel.user_id,
        status: 'Novo',
        data_contato: new Date().toISOString()
      });

      if (error) throw error;

      showToast('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        mensagem: 'Olá! Tenho interesse neste imóvel. Por favor, entre em contato.'
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem. Tente novamente.', 'error');
    } finally {
      setSending(false);
    }
  }

  function shareImovel() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: imovel?.titulo || 'Imóvel',
        text: `Confira este imóvel: ${imovel?.titulo}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link copiado para área de transferência!', 'success');
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando imóvel...</p>
        </div>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <HomeIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Imóvel não encontrado</h2>
          <p className="text-gray-600 mb-6">Este imóvel não está mais disponível ou foi removido.</p>
          <button
            onClick={() => window.location.href = '#'}
            className="px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
          >
            Voltar para Página Inicial
          </button>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const caracteristicas = imovel.caracteristicas as any || {};
  const caracteristicasList = [
    { key: 'ar_condicionado', label: 'Ar Condicionado' },
    { key: 'armarios', label: 'Armários Embutidos' },
    { key: 'piscina', label: 'Piscina' },
    { key: 'churrasqueira', label: 'Churrasqueira' },
    { key: 'academia', label: 'Academia' },
    { key: 'area_servico', label: 'Área de Serviço' },
    { key: 'despensa', label: 'Despensa' },
    { key: 'escritorio', label: 'Escritório' },
    { key: 'sala_jantar', label: 'Sala de Jantar' },
    { key: 'sala_estar', label: 'Sala de Estar' },
    { key: 'sala_tv', label: 'Sala de TV' },
    { key: 'jardim', label: 'Jardim' },
    { key: 'quintal', label: 'Quintal' },
    { key: 'varanda', label: 'Varanda' },
    { key: 'sacada', label: 'Sacada' },
    { key: 'elevador', label: 'Elevador' },
    { key: 'portaria_24h', label: 'Portaria 24h' },
    { key: 'salao_festas', label: 'Salão de Festas' },
    { key: 'playground', label: 'Playground' },
    { key: 'quadra_esportes', label: 'Quadra de Esportes' },
    { key: 'pet_friendly', label: 'Aceita Pets' }
  ].filter(item => caracteristicas[item.key]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#C8102E] mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="relative">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex].url}
                      alt={imovel.titulo}
                      className="w-full h-96 object-cover cursor-pointer"
                      onClick={() => setShowGallery(true)}
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <HomeIcon className="w-20 h-20 text-gray-400" />
                  </div>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#C8102E] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {imovel.finalidade}
                  </span>
                  <span className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold">
                    {imovel.tipo}
                  </span>
                </div>

                <button
                  onClick={shareImovel}
                  className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {images.length > 1 && (
                <div className="p-4 grid grid-cols-4 md:grid-cols-6 gap-2">
                  {images.slice(0, 6).map((image, index) => (
                    <img
                      key={image.id}
                      src={image.url}
                      alt={`Imagem ${index + 1}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-20 w-full object-cover rounded-lg cursor-pointer ${
                        index === currentImageIndex ? 'ring-2 ring-[#C8102E]' : 'opacity-70 hover:opacity-100'
                      } transition-all`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{imovel.titulo}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-[#C8102E]" />
                    <span>{imovel.endereco}, {imovel.bairro}, {imovel.cidade} - {imovel.estado}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{imovel.views || 0} visualizações</span>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-4xl font-bold text-[#C8102E]">
                  R$ {Number(imovel.preco).toLocaleString('pt-BR')}
                </p>
                {imovel.finalidade === 'Locação' && (
                  <p className="text-gray-600">por mês</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {imovel.quartos !== undefined && imovel.quartos > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Bed className="w-7 h-7 text-[#C8102E]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{imovel.quartos}</p>
                      <p className="text-sm text-gray-600">Quartos</p>
                    </div>
                  </div>
                )}

                {imovel.banheiros !== undefined && imovel.banheiros > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Bath className="w-7 h-7 text-[#C8102E]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{imovel.banheiros}</p>
                      <p className="text-sm text-gray-600">Banheiros</p>
                    </div>
                  </div>
                )}

                {imovel.vagas !== undefined && imovel.vagas > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Car className="w-7 h-7 text-[#C8102E]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{imovel.vagas}</p>
                      <p className="text-sm text-gray-600">Vagas</p>
                    </div>
                  </div>
                )}

                {imovel.area_total && (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Square className="w-7 h-7 text-[#C8102E]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{imovel.area_total}</p>
                      <p className="text-sm text-gray-600">m²</p>
                    </div>
                  </div>
                )}
              </div>

              {imovel.descricao && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Descrição</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{imovel.descricao}</p>
                </div>
              )}

              {caracteristicasList.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Características</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {caracteristicasList.map((item) => (
                      <div key={item.key} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Interessado neste imóvel?</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] resize-none"
                    placeholder="Sua mensagem..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-4 text-center">Ou entre em contato diretamente:</p>
                <div className="space-y-3">
                  <a
                    href="tel:+551134445555"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-[#C8102E]" />
                    <span className="text-gray-700">(11) 3444-5555</span>
                  </a>
                  <a
                    href="mailto:contato@oestecasa.com.br"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[#C8102E]" />
                    <span className="text-gray-700">contato@oestecasa.com.br</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-6 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-7 h-7 text-white" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-6 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-7 h-7 text-white" />
          </button>

          <div className="max-w-6xl max-h-full p-6">
            <img
              src={images[currentImageIndex]?.url}
              alt={`Imagem ${currentImageIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-4">
              {currentImageIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
