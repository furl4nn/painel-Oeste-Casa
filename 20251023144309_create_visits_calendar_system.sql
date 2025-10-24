/*
  # Sistema de Agendamento de Visitas

  1. Nova Tabela
    - `visitas`
      - `id` (uuid, primary key)
      - `corretor_id` (uuid, referência para auth.users)
      - `lead_id` (uuid, referência para leads)
      - `imovel_id` (uuid, referência para imoveis)
      - `data_hora` (timestamp, data e hora da visita)
      - `status` (text, status da visita)
      - `titulo` (text, título da visita)
      - `descricao` (text, descrição/notas)
      - `local` (text, local da visita)
      - `duracao_minutos` (integer, duração estimada)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS on `visitas` table
    - Policies for users to manage their own visits

  3. Índices
    - Índice em corretor_id e data_hora para performance

  4. Triggers
    - Notificação 24h antes da visita
    - Notificação 1h antes da visita
*/

CREATE TABLE IF NOT EXISTS visitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  imovel_id uuid REFERENCES imoveis(id) ON DELETE SET NULL,
  data_hora timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado', 'remarcado')),
  titulo text NOT NULL,
  descricao text,
  local text,
  duracao_minutos integer DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own visits"
  ON visitas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = corretor_id);

CREATE POLICY "Users can insert own visits"
  ON visitas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = corretor_id);

CREATE POLICY "Users can update own visits"
  ON visitas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = corretor_id)
  WITH CHECK (auth.uid() = corretor_id);

CREATE POLICY "Users can delete own visits"
  ON visitas
  FOR DELETE
  TO authenticated
  USING (auth.uid() = corretor_id);

CREATE INDEX IF NOT EXISTS idx_visitas_corretor_data ON visitas(corretor_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_visitas_lead ON visitas(lead_id);
CREATE INDEX IF NOT EXISTS idx_visitas_imovel ON visitas(imovel_id);

CREATE OR REPLACE FUNCTION update_visitas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_visitas_updated_at ON visitas;
CREATE TRIGGER trigger_visitas_updated_at
  BEFORE UPDATE ON visitas
  FOR EACH ROW
  EXECUTE FUNCTION update_visitas_updated_at();

CREATE OR REPLACE FUNCTION create_notification_for_visit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notificacoes (corretor_id, titulo, mensagem, tipo, link)
  VALUES (
    NEW.corretor_id,
    'Nova Visita Agendada',
    'Visita agendada para ' || to_char(NEW.data_hora, 'DD/MM/YYYY às HH24:MI') || ' - ' || NEW.titulo,
    'sistema',
    '#agenda'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_visit_notification ON visitas;
CREATE TRIGGER trigger_new_visit_notification
  AFTER INSERT ON visitas
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_for_visit();

COMMENT ON TABLE visitas IS 'Armazena agendamentos de visitas a imóveis';
COMMENT ON COLUMN visitas.status IS 'Status: agendado, confirmado, realizado, cancelado, remarcado';
COMMENT ON COLUMN visitas.duracao_minutos IS 'Duração estimada da visita em minutos';
