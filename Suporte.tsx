import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Send,
  FileText,
  Video,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export function Suporte() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket' | 'recursos'>('faq');

  const faqs: FAQ[] = [
    {
      category: 'Imóveis',
      question: 'Como cadastro um novo imóvel?',
      answer: 'Para cadastrar um novo imóvel, clique no menu "Cadastrar Imóvel", preencha todos os campos obrigatórios como tipo, endereço, valor e características. Você também pode adicionar fotos e uma descrição detalhada para tornar o anúncio mais atrativo.'
    },
    {
      category: 'Imóveis',
      question: 'Como edito um imóvel já cadastrado?',
      answer: 'Acesse a página "Perfil" onde estão listados todos os seus imóveis. Clique no botão "Editar" do imóvel desejado. Você será redirecionado para o formulário com todos os dados preenchidos e poderá fazer as alterações necessárias.'
    },
    {
      category: 'Imóveis',
      question: 'Posso adicionar múltiplas fotos a um imóvel?',
      answer: 'Sim! Você pode adicionar uma foto de destaque e uma galeria com múltiplas fotos. A foto de destaque é a principal que aparecerá nos resultados de busca, enquanto a galeria permite mostrar diferentes ângulos e ambientes do imóvel.'
    },
    {
      category: 'CRM',
      question: 'Como funciona o sistema de leads?',
      answer: 'O sistema de CRM permite gerenciar todos os seus leads (potenciais clientes). Você pode adicionar novos leads manualmente, acompanhar o status de cada um, fazer anotações e vinculá-los a imóveis específicos de interesse.'
    },
    {
      category: 'CRM',
      question: 'Quais são os status disponíveis para leads?',
      answer: 'Os status disponíveis são: Novo (lead recém-adicionado), Em Atendimento (você está conversando com o lead), Qualificado (lead demonstrou interesse real), Convertido (lead virou cliente), e Perdido (lead não teve interesse ou desistiu).'
    },
    {
      category: 'Relatórios',
      question: 'Como visualizo relatórios de vendas?',
      answer: 'Acesse a página "Relatórios" no menu principal. Lá você encontrará estatísticas detalhadas sobre seus imóveis, leads, taxa de conversão e faturamento. Você pode filtrar os dados por período (semana, mês ou ano).'
    },
    {
      category: 'Relatórios',
      question: 'Posso exportar os relatórios?',
      answer: 'Sim! Na página de relatórios há um botão "Exportar" que permite baixar os dados em formato PDF ou Excel para análise offline ou compartilhamento com sua equipe.'
    },
    {
      category: 'Conta',
      question: 'Como altero minha senha?',
      answer: 'Acesse a página "Perfil" no menu, role até a seção de segurança e clique em "Alterar Senha". Você precisará informar a senha atual e definir uma nova senha (mínimo 6 caracteres).'
    },
    {
      category: 'Conta',
      question: 'Como atualizo meus dados pessoais?',
      answer: 'Na página "Perfil", você pode atualizar seu nome completo, telefone e outras informações. Clique em "Salvar" após fazer as alterações para que sejam aplicadas.'
    },
    {
      category: 'Busca',
      question: 'Como funciona a busca global?',
      answer: 'A busca global está disponível na barra superior. Digite qualquer termo relacionado a imóveis (endereço, bairro, cidade) ou leads (nome, email, telefone) e os resultados aparecerão instantaneamente. Clique no resultado desejado para acessá-lo diretamente.'
    }
  ];

  const recursos = [
    {
      icon: Video,
      title: 'Tutoriais em Vídeo',
      description: 'Assista tutoriais práticos sobre como usar cada funcionalidade',
      link: '#'
    },
    {
      icon: FileText,
      title: 'Documentação Completa',
      description: 'Acesse a documentação detalhada com guias passo a passo',
      link: '#'
    },
    {
      icon: Book,
      title: 'Base de Conhecimento',
      description: 'Artigos e dicas sobre gestão imobiliária e vendas',
      link: '#'
    }
  ];

  const categories = Array.from(new Set(faqs.map(f => f.category)));

  async function handleSubmitTicket(e: React.FormEvent) {
    e.preventDefault();

    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      showToast('Preencha todos os campos', 'warning');
      return;
    }

    showToast('Ticket enviado com sucesso! Responderemos em breve.', 'success');
    setTicketSubject('');
    setTicketMessage('');
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Central de Suporte</h1>
          <p className="text-gray-600">Estamos aqui para ajudar você</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="mailto:suporte@oestecasa.com.br"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Email</h3>
                <p className="text-sm text-gray-600">suporte@oestecasa.com.br</p>
              </div>
            </div>
          </a>

          <a
            href="tel:+5511999999999"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Telefone</h3>
                <p className="text-sm text-gray-600">(11) 99999-9999</p>
              </div>
            </div>
          </a>

          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">WhatsApp</h3>
                <p className="text-sm text-gray-600">Chat ao vivo</p>
              </div>
            </div>
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
                  activeTab === 'faq'
                    ? 'text-[#C8102E] border-b-2 border-[#C8102E]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <HelpCircle className="w-5 h-5 inline mr-2" />
                Perguntas Frequentes
              </button>
              <button
                onClick={() => setActiveTab('ticket')}
                className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
                  activeTab === 'ticket'
                    ? 'text-[#C8102E] border-b-2 border-[#C8102E]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Send className="w-5 h-5 inline mr-2" />
                Abrir Ticket
              </button>
              <button
                onClick={() => setActiveTab('recursos')}
                className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
                  activeTab === 'recursos'
                    ? 'text-[#C8102E] border-b-2 border-[#C8102E]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Book className="w-5 h-5 inline mr-2" />
                Recursos
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'faq' && (
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{category}</h3>
                    <div className="space-y-3">
                      {faqs
                        .filter((faq) => faq.category === category)
                        .map((faq, index) => {
                          const globalIndex = faqs.indexOf(faq);
                          return (
                            <div
                              key={globalIndex}
                              className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                              <button
                                onClick={() =>
                                  setExpandedFAQ(expandedFAQ === globalIndex ? null : globalIndex)
                                }
                                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                              >
                                <span className="font-medium text-gray-800">{faq.question}</span>
                                {expandedFAQ === globalIndex ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                              </button>
                              {expandedFAQ === globalIndex && (
                                <div className="px-4 py-3 bg-gray-50 border-t">
                                  <p className="text-gray-700">{faq.answer}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'ticket' && (
              <form onSubmit={handleSubmitTicket} className="max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Abrir Ticket de Suporte</h3>
                  <p className="text-gray-600">
                    Descreva seu problema e nossa equipe entrará em contato
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assunto</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Ex: Erro ao cadastrar imóvel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Descreva detalhadamente o problema..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Ticket
                </button>
              </form>
            )}

            {activeTab === 'recursos' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recursos.map((recurso, index) => (
                  <a
                    key={index}
                    href={recurso.link}
                    className="border border-gray-200 rounded-lg p-6 hover:border-[#C8102E] hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-50 transition-colors">
                      <recurso.icon className="w-6 h-6 text-gray-600 group-hover:text-[#C8102E]" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      {recurso.title}
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </h3>
                    <p className="text-sm text-gray-600">{recurso.description}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Não encontrou o que procura?</h3>
              <p className="text-gray-700 mb-4">
                Nossa equipe está disponível de segunda a sexta, das 9h às 18h para atendê-lo.
                Entre em contato por email, telefone ou WhatsApp.
              </p>
              <p className="text-sm text-gray-600">
                Tempo médio de resposta: <strong>2 horas úteis</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
