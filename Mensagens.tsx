import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Send, Search, User, Clock, CheckCheck } from 'lucide-react';
import { useToast } from '../components/ToastContainer';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Contact {
  id: string;
  full_name: string;
  email: string;
  lastMessage?: string;
  unreadCount: number;
}

export function Mensagens() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
      markAsRead(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadContacts() {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', user!.id);

      if (profiles) {
        const contactsWithMessages = await Promise.all(
          profiles.map(async (contact) => {
            const { data: msgs } = await supabase
              .from('messages')
              .select('content')
              .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${contact.id}),and(sender_id.eq.${contact.id},receiver_id.eq.${user!.id})`)
              .order('created_at', { ascending: false })
              .limit(1);

            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', contact.id)
              .eq('receiver_id', user!.id)
              .eq('read', false);

            return {
              ...contact,
              lastMessage: msgs?.[0]?.content || '',
              unreadCount: count || 0
            };
          })
        );

        setContacts(contactsWithMessages);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(contactId: string) {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user!.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }

  async function markAsRead(contactId: string) {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', contactId)
        .eq('receiver_id', user!.id)
        .eq('read', false);

      setContacts(prev =>
        prev.map(c =>
          c.id === contactId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user!.id,
          receiver_id: selectedContact.id,
          content: newMessage,
          read: false
        }]);

      if (error) throw error;

      setNewMessage('');
      loadMessages(selectedContact.id);
      loadContacts();
      showToast('Mensagem enviada!', 'success');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem', 'error');
    }
  }

  const filteredContacts = contacts.filter(c =>
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mensagens...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mensagens</h1>
          <p className="text-gray-600">Converse com sua equipe</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="grid grid-cols-12 h-full">
            <div className="col-span-12 md:col-span-4 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar contato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Nenhum contato encontrado</p>
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                        selectedContact?.id === contact.id ? 'bg-blue-50 border-l-4 border-l-[#C8102E]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-800">{contact.full_name}</h3>
                        {contact.unreadCount > 0 && (
                          <span className="bg-[#C8102E] text-white text-xs px-2 py-1 rounded-full">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.email}</p>
                      {contact.lastMessage && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{contact.lastMessage}</p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="col-span-12 md:col-span-8 flex flex-col">
              {selectedContact ? (
                <>
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C8102E] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{selectedContact.full_name}</h3>
                        <p className="text-xs text-gray-600">{selectedContact.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <p>Nenhuma mensagem ainda</p>
                        <p className="text-sm mt-1">Envie a primeira mensagem!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isSent = message.sender_id === user!.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isSent
                                  ? 'bg-[#C8102E] text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${
                                isSent ? 'text-red-100' : 'text-gray-500'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span>
                                  {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {isSent && message.read && (
                                  <CheckCheck className="w-3 h-3 ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-6 py-2 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Enviar
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">Selecione um contato</p>
                    <p className="text-sm">Escolha uma conversa à esquerda para começar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
