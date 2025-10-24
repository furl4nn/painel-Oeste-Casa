import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Search, Edit2, Trash2, X, LayoutList, LayoutGrid } from 'lucide-react';
import { useToast } from '../components/ToastContainer';

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  data_contato: string;
  imovel_id: string | null;
  status: string;
  observacoes: string;
  created_at: string;
}

interface Imovel {
  id: string;
  titulo: string;
}

export function CRM() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    origem: '',
    data_contato: new Date().toISOString().slice(0, 16),
    imovel_id: '',
    status: 'Novo',
    observacoes: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      const [leadsRes, imoveisRes] = await Promise.all([
        supabase
          .from('leads')
          .select('*')
          .eq('corretor_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('imoveis')
          .select('id, titulo')
          .eq('user_id', user!.id)
      ]);

      if (leadsRes.data) setLeads(leadsRes.data);
      if (imoveisRes.data) setImoveis(imoveisRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  function openModal(lead?: Lead) {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        nome: lead.nome,
        email: lead.email || '',
        telefone: lead.telefone || '',
        origem: lead.origem || '',
        data_contato: lead.data_contato ? new Date(lead.data_contato).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        imovel_id: lead.imovel_id || '',
        status: lead.status,
        observacoes: lead.observacoes || ''
      });
    } else {
      setEditingLead(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        origem: '',
        data_contato: new Date().toISOString().slice(0, 16),
        imovel_id: '',
        status: 'Novo',
        observacoes: ''
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingLead(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingLead) {
        const { error } = await supabase
          .from('leads')
          .update({
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            origem: formData.origem,
            data_contato: formData.data_contato,
            imovel_id: formData.imovel_id || null,
            status: formData.status,
            observacoes: formData.observacoes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLead.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([{
            corretor_id: user.id,
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            origem: formData.origem,
            data_contato: formData.data_contato,
            imovel_id: formData.imovel_id || null,
            status: formData.status,
            observacoes: formData.observacoes
          }]);

        if (error) throw error;
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      showToast('Erro ao salvar lead. Tente novamente.', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      showToast('Erro ao excluir lead. Tente novamente.', 'error');
    }
  }

  async function handleStatusChange(leadId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      await loadData();
      showToast('Status atualizado!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    }
  }

  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.telefone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.origem?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    'Novo': 'bg-blue-100 text-blue-700',
    'Em Atendimento': 'bg-yellow-100 text-yellow-700',
    'Qualificado': 'bg-green-100 text-green-700',
    'Convertido': 'bg-green-200 text-green-800',
    'Perdido': 'bg-red-100 text-red-700'
  };

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
          <h1 className="text-3xl font-bold text-gray-800">CRM - Gerenciamento de Leads</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white rounded-lg border p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-[#C8102E] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'kanban' ? 'bg-[#C8102E] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Lead
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
            />
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contato</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Origem</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Data Contato</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Imóvel</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Nenhum lead encontrado' : 'Nenhum lead cadastrado ainda'}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const imovel = imoveis.find(i => i.id === lead.imovel_id);
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{lead.nome}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {lead.email && <div>{lead.email}</div>}
                            {lead.telefone && <div>{lead.telefone}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{lead.origem || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {lead.data_contato ? new Date(lead.data_contato).toLocaleString('pt-BR') : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lead.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {imovel ? imovel.titulo : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(lead)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {['Novo', 'Em Atendimento', 'Qualificado', 'Convertido', 'Perdido'].map(status => {
              const statusLeads = filteredLeads.filter(l => l.status === status);
              return (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">{status}</h3>
                    <span className="bg-white text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                      {statusLeads.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {statusLeads.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Nenhum lead
                      </div>
                    ) : (
                      statusLeads.map(lead => {
                        const imovel = imoveis.find(i => i.id === lead.imovel_id);
                        return (
                          <div
                            key={lead.id}
                            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-800 text-sm">{lead.nome}</h4>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openModal(lead)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(lead.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {lead.email && (
                              <p className="text-xs text-gray-600 mb-1">{lead.email}</p>
                            )}
                            {lead.telefone && (
                              <p className="text-xs text-gray-600 mb-2">{lead.telefone}</p>
                            )}

                            {imovel && (
                              <p className="text-xs text-gray-500 mb-2 truncate">
                                🏠 {imovel.titulo}
                              </p>
                            )}

                            {lead.origem && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">
                                {lead.origem}
                              </span>
                            )}

                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1 mt-2 focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                            >
                              <option value="Novo">Novo</option>
                              <option value="Em Atendimento">Em Atendimento</option>
                              <option value="Qualificado">Qualificado</option>
                              <option value="Convertido">Convertido</option>
                              <option value="Perdido">Perdido</option>
                            </select>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Total de leads: {filteredLeads.length}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingLead ? 'Editar Lead' : 'Novo Lead'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Lead *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origem do Lead
                  </label>
                  <input
                    type="text"
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                    placeholder="Ex: Site, Indicação, Facebook..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora do Contato
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.data_contato}
                    onChange={(e) => setFormData({ ...formData, data_contato: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  >
                    <option value="Novo">Novo</option>
                    <option value="Em Atendimento">Em Atendimento</option>
                    <option value="Qualificado">Qualificado</option>
                    <option value="Convertido">Convertido</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imóvel de Interesse
                  </label>
                  <select
                    value={formData.imovel_id}
                    onChange={(e) => setFormData({ ...formData, imovel_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  >
                    <option value="">Nenhum</option>
                    {imoveis.map((imovel) => (
                      <option key={imovel.id} value={imovel.id}>
                        {imovel.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={4}
                    placeholder="Adicione observações sobre o lead..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
                >
                  {editingLead ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
