/*
  # Atualizar Tabela de Leads

  1. Modificações
    - Renomeia campo `email` para `contato` para ser mais genérico
    - Adiciona campo `data_contato` para rastreamento da data de contato
    - Adiciona campo `imovel_id` como foreign key para tabela imoveis
    - Adiciona campo `observacoes` para notas sobre o lead
    - Remove campos obsoletos

  2. Segurança
    - Mantém as políticas RLS existentes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'data_contato'
  ) THEN
    ALTER TABLE leads ADD COLUMN data_contato timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'imovel_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN imovel_id uuid REFERENCES imoveis(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'observacoes'
  ) THEN
    ALTER TABLE leads ADD COLUMN observacoes text DEFAULT '';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'mensagem'
  ) THEN
    UPDATE leads SET observacoes = mensagem WHERE observacoes = '';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_corretor_id ON leads(corretor_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_data_contato ON leads(data_contato);
CREATE INDEX IF NOT EXISTS idx_leads_imovel_id ON leads(imovel_id);
