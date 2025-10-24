/*
  # Atualização da Tabela de Imóveis

  1. Modificações
    - Adiciona novos campos à tabela `imoveis` para suportar cadastro completo
    - Novos campos de localização: numero, complemento, estado, cep
    - Novos campos de valores: condominio, iptu
    - Novos campos de medidas: area_total, area_util, suites
    - Novos campos booleanos: mobiliado, aceita_permuta, aceita_financiamento
    - Campo JSON para características do imóvel (ar_condicionado, piscina, etc.)
    - Campos de texto: observacoes, pontos_fortes
    - Campo finalidade para diferenciar venda/locação

  2. Segurança
    - Mantém as políticas RLS existentes
    - Usuários podem apenas gerenciar seus próprios imóveis
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'numero'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN numero text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'complemento'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN complemento text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'estado'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN estado text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'cep'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN cep text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'condominio'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN condominio text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'iptu'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN iptu text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'area_total'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN area_total text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'area_util'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN area_util text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'suites'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN suites integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'mobiliado'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN mobiliado boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'aceita_permuta'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN aceita_permuta boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'aceita_financiamento'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN aceita_financiamento boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'caracteristicas'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN caracteristicas jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'observacoes'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN observacoes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'pontos_fortes'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN pontos_fortes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'finalidade'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN finalidade text DEFAULT 'Venda';
  END IF;
END $$;
