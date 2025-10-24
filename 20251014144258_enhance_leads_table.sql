/*
  # Melhorias na Tabela de Leads

  1. Novos Campos
    - whatsapp (separado do telefone)
    - preferencia_contato (email, telefone, whatsapp)
    - orcamento_min e orcamento_max
    - tipo_imovel_interesse
    - bairros_interesse (array)
    - user_id (para usar auth.users ao invés de corretores)
    - ultimo_contato (data da última interação)
    - proxima_acao (data da próxima ação planejada)
    - temperatura (quente, morno, frio)
    - score (pontuação do lead)

  2. Índices para busca e performance
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'whatsapp') THEN
    ALTER TABLE leads ADD COLUMN whatsapp text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'preferencia_contato') THEN
    ALTER TABLE leads ADD COLUMN preferencia_contato text DEFAULT 'whatsapp';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'orcamento_min') THEN
    ALTER TABLE leads ADD COLUMN orcamento_min numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'orcamento_max') THEN
    ALTER TABLE leads ADD COLUMN orcamento_max numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'tipo_imovel_interesse') THEN
    ALTER TABLE leads ADD COLUMN tipo_imovel_interesse text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'bairros_interesse') THEN
    ALTER TABLE leads ADD COLUMN bairros_interesse text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'user_id') THEN
    ALTER TABLE leads ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'ultimo_contato') THEN
    ALTER TABLE leads ADD COLUMN ultimo_contato timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'proxima_acao') THEN
    ALTER TABLE leads ADD COLUMN proxima_acao timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'temperatura') THEN
    ALTER TABLE leads ADD COLUMN temperatura text DEFAULT 'morno';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'score') THEN
    ALTER TABLE leads ADD COLUMN score integer DEFAULT 0;
  END IF;
END $$;

-- Atualizar user_id com base no corretor_id
UPDATE leads SET user_id = corretor_id WHERE user_id IS NULL;

-- Criar índices adicionais
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_temperatura ON leads(temperatura);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_ultimo_contato ON leads(ultimo_contato);
CREATE INDEX IF NOT EXISTS idx_leads_proxima_acao ON leads(proxima_acao);
CREATE INDEX IF NOT EXISTS idx_leads_orcamento ON leads(orcamento_min, orcamento_max);

-- Atualizar políticas RLS para usar user_id
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
CREATE POLICY "Users can view own leads" ON leads FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can insert own leads" ON leads;
CREATE POLICY "Users can insert own leads" ON leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own leads" ON leads;
CREATE POLICY "Users can update own leads" ON leads FOR UPDATE TO authenticated USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can delete own leads" ON leads;
CREATE POLICY "Users can delete own leads" ON leads FOR DELETE TO authenticated USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);
