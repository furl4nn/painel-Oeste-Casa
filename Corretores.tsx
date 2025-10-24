import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase, Profile, Imovel } from '../lib/supabase';
import { Plus, Edit2, Trash2, X, Home, Eye } from 'lucide-react';

interface CorretorComImoveis extends Profile {
  imoveis_count: number;
  imoveis?: Imovel[];
}

export function Corretores() {
  const { user, profile } = useAuth();
  const [corretores, setCorretores] = useState<CorretorComImoveis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImoveisModal, setShowImoveisModal] = useState(false);
  const [selectedCorretor, setSelectedCorretor] = useState<CorretorComImoveis | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'corretor' as 'admin' | 'corretor' | 'suporte'
  });

  useEffect(() => {
    if (user) {
      loadCorretores();
    }
  }, [user]);

  async function loadCorretores() {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const corretoresComContagem = await Promise.all(
        (profilesData || []).map(async (corretor) => {
          const { count } = await supabase
            .from('imoveis')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', corretor.user_id);

          return {
            ...corretor,
            imoveis_count: count || 0
          };
        })
      );

      setCorretores(corretoresComContagem);
    } catch (error) {
      console.error('Erro ao carregar corretores:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCorretor(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role
          })
          .eq('user_id', authData.user.id);
      }

      alert('Corretor cadastrado com sucesso!');
      setShowModal(false);
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'corretor'
      });
      await loadCorretores();
    } catch (error: any) {
      console.error('Erro ao criar corretor:', error);
      alert(error.message || 'Erro ao criar corretor');
    }
  }

  async function handleDeleteCorretor(corretorId: string) {
    if (!confirm('Tem certeza que deseja excluir este corretor? Todos os imóveis dele também serão removidos.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', corretorId);

      if (error) throw error;

      alert('Corretor excluído com sucesso!');
      await loadCorretores();
    } catch (error) {
      console.error('Erro ao excluir corretor:', error);
      alert('Erro ao excluir corretor');
    }
  }

  async function viewImoveisCorretor(corretor: CorretorComImoveis) {
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('user_id', corretor.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSelectedCorretor({ ...corretor, imoveis: data || [] });
      setShowImoveisModal(true);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciar Corretores</h1>
            <p className="text-gray-600 mt-1">Cadastre e gerencie os corretores do sistema</p>
          </div>

          {profile?.role === 'admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Corretor
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {corretores.map((corretor) => (
            <div key={corretor.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#C8102E] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {corretor.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{corretor.full_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      corretor.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      corretor.role === 'corretor' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {corretor.role.charAt(0).toUpperCase() + corretor.role.slice(1)}
                    </span>
                  </div>
                </div>

                {profile?.role === 'admin' && (
                  <button
                    onClick={() => handleDeleteCorretor(corretor.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>📧 {corretor.user_id.substring(0, 8)}...</p>
                {corretor.phone && <p>📱 {corretor.phone}</p>}
                <p className={`font-semibold ${corretor.active ? 'text-green-600' : 'text-red-600'}`}>
                  {corretor.active ? '✓ Ativo' : '✗ Inativo'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-semibold">{corretor.imoveis_count} imóveis</span>
                </div>

                <button
                  onClick={() => viewImoveisCorretor(corretor)}
                  className="flex items-center gap-1 text-sm text-[#C8102E] hover:underline"
                >
                  <Eye className="w-4 h-4" />
                  Ver imóveis
                </button>
              </div>
            </div>
          ))}
        </div>

        {corretores.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">Nenhum corretor cadastrado ainda.</p>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Novo Corretor</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateCorretor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Acesso *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                >
                  <option value="corretor">Corretor</option>
                  <option value="admin">Administrador</option>
                  <option value="suporte">Suporte</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImoveisModal && selectedCorretor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Imóveis de {selectedCorretor.full_name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCorretor.imoveis?.length || 0} imóveis cadastrados
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImoveisModal(false);
                  setSelectedCorretor(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {selectedCorretor.imoveis && selectedCorretor.imoveis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCorretor.imoveis.map((imovel) => (
                    <div key={imovel.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{imovel.titulo}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          imovel.status === 'ativo' ? 'bg-green-100 text-green-700' :
                          imovel.status === 'vendido' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {imovel.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Tipo:</strong> {imovel.tipo}</p>
                        <p><strong>Finalidade:</strong> {imovel.finalidade}</p>
                        <p><strong>Preço:</strong> R$ {parseFloat(imovel.preco.toString()).toLocaleString('pt-BR')}</p>
                        <p><strong>Localização:</strong> {imovel.bairro}, {imovel.cidade}</p>
                        <p><strong>Código:</strong> {imovel.codigo_referencia}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Este corretor ainda não cadastrou nenhum imóvel.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
