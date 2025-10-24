import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Users,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { BarChart } from '../components/BarChart';
import { PieChart } from '../components/PieChart';
import { exportToPDF, exportToExcel } from '../lib/exportUtils';

interface Stats {
  totalImoveis: number;
  imoveisAtivos: number;
  imoveisVendidos: number;
  totalLeads: number;
  leadsConvertidos: number;
  taxaConversao: number;
  valorTotalVendas: number;
  valorMedioImovel: number;
}

export function Relatorios() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalImoveis: 0,
    imoveisAtivos: 0,
    imoveisVendidos: 0,
    totalLeads: 0,
    leadsConvertidos: 0,
    taxaConversao: 0,
    valorTotalVendas: 0,
    valorMedioImovel: 0
  });
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(true);
  const [vendasPorMes, setVendasPorMes] = useState<any[]>([]);
  const [leadsPorOrigem, setLeadsPorOrigem] = useState<any[]>([]);
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (user) {
      loadRelatorios();
    }
  }, [user, periodo]);

  async function loadRelatorios() {
    setLoading(true);
    try {
      const [imoveisRes, leadsRes] = await Promise.all([
        supabase
          .from('imoveis')
          .select('*')
          .eq('user_id', user!.id),
        supabase
          .from('leads')
          .select('*')
          .eq('corretor_id', user!.id)
      ]);

      const imoveisData = imoveisRes.data || [];
      const leadsData = leadsRes.data || [];

      setImoveis(imoveisData);
      setLeads(leadsData);

      const imoveisVendidos = imoveisData.filter(i => i.status === 'vendido');
      const leadsConvertidos = leadsData.filter(l => l.status === 'Convertido');

      const valorTotal = imoveisVendidos.reduce((acc, i) => acc + Number(i.preco), 0);
      const valorMedio = imoveisVendidos.length > 0 ? valorTotal / imoveisVendidos.length : 0;

      setStats({
        totalImoveis: imoveisData.length,
        imoveisAtivos: imoveisData.filter(i => i.status === 'ativo').length,
        imoveisVendidos: imoveisVendidos.length,
        totalLeads: leadsData.length,
        leadsConvertidos: leadsConvertidos.length,
        taxaConversao: leadsData.length > 0 ? (leadsConvertidos.length / leadsData.length) * 100 : 0,
        valorTotalVendas: valorTotal,
        valorMedioImovel: valorMedio
      });

      const vendasPorMesData = imoveisVendidos.reduce((acc: any, imovel) => {
        const mes = new Date(imovel.created_at).toLocaleDateString('pt-BR', { month: 'short' });
        acc[mes] = (acc[mes] || 0) + 1;
        return acc;
      }, {});

      setVendasPorMes(
        Object.entries(vendasPorMesData).map(([mes, count]) => ({
          label: mes,
          value: count as number
        }))
      );

      const leadsPorOrigemData = leadsData.reduce((acc: any, lead) => {
        const origem = lead.origem || 'Não informado';
        acc[origem] = (acc[origem] || 0) + 1;
        return acc;
      }, {});

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      setLeadsPorOrigem(
        Object.entries(leadsPorOrigemData).map(([origem, count], index) => ({
          label: origem,
          value: count as number,
          color: colors[index % colors.length]
        }))
      );
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando relatórios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB]">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Relatórios</h1>
            <p className="text-gray-600">Análise completa de desempenho</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
              <button
                onClick={() => setPeriodo('semana')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  periodo === 'semana'
                    ? 'bg-[#C8102E] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setPeriodo('mes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  periodo === 'mes'
                    ? 'bg-[#C8102E] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setPeriodo('ano')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  periodo === 'ano'
                    ? 'bg-[#C8102E] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Ano
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Exportar</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[160px]">
                  <button
                    onClick={() => {
                      exportToPDF(stats, vendasPorMes, leadsPorOrigem);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
                  >
                    Exportar PDF
                  </button>
                  <button
                    onClick={() => {
                      exportToExcel(stats, vendasPorMes, leadsPorOrigem, imoveis, leads);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
                  >
                    Exportar Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total de Imóveis</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalImoveis}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {stats.imoveisAtivos}
              </span>
              <span className="text-gray-600">ativos</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Vendidos</p>
                <p className="text-3xl font-bold text-gray-800">{stats.imoveisVendidos}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Este período</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Leads</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalLeads}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {stats.taxaConversao.toFixed(1)}%
              </span>
              <span className="text-gray-600">conversão</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Faturamento</p>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {(stats.valorTotalVendas / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">
                Média: R$ {(stats.valorMedioImovel / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Vendas por Mês</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            {vendasPorMes.length > 0 ? (
              <BarChart data={vendasPorMes} color="#C8102E" />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Nenhuma venda registrada ainda</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Leads por Origem</h2>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            {leadsPorOrigem.length > 0 ? (
              <PieChart data={leadsPorOrigem} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Nenhum lead registrado ainda</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Comparativo de Desempenho</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Taxa de Conversão</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.taxaConversao.toFixed(1)}%</p>
              <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(stats.taxaConversao, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Imóveis Ativos</span>
                <Home className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.imoveisAtivos}</p>
              <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{
                    width: `${
                      stats.totalImoveis > 0 ? (stats.imoveisAtivos / stats.totalImoveis) * 100 : 0
                    }%`
                  }}
                />
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Leads Convertidos</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.leadsConvertidos}</p>
              <div className="mt-3 h-2 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${
                      stats.totalLeads > 0 ? (stats.leadsConvertidos / stats.totalLeads) * 100 : 0
                    }%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
