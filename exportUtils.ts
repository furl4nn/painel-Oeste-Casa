import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportData {
  totalImoveis: number;
  imoveisAtivos: number;
  imoveisVendidos: number;
  totalLeads: number;
  leadsConvertidos: number;
  taxaConversao: number;
  valorTotalVendas: number;
  valorMedioImovel: number;
}

export function exportToPDF(stats: ReportData, vendasPorMes: any[], leadsPorOrigem: any[]) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setTextColor(200, 16, 46);
  doc.text('Oeste Casa - Relatório', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Resumo Geral', 14, 45);

  const summaryData = [
    ['Total de Imóveis', stats.totalImoveis.toString()],
    ['Imóveis Ativos', stats.imoveisAtivos.toString()],
    ['Imóveis Vendidos', stats.imoveisVendidos.toString()],
    ['Total de Leads', stats.totalLeads.toString()],
    ['Leads Convertidos', stats.leadsConvertidos.toString()],
    ['Taxa de Conversão', `${stats.taxaConversao.toFixed(1)}%`],
    ['Valor Total Vendas', `R$ ${stats.valorTotalVendas.toLocaleString('pt-BR')}`],
    ['Valor Médio Imóvel', `R$ ${stats.valorMedioImovel.toLocaleString('pt-BR')}`],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Métrica', 'Valor']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [200, 16, 46] },
  });

  let finalY = (doc as any).lastAutoTable.finalY || 50;

  if (vendasPorMes.length > 0) {
    doc.text('Vendas por Mês', 14, finalY + 15);

    const vendasData = vendasPorMes.map(item => [item.label, item.value.toString()]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Mês', 'Quantidade']],
      body: vendasData,
      theme: 'grid',
      headStyles: { fillColor: [200, 16, 46] },
    });

    finalY = (doc as any).lastAutoTable.finalY;
  }

  if (leadsPorOrigem.length > 0 && finalY < 250) {
    doc.text('Leads por Origem', 14, finalY + 15);

    const leadsData = leadsPorOrigem.map(item => [item.label, item.value.toString()]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Origem', 'Quantidade']],
      body: leadsData,
      theme: 'grid',
      headStyles: { fillColor: [200, 16, 46] },
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    'Oeste Casa - Sistema de Gerenciamento Imobiliário',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`relatorio-oeste-casa-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportToExcel(stats: ReportData, vendasPorMes: any[], leadsPorOrigem: any[], imoveis: any[], leads: any[]) {
  const workbook = XLSX.utils.book_new();

  const summaryData = [
    ['Métrica', 'Valor'],
    ['Total de Imóveis', stats.totalImoveis],
    ['Imóveis Ativos', stats.imoveisAtivos],
    ['Imóveis Vendidos', stats.imoveisVendidos],
    ['Total de Leads', stats.totalLeads],
    ['Leads Convertidos', stats.leadsConvertidos],
    ['Taxa de Conversão (%)', stats.taxaConversao.toFixed(1)],
    ['Valor Total Vendas (R$)', stats.valorTotalVendas],
    ['Valor Médio Imóvel (R$)', stats.valorMedioImovel],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

  if (vendasPorMes.length > 0) {
    const vendasData = [
      ['Mês', 'Quantidade'],
      ...vendasPorMes.map(item => [item.label, item.value])
    ];
    const vendasSheet = XLSX.utils.aoa_to_sheet(vendasData);
    XLSX.utils.book_append_sheet(workbook, vendasSheet, 'Vendas por Mês');
  }

  if (leadsPorOrigem.length > 0) {
    const leadsOrigemData = [
      ['Origem', 'Quantidade'],
      ...leadsPorOrigem.map(item => [item.label, item.value])
    ];
    const leadsOrigemSheet = XLSX.utils.aoa_to_sheet(leadsOrigemData);
    XLSX.utils.book_append_sheet(workbook, leadsOrigemSheet, 'Leads por Origem');
  }

  if (imoveis.length > 0) {
    const imoveisSimplificados = imoveis.map(i => ({
      Título: i.titulo,
      Tipo: i.tipo,
      Cidade: i.cidade,
      Bairro: i.bairro,
      'Preço (R$)': Number(i.preco),
      Status: i.status,
      Quartos: i.quartos,
      'Área (m²)': i.area,
      'Data Cadastro': new Date(i.created_at).toLocaleDateString('pt-BR'),
    }));
    const imoveisSheet = XLSX.utils.json_to_sheet(imoveisSimplificados);
    XLSX.utils.book_append_sheet(workbook, imoveisSheet, 'Imóveis');
  }

  if (leads.length > 0) {
    const leadsSimplificados = leads.map((l: any) => ({
      Nome: l.nome,
      Email: l.email || '',
      Telefone: l.telefone || '',
      Status: l.status,
      Origem: l.origem || '',
      'Data Contato': l.data_contato ? new Date(l.data_contato).toLocaleDateString('pt-BR') : '',
    }));
    const leadsSheet = XLSX.utils.json_to_sheet(leadsSimplificados);
    XLSX.utils.book_append_sheet(workbook, leadsSheet, 'Leads');
  }

  XLSX.writeFile(workbook, `relatorio-oeste-casa-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
