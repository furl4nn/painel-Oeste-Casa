import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'corretor' | 'suporte';

export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  phone: string;
  avatar_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Imovel = {
  id: string;
  user_id: string;
  codigo_referencia: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  status: string;
  preco: number | string;
  valor_aluguel: string;
  condominio: string;
  iptu: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: number;
  longitude?: number;
  area_total: string;
  area_util: string;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  caracteristicas: Record<string, boolean>;
  mobiliado: boolean;
  aceita_permuta: boolean;
  aceita_financiamento: boolean;
  descricao: string;
  pontos_fortes: string;
  observacoes: string;
  video_url: string;
  tour_virtual_url: string;
  destaque: boolean;
  publicado: boolean;
  views: number;
  created_at: string;
  updated_at: string;
};

export type ImovelImage = {
  id: string;
  imovel_id: string;
  url: string;
  ordem: number;
  legenda: string;
  is_cover: boolean;
  created_at: string;
};

export type Tag = {
  id: string;
  nome: string;
  slug: string;
  cor: string;
  created_at: string;
};

export type ImovelTag = {
  id: string;
  imovel_id: string;
  tag_id: string;
  created_at: string;
};

export type Lead = {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  preferencia_contato: string;
  origem: string;
  status: string;
  temperatura: string;
  score: number;
  imovel_id?: string;
  tipo_imovel_interesse: string;
  bairros_interesse: string[];
  orcamento_min: number;
  orcamento_max: number;
  data_contato: string;
  ultimo_contato?: string;
  proxima_acao?: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
};

export type LeadHistorico = {
  id: string;
  lead_id: string;
  user_id: string;
  tipo_interacao: string;
  descricao: string;
  created_at: string;
};

export type Agendamento = {
  id: string;
  lead_id: string;
  imovel_id: string;
  user_id: string;
  data_hora: string;
  status: string;
  observacoes: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  link: string;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  acao: string;
  entidade: string;
  entidade_id: string;
  detalhes: Record<string, any>;
  ip: string;
  created_at: string;
};

export type UserProfile = {
  id: string;
  full_name: string;
  plan_name: string;
  plan_expiry: string;
  plan_status: string;
  role: string;
  created_at: string;
};

export type MensagemLead = {
  id: string;
  user_id: string;
  nome_lead: string;
  mensagem: string;
  status: string;
  created_at: string;
};

export type Anotacao = {
  id: string;
  user_id: string;
  conteudo: string;
  created_at: string;
  updated_at: string;
};

export type AcaoImovel = {
  id: string;
  user_id: string;
  imovel_id: string;
  tipo_acao: string;
  created_at: string;
};

export type NegocioFunil = {
  id: string;
  user_id: string;
  imovel_id: string;
  etapa: string;
  created_at: string;
};

export async function logActivity(
  acao: string,
  entidade: string,
  entidade_id: string,
  detalhes: Record<string, any> = {}
) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from('activity_logs').insert([{
    user_id: user.id,
    acao,
    entidade,
    entidade_id,
    detalhes,
    ip: ''
  }]);
}

export async function createNotification(
  user_id: string,
  titulo: string,
  mensagem: string,
  tipo: string = 'info',
  link: string = ''
) {
  await supabase.from('notifications').insert([{
    user_id,
    titulo,
    mensagem,
    tipo,
    link
  }]);
}
