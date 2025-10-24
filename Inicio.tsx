import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ImovelImagemDestaque } from '../components/ImovelImagemDestaque';
import { useAuth } from '../context/AuthContext';
import { supabase, Imovel } from '../lib/supabase';
import {
  Home,
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  Plus,
  Eye,
  Calendar,
  Award,
  ArrowRight
} from 'lucide-react';

interface Lead {
  id: string;
  nome: string;
  status: string;
  created_at: string;
}

export function Inicio() {
  const { user, profile } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      const [imoveisRes, leadsRes] = await Promise.all([
        supabase
          .from('imoveis')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('leads')
          .select('*')
          .eq('corretor_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (imoveisRes.data) setImoveis(imoveisRes.data);
      if (leadsRes.data) setLeads(leadsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const totalImoveis = imoveis.length;
  const totalLeads = leads.length;
  const imoveisAtivos = imoveis.filter(i => i.status === 'ativo').length;
  const leadsNovos = leads.filter(l => l.status === 'Novo').length;

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Aqui está um resumo das suas atividades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Imóveis</p>
                <p className="text-3xl font-bold text-gray-800">{totalImoveis}</p>
                <p className="text-xs text-green-600 mt-1">+{imoveisAtivos} ativos</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Leads</p>
                <p className="text-3xl font-bold text-gray-800">{totalLeads}</p>
                <p className="text-xs text-green-600 mt-1">+{leadsNovos} novos</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Vendidos</p>
                <p className="text-3xl font-bold text-gray-800">
                  {imoveis.filter(i => i.status === 'vendido').length}
                </p>
                <p className="text-xs text-purple-600 mt-1">Este mês</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Visualizações</p>
                <p className="text-3xl font-bold text-gray-800">
                  {imoveis.reduce((acc, i) => acc + (i.views || 0), 0)}
                </p>
                <p className="text-xs text-red-600 mt-1">Total</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Imóveis Recentes</h2>
              <a
                href="#perfil"
                className="text-[#C8102E] hover:text-[#A00D25] font-semibold flex items-center gap-1 text-sm"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {imoveis.length === 0 ? (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Você ainda não cadastrou nenhum imóvel</p>
                <a
                  href="#cadastrar-imovel"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8102E] text-white rounded-lg font-semibold hover:bg-[#A00D25] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Cadastrar Primeiro Imóvel
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {imoveis.map((imovel) => (
                  <div key={imovel.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#C8102E] transition-colors">
                    <ImovelImagemDestaque imovelId={imovel.id} className="w-20 h-20" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{imovel.titulo}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{imovel.bairro}, {imovel.cidade}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          imovel.status === 'ativo' ? 'bg-green-100 text-green-700' :
                          imovel.status === 'vendido' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {imovel.status}
                        </span>
                        <span className="text-xs text-gray-500">{imovel.tipo}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-bold text-[#C8102E]">
                        R$ {Number(imovel.preco).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        <Eye className="w-3 h-3 inline mr-1" />
                        {imovel.views || 0} views
                      </p>
                      <a
                        href={`#cadastrar-imovel?edit=${imovel.id}`}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors inline-block"
                      >
                        Editar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Leads Recentes</h2>
              <a
                href="#crm"
                className="text-[#C8102E] hover:text-[#A00D25] font-semibold text-sm"
              >
                Ver todos
              </a>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">Nenhum lead ainda</p>
                <a
                  href="#crm"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8102E] text-white rounded-lg text-sm font-semibold hover:bg-[#A00D25] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Lead
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-3 border border-gray-200 rounded-lg hover:border-[#C8102E] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm">{lead.nome}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === 'Novo' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'Em Atendimento' ? 'bg-yellow-100 text-yellow-700' :
                        lead.status === 'Qualificado' ? 'bg-green-100 text-green-700' :
                        lead.status === 'Convertido' ? 'bg-green-200 text-green-800' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="#cadastrar-imovel"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Cadastrar Imóvel</h3>
              <Plus className="w-8 h-8" />
            </div>
            <p className="text-blue-100 text-sm">
              Adicione um novo imóvel ao seu portfólio
            </p>
          </a>

          <a
            href="#crm"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Gerenciar Leads</h3>
              <Users className="w-8 h-8" />
            </div>
            <p className="text-green-100 text-sm">
              Acompanhe e converta seus leads
            </p>
          </a>

          <a
            href="#dashboard"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Ver Dashboard</h3>
              <TrendingUp className="w-8 h-8" />
            </div>
            <p className="text-purple-100 text-sm">
              Análise completa de desempenho
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
