import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Home, Plus, Edit2, Trash2, X, Shield } from 'lucide-react';
import { useToast } from '../components/ToastContainer';

interface Profile {
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: string;
  creci?: string;
  created_at: string;
}

interface Imovel {
  id: string;
  titulo: string;
  tipo: string;
  cidade: string;
  preco: string;
  status: string;
  user_id: string;
  profiles?: { full_name: string };
}

export function Admin() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'corretores' | 'imoveis'>('corretores');
  const [corretores, setCorretores] = useState<Profile[]>([]);
  const [todosImoveis, setTodosImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    creci: ''
  });

  useEffect(() => {
    if (profile?.role !== 'admin') {
      window.location.href = '#inicio';
      return;
    }
    loadData();
  }, [profile]);

  async function loadData() {
    setLoading(true);
    try {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'corretor')
        .order('created_at', { ascending: false });

      if (profilesData) setCorretores(profilesData);

      const { data: imoveisData } = await supabase
        .from('imoveis')
        .select(`
          *,
          profiles!imoveis_user_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (imoveisData) setTodosImoveis(imoveisData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCorretor(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'corretor'
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            creci: formData.creci,
            role: 'corretor'
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;
      }

      showToast('Corretor cadastrado com sucesso!', 'success');
      setShowModal(false);
      setFormData({ full_name: '', email: '', password: '', phone: '', creci: '' });
      await loadData();
    } catch (error: any) {
      console.error('Erro ao criar corretor:', error);
      showToast(error.message || 'Erro ao cadastrar corretor', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCorretor(userId: string) {
    if (!confirm('Tem certeza que deseja excluir este corretor? Todos os imóveis dele também serão excluídos.')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      showToast('Corretor excluído com sucesso!', 'success');
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir corretor:', error);
      showToast('Erro ao excluir corretor', 'error');
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
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir imóvel:', error);
      showToast('Erro ao excluir imóvel', 'error');
    }
  }

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

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-8 h-8 text-[#C8102E]" />
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-2">Gerencie corretores e imóveis do sistema</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setTab('corretores')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  tab === 'corretores'
                    ? 'text-[#C8102E] border-b-2 border-[#C8102E]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Corretores ({corretores.length})
              </button>
              <button
                onClick={() => setTab('imoveis')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  tab === 'imoveis'
                    ? 'text-[#C8102E] border-b-2 border-[#C8102E]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Home className="w-5 h-5 inline mr-2" />
                Todos os Imóveis ({todosImoveis.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {tab === 'corretores' ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Gerenciar Corretores</h2>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A00D25] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Cadastrar Corretor
                  </button>
                </div>

                {corretores.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum corretor cadastrado ainda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {corretores.map((corretor) => (
                      <div key={corretor.user_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800">{corretor.full_name}</h3>
                            {corretor.creci && (
                              <p className="text-xs text-gray-500 mt-1">CRECI: {corretor.creci}</p>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Corretor
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          {corretor.phone && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Tel:</span> {corretor.phone}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            Cadastrado em {new Date(corretor.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteCorretor(corretor.user_id)}
                          className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir Corretor
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Todos os Imóveis do Sistema</h2>

                {todosImoveis.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum imóvel cadastrado ainda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todosImoveis.map((imovel) => (
                      <div key={imovel.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{imovel.titulo}</h3>
                            <p className="text-xs text-gray-500">
                              Por: {imovel.profiles?.full_name || 'Desconhecido'}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            imovel.status === 'ativo' ? 'bg-green-100 text-green-700' :
                            imovel.status === 'vendido' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {imovel.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p>{imovel.tipo} em {imovel.cidade}</p>
                          <p className="font-semibold text-[#C8102E]">
                            R$ {Number(imovel.preco).toLocaleString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => window.location.href = `#cadastrar-imovel?edit=${imovel.id}`}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Cadastrar Corretor</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCorretor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome e Sobrenome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° do CRECI
                </label>
                <input
                  type="text"
                  value={formData.creci}
                  onChange={(e) => setFormData({ ...formData, creci: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp/Celular *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha * (mínimo 8 caracteres)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg hover:bg-[#A00D25] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
