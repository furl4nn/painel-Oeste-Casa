import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { FunnelChart } from '../components/FunnelChart';
import { PieChart } from '../components/PieChart';
import { BarChart } from '../components/BarChart';
import { Navbar } from '../components/Navbar';
import { TaskWidget } from '../components/TaskWidget';
import { PropertyImage } from '../components/PropertyImage';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { supabase, Imovel } from '../lib/supabase';
import { useToast } from '../components/ToastContainer';
import {
  MessageSquare,
  Home,
  TrendingUp,
  MousePointerClick,
  MapPin,
  BarChart3,
  Save,
  Users,
  DollarSign,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface Lead {
  id: string;
  status: string;
  created_at: string;
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imoveisPrevious, setImoveisPrevious] = useState<Imovel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsPrevious, setLeadsPrevious] = useState<Lead[]>([]);
  const [visitasHoje, setVisitasHoje] = useState<any[]>([]);
  const [followUpsHoje, setFollowUpsHoje] = useState<any[]>([]);
  const [anotacaoTexto, setAnotacaoTexto] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const [imoveisRes, imoveisPrevRes, leadsRes, leadsPrevRes, visitasRes, followUpsRes] = await Promise.all([
        supabase
          .from('imoveis')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('imoveis')
          .select('*')
          .eq('user_id', user!.id)
          .gte('created_at', previousMonthStart.toISOString())
          .lte('created_at', previousMonthEnd.toISOString()),
        supabase
          .from('leads')
          .select('id, status, created_at')
          .eq('corretor_id', user!.id),
        supabase
          .from('leads')
          .select('id, status, created_at')
          .eq('corretor_id', user!.id)
          .gte('created_at', previousMonthStart.toISOString())
          .lte('created_at', previousMonthEnd.toISOString()),
        supabase
          .from('visitas')
          .select(`
            *,
            leads(nome),
            imoveis(titulo)
          `)
          .eq('corretor_id', user!.id)
          .gte('data_hora', todayStart.toISOString())
          .lte('data_hora', todayEnd.toISOString())
          .order('data_hora', { ascending: true }),
        supabase
          .from('follow_ups')
          .select(`
            *,
            leads(nome, telefone)
          `)
          .eq('corretor_id', user!.id)
          .gte('data_agendada', todayStart.toISOString())
          .lte('data_agendada', todayEnd.toISOString())
          .eq('status', 'pendente')
          .order('data_agendada', { ascending: true })
      ]);

      if (imoveisRes.data) setImoveis(imoveisRes.data);
      if (imoveisPrevRes.data) setImoveisPrevious(imoveisPrevRes.data);
      if (leadsRes.data) setLeads(leadsRes.data);
      if (leadsPrevRes.data) setLeadsPrevious(leadsPrevRes.data);
      if (visitasRes.data) setVisitasHoje(visitasRes.data);
      if (followUpsRes.data) setFollowUpsHoje(followUpsRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveAnotacao() {
    localStorage.setItem(`anotacao_${user!.id}`, anotacaoTexto);
    showToast('Anota\u00e7\u00e3o salva!', 'success');
  }

  useEffect(() => {
    if (user) {
      const savedNote = localStorage.getItem(`anotacao_${user.id}`);
      if (savedNote) setAnotacaoTexto(savedNote);
    }
  }, [user]);

  const tiposImoveis = imoveis.reduce((acc, imovel) => {
    acc[imovel.tipo] = (acc[imovel.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(tiposImoveis).map(([tipo, count], index) => ({
    label: tipo,
    value: count,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]
  }));

  const clicksData = imoveis.slice(0, 5).map(imovel => ({
    label: imovel.titulo.substring(0, 20),
    value: imovel.views
  }));

  const bairrosValores = imoveis.reduce((acc, imovel) => {
    if (!acc[imovel.bairro]) {
      acc[imovel.bairro] = { total: 0, count: 0 };
    }
    acc[imovel.bairro].total += Number(imovel.preco);
    acc[imovel.bairro].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const valorPorBairro = Object.entries(bairrosValores)
    .map(([bairro, data]) => ({
      label: bairro,
      value: Math.round(data.total / data.count)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const leadsNovo = leads.filter(l => l.status === 'Novo').length;
  const leadsEmAtendimento = leads.filter(l => l.status === 'Em Atendimento').length;
  const leadsQualificado = leads.filter(l => l.status === 'Qualificado').length;
  const leadsConvertido = leads.filter(l => l.status === 'Convertido').length;
  const leadsPerdido = leads.filter(l => l.status === 'Perdido').length;

  const funnelData = {
    contato: leadsNovo,
    visita: leadsEmAtendimento,
    proposta: leadsQualificado,
    negociacao: Math.max(leadsQualificado - Math.floor(leadsQualificado / 3), 0),
    fechado: leadsConvertido,
    perdidos: leadsPerdido,
    ativos: leadsNovo + leadsEmAtendimento + leadsQualificado
  };

  const currentMonthLeads = leads.length;
  const previousMonthLeads = leadsPrevious.length;
  const leadsGrowth = previousMonthLeads > 0
    ? ((currentMonthLeads - previousMonthLeads) / previousMonthLeads * 100).toFixed(0)
    : 0;

  const currentMonthImoveis = imoveis.length;
  const previousMonthImoveis = imoveisPrevious.length;
  const imoveisGrowth = previousMonthImoveis > 0
    ? ((currentMonthImoveis - previousMonthImoveis) / previousMonthImoveis * 100).toFixed(0)
    : 0;

  const currentMonthConversions = leads.filter(l => l.status === 'Convertido').length;
  const previousMonthConversions = leadsPrevious.filter(l => l.status === 'Convertido').length;
  const conversionsGrowth = previousMonthConversions > 0
    ? ((currentMonthConversions - previousMonthConversions) / previousMonthConversions * 100).toFixed(0)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-gray-900">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Leads"
            value={currentMonthLeads}
            change={Number(leadsGrowth)}
            trend={Number(leadsGrowth) > 0 ? 'up' : Number(leadsGrowth) < 0 ? 'down' : undefined}
            icon={Users}
            iconColor="#3B82F6"
          />

          <StatCard
            title="Total de Imóveis"
            value={currentMonthImoveis}
            change={Number(imoveisGrowth)}
            trend={Number(imoveisGrowth) > 0 ? 'up' : Number(imoveisGrowth) < 0 ? 'down' : undefined}
            icon={Home}
            iconColor="#10B981"
          />

          <StatCard
            title="Conversões"
            value={currentMonthConversions}
            change={Number(conversionsGrowth)}
            trend={Number(conversionsGrowth) > 0 ? 'up' : Number(conversionsGrowth) < 0 ? 'down' : undefined}
            icon={TrendingUp}
            iconColor="#C8102E"
          />

          <StatCard
            title="Taxa de Conversão"
            value={currentMonthLeads > 0 ? `${((currentMonthConversions / currentMonthLeads) * 100).toFixed(1)}%` : '0%'}
            icon={BarChart3}
            iconColor="#8B5CF6"
          />
        </div>

        {visitasHoje.length > 0 && (
          <Card title="Visitas Agendadas Hoje" className="mb-6">
            <div className="space-y-3">
              {visitasHoje.map((visita) => (
                <div key={visita.id} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {visita.imoveis?.titulo || 'Imóvel não especificado'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {visita.leads?.nome || 'Cliente'} • {new Date(visita.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    visita.status === 'confirmado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    visita.status === 'agendado' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {visita.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {followUpsHoje.length > 0 && (
          <Card title="Follow-ups Pendentes Hoje" className="mb-6">
            <div className="space-y-3">
              {followUpsHoje.map((followUp) => (
                <div key={followUp.id} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {followUp.leads?.nome || 'Lead'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {followUp.tipo.replace('_', ' ')} • {new Date(followUp.data_agendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {followUp.observacoes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{followUp.observacoes}</p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      await supabase
                        .from('follow_ups')
                        .update({ status: 'concluido', concluido_em: new Date().toISOString() })
                        .eq('id', followUp.id);
                      loadDashboardData();
                      showToast('Follow-up concluído!', 'success');
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Concluir
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
<Card title="Estatísticas Rápidas">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total de Imóveis</p>
                  <p className="text-2xl font-bold text-blue-700">{imoveis.length}</p>
                </div>
                <Home className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Imóveis Ativos</p>
                  <p className="text-2xl font-bold text-green-700">
                    {imoveis.filter(i => i.status === 'ativo').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Vendidos</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {imoveis.filter(i => i.status === 'vendido').length}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card title="Anotações Pessoais">
            <div className="space-y-3">
              <textarea
                value={anotacaoTexto}
                onChange={(e) => setAnotacaoTexto(e.target.value)}
                placeholder="Digite suas anotações aqui..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8102E] resize-none"
              />
              <button
                onClick={saveAnotacao}
                className="w-full bg-[#C8102E] text-white py-2 rounded-lg font-semibold hover:bg-[#A00D25] transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            </div>
          </Card>

          <TaskWidget />

          <Card title="Catálogo de Imóveis" className="xl:col-span-2">
            <div className="space-y-3">
              {imoveis.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Home className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg mb-2">Nenhum imóvel cadastrado</p>
                  <p className="text-sm">Comece adicionando seus primeiros imóveis</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imoveis.slice(0, 4).map((imovel) => (
                    <div key={imovel.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <PropertyImage
                        imovelId={imovel.id}
                        className="h-32 w-full"
                        alt={imovel.titulo}
                      />
                      <div className="p-4">
                        <h5 className="font-semibold text-gray-800 mb-1">{imovel.titulo}</h5>
                        <p className="text-sm text-gray-600 mb-2">{imovel.bairro}, {imovel.cidade}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-[#C8102E]">
                            R$ {Number(imovel.preco).toLocaleString('pt-BR')}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {imovel.tipo}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="Negócios Funil">
            <FunnelChart data={funnelData} />
          </Card>

          <Card title="Imóveis por Cidade">
            {imoveis.length > 0 ? (
              <div className="space-y-2">
                {Object.entries(
                  imoveis.reduce((acc, imovel) => {
                    acc[imovel.cidade] = (acc[imovel.cidade] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([cidade, count]) => (
                    <div key={cidade} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#C8102E]" />
                        <span className="font-medium text-gray-800">{cidade}</span>
                      </div>
                      <span className="text-sm font-bold text-[#C8102E]">{count} imóveis</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum imóvel cadastrado</p>
              </div>
            )}
          </Card>

          <Card title="Cliques dos Imóveis">
            {clicksData.length > 0 ? (
              <BarChart data={clicksData} color="#C8102E" />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MousePointerClick className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Sem dados de visualizações</p>
              </div>
            )}
          </Card>

          <Card title="Tipos de Imóveis">
            {pieData.length > 0 ? (
              <PieChart data={pieData} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Sem dados para exibir</p>
              </div>
            )}
          </Card>

          <Card title="Valor por Bairro" className="xl:col-span-2">
            {valorPorBairro.length > 0 ? (
              <BarChart data={valorPorBairro} color="#1A1A1A" valuePrefix="R$ " />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Sem dados para exibir</p>
              </div>
            )}
          </Card>

<Card title="Radar de Negócios" className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imoveis.slice(0, 4).map((imovel) => (
                <div key={imovel.id} className="p-4 border border-gray-200 rounded-lg hover:border-[#C8102E] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 mb-1">{imovel.titulo}</h5>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{imovel.bairro}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      {imovel.tipo}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-[#C8102E]">
                    R$ {Number(imovel.preco).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
