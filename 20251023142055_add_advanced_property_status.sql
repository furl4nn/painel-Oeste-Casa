/*
  # Status Avançados para Imóveis

  ## Descrição
  Adiciona novos status avançados para imóveis além de "ativo" e "vendido",
  permitindo uma gestão mais precisa do portfólio.

  ## Novos Status
  - **ativo**: Imóvel disponível para negociação
  - **reservado**: Imóvel reservado por um cliente
  - **em_negociacao**: Em processo de negociação
  - **vendido**: Imóvel vendido
  - **alugado**: Imóvel alugado
  - **indisponivel**: Temporariamente indisponível
  - **em_reforma**: Imóvel em reforma/manutenção

  ## Mudanças
  1. Não altera o tipo da coluna status (continua como text para flexibilidade)
  2. Adiciona tabela de histórico de mudanças de status
  3. Adiciona campo para motivo da mudança de status

  ## Tabelas Afetadas
  - Criação de `property_status_history` para rastreamento
*/

-- Tabela de Histórico de Status de Imóveis
CREATE TABLE IF NOT EXISTS property_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id uuid REFERENCES imoveis(id) ON DELETE CASCADE NOT NULL,
  status_anterior text DEFAULT '',
  status_novo text NOT NULL,
  motivo text DEFAULT '',
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE property_status_history ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view status history of own properties" 
ON property_status_history FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM imoveis 
    WHERE imoveis.id = property_status_history.imovel_id 
    AND imoveis.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert status history for own properties" 
ON property_status_history FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM imoveis 
    WHERE imoveis.id = property_status_history.imovel_id 
    AND imoveis.user_id = auth.uid()
  )
);

-- Admins podem ver todos os históricos
CREATE POLICY "Admins can view all property status history" 
ON property_status_history FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_property_status_history_imovel_id ON property_status_history(imovel_id);
CREATE INDEX IF NOT EXISTS idx_property_status_history_created_at ON property_status_history(created_at);

-- Função para registrar mudança de status automaticamente
CREATE OR REPLACE FUNCTION log_property_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registra se o status realmente mudou
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO property_status_history (
      imovel_id,
      status_anterior,
      status_novo,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar mudanças de status
DROP TRIGGER IF EXISTS log_imovel_status_change ON imoveis;
CREATE TRIGGER log_imovel_status_change
  AFTER UPDATE ON imoveis
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_property_status_change();
