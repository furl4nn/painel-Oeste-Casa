import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Bell, Check, Trash2, Filter, X } from 'lucide-react';
import { useToast } from '../components/ToastContainer';

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  link: string | null;
  lida: boolean;
  created_at: string;
  read_at: string | null;
}

export function Notificacoes() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'nao-lidas' | 'lidas'>('todas');

  useEffect(() => {
    if (user) {
      loadNotificacoes();
    }
  }, [user]);

  async function loadNotificacoes() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('corretor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotificacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoLida(id: string) {
    try {
      await supabase
        .from('notificacoes')
        .update({ lida: true, read_at: new Date().toISOString() })
        .eq('id', id);

      await loadNotificacoes();
      showToast('Notificação marcada como lida', 'success');
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      showToast('Erro ao marcar notificação', 'error');
    }
  }

  async function marcarTodasComoLidas() {
    if (!user) return;

    try {
      await supabase
        .from('notificacoes')
        .update({ lida: true, read_at: new Date().toISOString() })
        .eq('corretor_id', user.id)
        .eq('lida', false);

      await loadNotificacoes();
      showToast('Todas as notificações foram marcadas como lidas', 'success');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      showToast('Erro ao marcar notificações', 'error');
    }
  }

  async function deletarNotificacao(id: string) {
    try {
      await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);

      await loadNotificacoes();
      showToast('Notificação excluída', 'success');
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      showToast('Erro ao excluir notificação', 'error');
    }
  }

  async function deletarTodasLidas() {
    if (!user || !confirm('Deseja realmente excluir todas as notificações lidas?')) return;

    try {
      await supabase
        .from('notificacoes')
        .delete()
        .eq('corretor_id', user.id)
        .eq('lida', true);

      await loadNotificacoes();
      showToast('Notificações lidas excluídas', 'success');
    } catch (error) {
      console.error('Erro ao deletar notificações:', error);
      showToast('Erro ao excluir notificações', 'error');
    }
  }

  function handleNotificationClick(notificacao: Notificacao) {
    if (!notificacao.lida) {
      marcarComoLida(notificacao.id);
    }

    if (notificacao.link) {
      window.location.href = notificacao.link;
    }
  }

  function getNotificationIcon(tipo: string) {
    switch (tipo) {
      case 'novo_lead':
        return '👤';
      case 'tarefa_vencendo':
      case 'tarefa_vencida':
        return '⏰';
      case 'imovel_views':
        return '👁️';
      case 'status_mudou':
        return '🔄';
      case 'follow_up_pendente':
        return '📞';
      default:
        return '📢';
    }
  }

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const notificacoesFiltradas = notificacoes.filter(n => {
    if (filter === 'nao-lidas') return !n.lida;
    if (filter === 'lidas') return n.lida;
    return true;
  });

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando notificações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Notificações</h1>
              {naoLidas > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {naoLidas} notificação{naoLidas > 1 ? 'ões' : ''} não lida{naoLidas > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={deletarTodasLidas}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpar lidas
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 pb-4 border-b">
            <Filter className="w-5 h-5 text-gray-600" />
            <button
              onClick={() => setFilter('todas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'todas'
                  ? 'bg-[#C8102E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({notificacoes.length})
            </button>
            <button
              onClick={() => setFilter('nao-lidas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'nao-lidas'
                  ? 'bg-[#C8102E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Não lidas ({naoLidas})
            </button>
            <button
              onClick={() => setFilter('lidas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'lidas'
                  ? 'bg-[#C8102E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lidas ({notificacoes.length - naoLidas})
            </button>
          </div>

          {notificacoesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma notificação encontrada</p>
              <p className="text-gray-400 text-sm">
                {filter === 'nao-lidas' && 'Você não tem notificações não lidas'}
                {filter === 'lidas' && 'Você não tem notificações lidas'}
                {filter === 'todas' && 'Você ainda não recebeu nenhuma notificação'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificacoesFiltradas.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                    !notificacao.lida ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notificacao.tipo)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-gray-900 mb-1 ${!notificacao.lida ? 'font-bold' : ''}`}>
                            {notificacao.titulo}
                          </h3>
                          <p className="text-gray-700">{notificacao.mensagem}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notificacao.lida && (
                            <button
                              onClick={() => marcarComoLida(notificacao.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Marcar como lida"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deletarNotificacao(notificacao.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(notificacao.created_at)}
                        </span>
                        {!notificacao.lida && (
                          <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            Nova
                          </span>
                        )}
                      </div>
                      {notificacao.link && (
                        <button
                          onClick={() => handleNotificationClick(notificacao)}
                          className="mt-3 text-sm text-[#C8102E] hover:text-[#A00D25] font-medium"
                        >
                          Ver detalhes →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
