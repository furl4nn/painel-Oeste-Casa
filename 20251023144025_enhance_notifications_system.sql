/*
  # Aprimoramento do Sistema de Notificações

  1. Adicionar Colunas
    - `link` (text) - Link para navegar ao clicar na notificação
    - `read_at` (timestamp) - Quando a notificação foi lida

  2. Adicionar Triggers Automáticos
    - Notificação ao criar novo lead
    - Notificação ao mudar status do lead

  3. Atualizar Políticas RLS
    - Permitir usuários atualizarem suas notificações
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notificacoes' AND column_name = 'link'
  ) THEN
    ALTER TABLE notificacoes ADD COLUMN link text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notificacoes' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE notificacoes ADD COLUMN read_at timestamptz;
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can update own notifications" ON notificacoes;
CREATE POLICY "Users can update own notifications"
  ON notificacoes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = corretor_id)
  WITH CHECK (auth.uid() = corretor_id);

CREATE OR REPLACE FUNCTION create_notification_for_new_lead()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.corretor_id IS NOT NULL THEN
    INSERT INTO notificacoes (corretor_id, titulo, mensagem, tipo, link)
    VALUES (
      NEW.corretor_id,
      'Novo Lead Recebido',
      'Você recebeu um novo lead: ' || NEW.nome || ' (' || COALESCE(NEW.telefone, NEW.email, 'Sem contato') || ')',
      'novo_lead',
      '#crm'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_new_lead_notification ON leads;
CREATE TRIGGER trigger_new_lead_notification
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_for_new_lead();

CREATE OR REPLACE FUNCTION create_notification_for_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.corretor_id IS NOT NULL THEN
    INSERT INTO notificacoes (corretor_id, titulo, mensagem, tipo, link)
    VALUES (
      NEW.corretor_id,
      'Status do Lead Atualizado',
      'O lead ' || NEW.nome || ' mudou de status: ' || OLD.status || ' → ' || NEW.status,
      'status_mudou',
      '#crm'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lead_status_change ON leads;
CREATE TRIGGER trigger_lead_status_change
  AFTER UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_for_status_change();

CREATE INDEX IF NOT EXISTS idx_notificacoes_lida_created ON notificacoes(corretor_id, lida, created_at DESC);

COMMENT ON COLUMN notificacoes.link IS 'Link para navegar ao clicar na notificação';
COMMENT ON COLUMN notificacoes.read_at IS 'Timestamp de quando a notificação foi lida';
