import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ImovelImagemDestaque } from '../components/ImovelImagemDestaque';
import { useAuth } from '../context/AuthContext';
import { supabase, Imovel } from '../lib/supabase';
import { User, Phone, Mail, Edit2, Trash2, Eye, Home, MapPin, DollarSign, Filter, X, Share2, ExternalLink } from 'lucide-react';
import { useToast } from '../components/ToastContainer';

export function Perfil() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || ''
  });
  const [filters, setFilters] = useState({
    tipo: '',
    cidade: '',
    bairro: '',
    status: '',
    finalidade: '',
    precoMin: '',
    precoMax: '',
    quartos: '',
    vagas: '',
    ordenar: 'recentes'
  });

  useEffect(() => {
    if (user) {
      loadImoveis();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  async function loadImoveis() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setImoveis(data || []);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone
        })
        .eq('user_id', user.id);

      if (error) throw error;

      showToast('Perfil atualizado com sucesso!', 'success');
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      showToast('Erro ao atualizar perfil', 'error');
    }
  }

  async function handleDeleteImovel(imovelId: string) {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return;

    try {
      const { error } = await supabase
        .from('imoveis')
        .delete()
        .eq('id', imovelId);

      if (error) throw error;

      showToast('Imóvel excluído com sucesso!', 'success');
      await loadImoveis();
    } catch (error) {
      console.error('Erro ao excluir imóvel:', error);
      showToast('Erro ao excluir imóvel', 'error');
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      showToast('Foto de perfil atualizada!', 'success');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      showToast('Erro ao atualizar foto de perfil', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleEditImovel(imovelId: string) {
    window.location.href = `#cadastrar-imovel?edit=${imovelId}`;
  }

  function handleShareImovel(imovel: Imovel) {
    const url = `${window.location.origin}#imovel-publico?id=${imovel.id}`;
    if (navigator.share) {
      navigator.share({
        title: imovel.titulo,
        text: `${imovel.tipo} em ${imovel.cidade} - R$ ${Number(imovel.preco).toLocaleString('pt-BR')}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link copiado para a área de transferência!', 'success');
    }
  }

  function handleViewPublic(imovelId: string) {
    window.open(`#imovel-publico?id=${imovelId}`, '_blank');
  }

  function limparFiltros() {
    setFilters({
      tipo: '',
      cidade: '',
      bairro: '',
      status: '',
      finalidade: '',
      precoMin: '',
      precoMax: '',
      quartos: '',
      vagas: '',
      ordenar: 'recentes'
    });
  }

  const imoveisFiltrados = imoveis.filter(imovel => {
    if (filters.tipo && imovel.tipo !== filters.tipo) return false;
    if (filters.cidade && !imovel.cidade.toLowerCase().includes(filters.cidade.toLowerCase())) return false;
    if (filters.bairro && !imovel.bairro.toLowerCase().includes(filters.bairro.toLowerCase())) return false;
    if (filters.status && imovel.status !== filters.status) return false;
    if (filters.finalidade && imovel.finalidade !== filters.finalidade) return false;
    if (filters.precoMin && parseFloat(imovel.preco.toString()) < parseFloat(filters.precoMin)) return false;
    if (filters.precoMax && parseFloat(imovel.preco.toString()) > parseFloat(filters.precoMax)) return false;
    if (filters.quartos && imovel.quartos !== parseInt(filters.quartos)) return false;
    if (filters.vagas && imovel.vagas !== parseInt(filters.vagas)) return false;
    return true;
  }).sort((a, b) => {
    switch (filters.ordenar) {
      case 'recentes':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'antigos':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'menor_preco':
        return parseFloat(a.preco.toString()) - parseFloat(b.preco.toString());
      case 'maior_preco':
        return parseFloat(b.preco.toString()) - parseFloat(a.preco.toString());
      default:
        return 0;
    }
  });

  const cidades = Array.from(new Set(imoveis.map(i => i.cidade))).filter(Boolean);
  const bairros = Array.from(new Set(imoveis.map(i => i.bairro))).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Navbar />

      <a
        href="#cadastrar-imovel"
        className="fixed bottom-8 right-8 z-50 px-6 py-4 bg-[#C8102E] text-white rounded-full shadow-2xl hover:bg-[#A00D25] transition-all hover:scale-110 flex items-center gap-2 font-semibold"
      >
        <Home className="w-5 h-5" />
        Cadastrar Imóvel
      </a>

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Meu Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#C8102E]"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-[#C8102E] rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-50 transition-colors border-2 border-[#C8102E]">
                    <Edit2 className="w-4 h-4 text-[#C8102E]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 text-center">{profile?.full_name}</h2>
                <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full mt-2">
                  {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'corretor' ? 'Corretor' : 'Suporte'}
                </span>
              </div>

              {!editMode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <User className="w-5 h-5 text-[#C8102E]" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Nome e Sobrenome</p>
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                    </div>
                  </div>

                  {profile?.creci && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Edit2 className="w-5 h-5 text-[#C8102E]" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">N° do CRECI</p>
                        <p className="text-sm font-medium">{profile.creci}</p>
                      </div>
                    </div>
                  )}

                  {profile?.whatsapp && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-5 h-5 text-[#C8102E]" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">WhatsApp/Celular</p>
                        <p className="text-sm font-medium">{profile.whatsapp}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-[#C8102E]" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full mt-6 px-4 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar Perfil
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Meus Imóveis</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filtros
                  </button>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Home className="w-5 h-5" />
                    <span className="font-semibold">{imoveisFiltrados.length} de {imoveis.length}</span>
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Filtros</h3>
                    <button
                      onClick={limparFiltros}
                      className="text-sm text-[#C8102E] hover:text-[#A00D25] font-medium"
                    >
                      Limpar Filtros
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={filters.tipo}
                        onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-sm"
                      >
                        <option value="">Todos os tipos</option>
                        <option value="Casa">Casa</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Terreno">Terreno</option>
                        <option value="Sala Comercial">Sala Comercial</option>
                        <option value="Chácara">Chácara</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</label>
                      <select
                        value={filters.finalidade}
                        onChange={(e) => setFilters({ ...filters, finalidade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-sm"
                      >
                        <option value="">Todas</option>
                        <option value="Venda">Venda</option>
                        <option value="Locação">Locação</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-sm"
                      >
                        <option value="">Todos os status</option>
                        <option value="ativo">Ativo</option>
                        <option value="reservado">Reservado</option>
                        <option value="em_negociacao">Em Negociação</option>
                        <option value="vendido">Vendido</option>
                        <option value="alugado">Alugado</option>
                        <option value="indisponivel">Indisponível</option>
                        <option value="em_reforma">Em Reforma</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <select
                        value={filters.cidade}
                        onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-sm"
                      >
                        <option value="">Todas as cidades</option>
                        {cidades.map(cidade => (
                          <option key={cidade} value={cidade}>{cidade}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                      <select
                        value={filters.bairro}
                        onChange={(e) => setFilters({ ...filters, bairro: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-sm"
                      >
                        <option value="">Todos os bairros</option>
                        {bairros.map(bairro => (
                          <option key={bairro} value={bairro}>{bairro}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                      <select
                        value={filters.ordenar}
                        onChange={(e) => setFilters({ ...filters, ordenar: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-sm"
                      >
                        <option value="recentes">Mais recentes</option>
                        <option value="antigos">Mais antigos</option>
                        <option value="menor_preco">Menor preço</option>
                        <option value="maior_preco">Maior preço</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mínimo</label>
                      <input
                        type="number"
                        value={filters.precoMin}
                        onChange={(e) => setFilters({ ...filters, precoMin: e.target.value })}
                        placeholder="R$ 0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço Máximo</label>
                      <input
                        type="number"
                        value={filters.precoMax}
                        onChange={(e) => setFilters({ ...filters, precoMax: e.target.value })}
                        placeholder="R$ 0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
                      <select
                        value={filters.quartos}
                        onChange={(e) => setFilters({ ...filters, quartos: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] text-sm"
                      >
                        <option value="">Qualquer quantidade</option>
                        <option value="1">1 quarto</option>
                        <option value="2">2 quartos</option>
                        <option value="3">3 quartos</option>
                        <option value="4">4+ quartos</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {imoveisFiltrados.length === 0 && imoveis.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Você ainda não cadastrou nenhum imóvel</p>
                  <a
                    href="#cadastrar-imovel"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    Cadastrar Primeiro Imóvel
                  </a>
                </div>
              ) : imoveisFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum imóvel encontrado com os filtros selecionados</p>
                  <button
                    onClick={limparFiltros}
                    className="text-[#C8102E] hover:text-[#A00D25] font-semibold"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imoveisFiltrados.map((imovel) => (
                    <div key={imovel.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="mb-3">
                        <ImovelImagemDestaque imovelId={imovel.id} className="w-full h-48 mb-3" />
                      </div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{imovel.titulo}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            imovel.status === 'ativo' ? 'bg-green-100 text-green-700' :
                            imovel.status === 'reservado' ? 'bg-yellow-100 text-yellow-700' :
                            imovel.status === 'em_negociacao' ? 'bg-orange-100 text-orange-700' :
                            imovel.status === 'vendido' ? 'bg-blue-100 text-blue-700' :
                            imovel.status === 'alugado' ? 'bg-purple-100 text-purple-700' :
                            imovel.status === 'indisponivel' ? 'bg-gray-100 text-gray-700' :
                            imovel.status === 'em_reforma' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {imovel.status === 'em_negociacao' ? 'Em Negociação' :
                             imovel.status === 'em_reforma' ? 'Em Reforma' :
                             imovel.status === 'indisponivel' ? 'Indisponível' :
                             imovel.status.charAt(0).toUpperCase() + imovel.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-[#C8102E]" />
                          <span>{imovel.tipo} • {imovel.finalidade}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#C8102E]" />
                          <span>{imovel.bairro}, {imovel.cidade}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#C8102E]" />
                          <span className="font-semibold">R$ {parseFloat(imovel.preco.toString()).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditImovel(imovel.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteImovel(imovel.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewPublic(imovel.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Ver Público
                          </button>
                          <button
                            onClick={() => handleShareImovel(imovel)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            Compartilhar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
