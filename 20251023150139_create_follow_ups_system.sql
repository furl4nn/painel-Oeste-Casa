/*
  # Sistema de Follow-ups Automáticos

  1. Nova Tabela
    - `follow_ups`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, referência para leads)
      - `corretor_id` (uuid, referência para auth.users)
      - `data_agendada` (timestamp, quando fazer o follow-up)
      - `status` (text, pendente, concluído, cancelado)
      - `tipo` (text, tipo do follow-up)
      - `observacoes` (text)
      - `concluido_em` (timestamp)
      - `created_at` (timestamp)

  2. Segurança
    - Enable RLS on `follow_ups` table
    - Policies for users to manage their own follow-ups

  3. Triggers
    - Criar follow-up automático ao criar lead (24h depois)
    - Notificar quando follow-up está próximo
*/

CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  corretor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_agendada timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'cancelado', 'atrasado')),
  tipo text NOT NULL CHECK (tipo IN ('primeiro_contato', 'pos_visita', 'retorno_ligacao', 'enviar_proposta', 'negociacao', 'outro')),
  observacoes text,
  concluido_em timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own follow-ups"
  ON follow_ups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = corretor_id);

CREATE POLICY "Users can insert own follow-ups"
  ON follow_ups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = corretor_id);

CREATE POLICY "Users can update own follow-ups"
  ON follow_ups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = corretor_id)
  WITH CHECK (auth.uid() = corretor_id);

CREATE POLICY "Users can delete own follow-ups"
  ON follow_ups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = corretor_id);

CREATE INDEX IF NOT EXISTS idx_follow_ups_corretor_status ON follow_ups(corretor_id, status, data_agendada);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead ON follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_data_agendada ON follow_ups(data_agendada) WHERE status = 'pendente';

CREATE OR REPLACE FUNCTION create_automatic_follow_up()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO follow_ups (
    lead_id,
    corretor_id,
    data_agendada,
    tipo,
    observacoes,
    status
  ) VALUES (
    NEW.id,
    NEW.corretor_id,
    NOW() + INTERVAL '24 hours',
    'primeiro_contato',
    'Follow-up automático: primeiro contato com o lead',
    'pendente'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_follow_up ON leads;
CREATE TRIGGER trigger_create_follow_up
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION create_automatic_follow_up();

CREATE OR REPLACE FUNCTION check_overdue_follow_ups()
RETURNS void AS $$
BEGIN
  UPDATE follow_ups
  SET status = 'atrasado'
  WHERE status = 'pendente'
  AND data_agendada < NOW();
  
  INSERT INTO notificacoes (corretor_id, titulo, mensagem, tipo, link)
  SELECT DISTINCT
    corretor_id,
    'Follow-ups Atrasados',
    'Você tem ' || COUNT(*) || ' follow-ups atrasados',
    'follow_up_pendente',
    '#dashboard'
  FROM follow_ups
  WHERE status = 'atrasado'
  AND concluido_em IS NULL
  GROUP BY corretor_id
  HAVING COUNT(*) > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE follow_ups IS 'Armazena follow-ups agendados para leads';
COMMENT ON COLUMN follow_ups.tipo IS 'Tipos: primeiro_contato, pos_visita, retorno_ligacao, enviar_proposta, negociacao, outro';
COMMENT ON COLUMN follow_ups.status IS 'Status: pendente, concluido, cancelado, atrasado';
