import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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

export function NotificationDropdown() {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadNotificacoes();

      const channel = supabase
        .channel('notificacoes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notificacoes',
            filter: `corretor_id=eq.${user.id}`
          },
          () => {
            loadNotificacoes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  async function loadNotificacoes() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('corretor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotificacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  }

  async function marcarComoLida(id: string) {
    try {
      await supabase
        .from('notificacoes')
        .update({ lida: true, read_at: new Date().toISOString() })
        .eq('id', id);

      await loadNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }

  async function marcarTodasComoLidas() {
    if (!user) return;

    setLoading(true);
    try {
      await supabase
        .from('notificacoes')
        .update({ lida: true, read_at: new Date().toISOString() })
        .eq('corretor_id', user.id)
        .eq('lida', false);

      await loadNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deletarNotificacao(id: string, event: React.MouseEvent) {
    event.stopPropagation();

    try {
      await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);

      await loadNotificacoes();
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  }

  function handleNotificationClick(notificacao: Notificacao) {
    if (!notificacao.lida) {
      marcarComoLida(notificacao.id);
    }

    if (notificacao.link) {
      window.location.href = notificacao.link;
    }

    setShowDropdown(false);
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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  }

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {naoLidas > 0 && (
          <span className="absolute top-0 right-0 bg-[#C8102E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Notificações</h3>
              {naoLidas > 0 && (
                <p className="text-xs text-gray-600">{naoLidas} não lida{naoLidas > 1 ? 's' : ''}</p>
              )}
            </div>
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                disabled={loading}
                className="text-xs text-[#C8102E] hover:text-[#A00D25] font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notificacoes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div>
                {notificacoes.map((notificacao) => (
                  <div
                    key={notificacao.id}
                    onClick={() => handleNotificationClick(notificacao)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notificacao.lida ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notificacao.tipo)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold text-gray-900 ${!notificacao.lida ? 'font-bold' : ''}`}>
                            {notificacao.titulo}
                          </h4>
                          <button
                            onClick={(e) => deletarNotificacao(notificacao.id, e)}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notificacao.mensagem}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notificacao.created_at)}
                          </span>
                          {!notificacao.lida && (
                            <span className="w-2 h-2 bg-[#C8102E] rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notificacoes.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  window.location.href = '#notificacoes';
                  setShowDropdown(false);
                }}
                className="text-sm text-[#C8102E] hover:text-[#A00D25] font-medium w-full text-center"
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
