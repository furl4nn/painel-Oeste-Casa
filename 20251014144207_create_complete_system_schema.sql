/*
  # Schema Completo do Sistema Imobiliário

  1. Novas Tabelas
    
    ## Tabela de Perfis de Usuário (profiles)
    - Estende auth.users com informações adicionais
    - Campos: id, user_id, full_name, role, phone, avatar_url, active, created_at, updated_at
    
    ## Tabela de Imagens de Imóveis (imovel_images)
    - Armazena múltiplas imagens por imóvel
    - Campos: id, imovel_id, url, ordem, legenda, is_cover
    
    ## Tabela de Tags (tags)
    - Tags reutilizáveis para categorizar imóveis
    - Campos: id, nome, slug, cor
    
    ## Tabela de Relacionamento Imóvel-Tags (imovel_tags)
    - Many-to-many entre imóveis e tags
    
    ## Tabela de Histórico de Leads (lead_historico)
    - Registra todas as interações com leads
    - Campos: id, lead_id, user_id, tipo_interacao, descricao, data
    
    ## Tabela de Agendamentos (agendamentos)
    - Controla visitas agendadas
    - Campos: id, lead_id, imovel_id, user_id, data_hora, status, observacoes
    
    ## Tabela de Logs de Atividades (activity_logs)
    - Auditoria de todas as ações no sistema
    - Campos: id, user_id, acao, entidade, entidade_id, detalhes, ip, created_at
    
    ## Tabela de Notificações (notifications)
    - Sistema de notificações internas
    - Campos: id, user_id, titulo, mensagem, tipo, lida, link, created_at

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em roles (admin, corretor, suporte)
    - Auditoria completa de ações
*/

-- Criar tipo ENUM para roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'corretor', 'suporte');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de Perfis
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role DEFAULT 'corretor',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Imagens de Imóveis
CREATE TABLE IF NOT EXISTS imovel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id uuid REFERENCES imoveis(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  ordem integer DEFAULT 0,
  legenda text DEFAULT '',
  is_cover boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Tags
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  cor text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Tabela de Relacionamento Imóvel-Tags
CREATE TABLE IF NOT EXISTS imovel_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id uuid REFERENCES imoveis(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(imovel_id, tag_id)
);

-- Tabela de Histórico de Leads
CREATE TABLE IF NOT EXISTS lead_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo_interacao text NOT NULL,
  descricao text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  imovel_id uuid REFERENCES imoveis(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  data_hora timestamptz NOT NULL,
  status text DEFAULT 'agendado',
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Logs de Atividades
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acao text NOT NULL,
  entidade text NOT NULL,
  entidade_id text,
  detalhes jsonb DEFAULT '{}'::jsonb,
  ip text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  mensagem text DEFAULT '',
  tipo text DEFAULT 'info',
  lida boolean DEFAULT false,
  link text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE imovel_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE imovel_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas para Imagens de Imóveis
CREATE POLICY "Anyone can view images" ON imovel_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage images of own properties" ON imovel_images FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM imoveis WHERE imoveis.id = imovel_images.imovel_id AND imoveis.corretor_id = auth.uid())
);

-- Políticas para Tags
CREATE POLICY "Anyone can view tags" ON tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tags" ON tags FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas para Imóvel-Tags
CREATE POLICY "Anyone can view imovel tags" ON imovel_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage tags of own properties" ON imovel_tags FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM imoveis WHERE imoveis.id = imovel_tags.imovel_id AND imoveis.corretor_id = auth.uid())
);

-- Políticas para Histórico de Leads
CREATE POLICY "Users can view lead history" ON lead_historico FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM leads WHERE leads.id = lead_historico.lead_id AND leads.corretor_id = auth.uid())
);
CREATE POLICY "Users can insert lead history" ON lead_historico FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM leads WHERE leads.id = lead_historico.lead_id AND leads.corretor_id = auth.uid())
);

-- Políticas para Agendamentos
CREATE POLICY "Users can view own agendamentos" ON agendamentos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own agendamentos" ON agendamentos FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Políticas para Activity Logs
CREATE POLICY "Admins can view all logs" ON activity_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view own logs" ON activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Políticas para Notificações
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_imovel_images_imovel_id ON imovel_images(imovel_id);
CREATE INDEX IF NOT EXISTS idx_imovel_images_ordem ON imovel_images(ordem);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_imovel_tags_imovel_id ON imovel_tags(imovel_id);
CREATE INDEX IF NOT EXISTS idx_imovel_tags_tag_id ON imovel_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_lead_historico_lead_id ON lead_historico(lead_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_lead_id ON agendamentos(lead_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entidade ON activity_logs(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lida ON notifications(lida);

-- Função para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''), 'corretor');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
