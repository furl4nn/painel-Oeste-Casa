import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastContainer';
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Home,
  Check,
  X,
  Edit2,
  Trash2
} from 'lucide-react';

interface Visita {
  id: string;
  titulo: string;
  descricao: string | null;
  data_hora: string;
  status: string;
  local: string | null;
  duracao_minutos: number;
  lead_id: string | null;
  imovel_id: string | null;
  leads?: { nome: string } | null;
  imoveis?: { titulo: string } | null;
}

export function Agenda() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [leads, setLeads] = useState<any[]>([]);
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_hora: '',
    status: 'agendado',
    local: '',
    duracao_minutos: 60,
    lead_id: '',
    imovel_id: ''
  });

  useEffect(() => {
    if (user) {
      loadVisitas();
      loadLeads();
      loadImoveis();
    }
  }, [user, currentDate, viewMode]);

  async function loadVisitas() {
    if (!user) return;

    try {
      const startDate = getStartDate();
      const endDate = getEndDate();

      const { data, error } = await supabase
        .from('visitas')
        .select(`
          *,
          leads(nome),
          imoveis(titulo)
        `)
        .eq('corretor_id', user.id)
        .gte('data_hora', startDate.toISOString())
        .lte('data_hora', endDate.toISOString())
        .order('data_hora', { ascending: true });

      if (error) throw error;
      setVisitas(data || []);
    } catch (error) {
      console.error('Erro ao carregar visitas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLeads() {
    if (!user) return;

    const { data } = await supabase
      .from('leads')
      .select('id, nome')
      .eq('corretor_id', user.id)
      .order('nome');

    if (data) setLeads(data);
  }

  async function loadImoveis() {
    if (!user) return;

    const { data } = await supabase
      .from('imoveis')
      .select('id, titulo')
      .eq('user_id', user.id)
      .eq('status', 'ativo')
      .order('titulo');

    if (data) setImoveis(data);
  }

  function getStartDate() {
    const date = new Date(currentDate);
    if (viewMode === 'day') {
      date.setHours(0, 0, 0, 0);
    } else if (viewMode === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
    } else {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }
    return date;
  }

  function getEndDate() {
    const date = new Date(currentDate);
    if (viewMode === 'day') {
      date.setHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day + 6);
      date.setHours(23, 59, 59, 999);
    } else {
      date.setMonth(date.getMonth() + 1, 0);
      date.setHours(23, 59, 59, 999);
    }
    return date;
  }

  function handlePrevious() {
    const date = new Date(currentDate);
    if (viewMode === 'day') {
      date.setDate(date.getDate() - 1);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() - 7);
    } else {
      date.setMonth(date.getMonth() - 1);
    }
    setCurrentDate(date);
  }

  function handleNext() {
    const date = new Date(currentDate);
    if (viewMode === 'day') {
      date.setDate(date.getDate() + 1);
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    setCurrentDate(date);
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      const visitaData = {
        ...formData,
        corretor_id: user.id,
        lead_id: formData.lead_id || null,
        imovel_id: formData.imovel_id || null
      };

      if (editingVisita) {
        const { error } = await supabase
          .from('visitas')
          .update(visitaData)
          .eq('id', editingVisita.id);

        if (error) throw error;
        showToast('Visita atualizada com sucesso!', 'success');
      } else {
        const { error } = await supabase
          .from('visitas')
          .insert(visitaData);

        if (error) throw error;
        showToast('Visita agendada com sucesso!', 'success');
      }

      await loadVisitas();
      handleCloseModal();
    } catch (error: any) {
      console.error('Erro ao salvar visita:', error);
      showToast(error.message || 'Erro ao salvar visita', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir esta visita?')) return;

    try {
      const { error } = await supabase
        .from('visitas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Visita excluída com sucesso!', 'success');
      await loadVisitas();
    } catch (error) {
      console.error('Erro ao excluir visita:', error);
      showToast('Erro ao excluir visita', 'error');
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('visitas')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      showToast('Status atualizado!', 'success');
      await loadVisitas();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    }
  }

  function handleOpenModal(visita?: Visita) {
    if (visita) {
      setEditingVisita(visita);
      setFormData({
        titulo: visita.titulo,
        descricao: visita.descricao || '',
        data_hora: visita.data_hora.slice(0, 16),
        status: visita.status,
        local: visita.local || '',
        duracao_minutos: visita.duracao_minutos,
        lead_id: visita.lead_id || '',
        imovel_id: visita.imovel_id || ''
      });
    } else {
      setEditingVisita(null);
      const now = new Date();
      now.setMinutes(0);
      setFormData({
        titulo: '',
        descricao: '',
        data_hora: now.toISOString().slice(0, 16),
        status: 'agendado',
        local: '',
        duracao_minutos: 60,
        lead_id: '',
        imovel_id: ''
      });
    }
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingVisita(null);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-700';
      case 'confirmado':
        return 'bg-green-100 text-green-700';
      case 'realizado':
        return 'bg-purple-100 text-purple-700';
      case 'cancelado':
        return 'bg-red-100 text-red-700';
      case 'remarcado':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando agenda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Agenda de Visitas</h1>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Visita
            </button>
          </div>

          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Hoje
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="ml-4 text-lg font-semibold text-gray-800">
                {currentDate.toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'day'
                    ? 'bg-[#C8102E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-[#C8102E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-[#C8102E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mês
              </button>
            </div>
          </div>

          {visitas.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma visita agendada</p>
              <p className="text-gray-400 text-sm mb-4">Comece agendando sua primeira visita</p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agendar Visita
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {visitas.map((visita) => (
                <div
                  key={visita.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(visita.status)}`}>
                          {visita.status.charAt(0).toUpperCase() + visita.status.slice(1)}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{visita.titulo}</h3>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#C8102E]" />
                          <span>
                            {formatDate(visita.data_hora)} às {formatTime(visita.data_hora)} ({visita.duracao_minutos} min)
                          </span>
                        </div>

                        {visita.local && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#C8102E]" />
                            <span>{visita.local}</span>
                          </div>
                        )}

                        {visita.leads && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#C8102E]" />
                            <span>Cliente: {visita.leads.nome}</span>
                          </div>
                        )}

                        {visita.imoveis && (
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-[#C8102E]" />
                            <span>Imóvel: {visita.imoveis.titulo}</span>
                          </div>
                        )}

                        {visita.descricao && (
                          <p className="mt-2 text-gray-700">{visita.descricao}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {visita.status === 'agendado' && (
                        <button
                          onClick={() => handleStatusChange(visita.id, 'confirmado')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Confirmar"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      {(visita.status === 'agendado' || visita.status === 'confirmado') && (
                        <button
                          onClick={() => handleStatusChange(visita.id, 'realizado')}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Marcar como realizado"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(visita)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(visita.id, 'cancelado')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(visita.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingVisita ? 'Editar Visita' : 'Nova Visita'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  placeholder="Visita ao apartamento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data_hora}
                    onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    value={formData.duracao_minutos}
                    onChange={(e) => setFormData({ ...formData, duracao_minutos: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local
                </label>
                <input
                  type="text"
                  value={formData.local}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  placeholder="Endereço do imóvel..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente (Lead)
                  </label>
                  <select
                    value={formData.lead_id}
                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  >
                    <option value="">Selecione um cliente</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>{lead.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imóvel
                  </label>
                  <select
                    value={formData.imovel_id}
                    onChange={(e) => setFormData({ ...formData, imovel_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  >
                    <option value="">Selecione um imóvel</option>
                    {imoveis.map((imovel) => (
                      <option key={imovel.id} value={imovel.id}>{imovel.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                >
                  <option value="agendado">Agendado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="realizado">Realizado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="remarcado">Remarcado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição/Notas
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] resize-none"
                  placeholder="Observações sobre a visita..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
                >
                  {editingVisita ? 'Atualizar' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
