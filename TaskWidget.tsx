import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, X, Calendar, AlertCircle, ChevronDown } from 'lucide-react';
import { useToast } from './ToastContainer';

interface Task {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  data_vencimento: string | null;
  imovel_id: string | null;
  lead_id: string | null;
  created_at: string;
}

export function TaskWidget() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendente' | 'concluida'>('all');
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media' as const,
    data_vencimento: ''
  });

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  async function loadTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .order('data_vencimento', { ascending: true, nullsFirst: false })
        .order('prioridade', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          titulo: formData.titulo,
          descricao: formData.descricao,
          prioridade: formData.prioridade,
          data_vencimento: formData.data_vencimento || null,
          status: 'pendente'
        }]);

      if (error) throw error;

      showToast('Tarefa criada com sucesso!', 'success');
      setShowAddModal(false);
      setFormData({
        titulo: '',
        descricao: '',
        prioridade: 'media',
        data_vencimento: ''
      });
      await loadTasks();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      showToast('Erro ao criar tarefa', 'error');
    }
  }

  async function toggleTaskStatus(taskId: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'concluida' ? 'pendente' : 'concluida';
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      await loadTasks();
      showToast(newStatus === 'concluida' ? 'Tarefa concluída!' : 'Tarefa reaberta', 'success');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      showToast('Erro ao atualizar tarefa', 'error');
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await loadTasks();
      showToast('Tarefa excluída!', 'success');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      showToast('Erro ao excluir tarefa', 'error');
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return task.status !== 'cancelada';
    return task.status === filterStatus;
  });

  const prioridadeColors = {
    baixa: 'bg-green-100 text-green-700',
    media: 'bg-blue-100 text-blue-700',
    alta: 'bg-orange-100 text-orange-700',
    urgente: 'bg-red-100 text-red-700'
  };

  const isOverdue = (dataVencimento: string | null) => {
    if (!dataVencimento) return false;
    return new Date(dataVencimento) < new Date();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Minhas Tarefas</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-2 bg-[#C8102E] text-white rounded-lg text-sm font-semibold hover:bg-[#A00D25] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'all' ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas ({tasks.filter(t => t.status !== 'cancelada').length})
        </button>
        <button
          onClick={() => setFilterStatus('pendente')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'pendente' ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pendentes ({tasks.filter(t => t.status === 'pendente' || t.status === 'em_andamento').length})
        </button>
        <button
          onClick={() => setFilterStatus('concluida')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'concluida' ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Concluídas ({tasks.filter(t => t.status === 'concluida').length})
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`border rounded-lg p-3 hover:shadow-md transition-shadow ${
                task.status === 'concluida' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.status === 'concluida'
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-[#C8102E]'
                  }`}
                >
                  {task.status === 'concluida' && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-gray-800 ${
                    task.status === 'concluida' ? 'line-through' : ''
                  }`}>
                    {task.titulo}
                  </h4>
                  {task.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{task.descricao}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${prioridadeColors[task.prioridade]}`}>
                      {task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}
                    </span>
                    {task.data_vencimento && (
                      <span className={`text-xs flex items-center gap-1 ${
                        isOverdue(task.data_vencimento) && task.status !== 'concluida'
                          ? 'text-red-600 font-semibold'
                          : 'text-gray-600'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Nova Tarefa</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={formData.prioridade}
                  onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
