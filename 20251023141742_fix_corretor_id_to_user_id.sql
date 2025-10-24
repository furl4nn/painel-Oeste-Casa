/*
  # Padronização de IDs de Usuário

  ## Problema Identificado
  A tabela `imoveis` possui dois campos para referenciar o usuário: `corretor_id` e `user_id`.
  Isso causa inconsistências e bugs no sistema, especialmente no CRM.

  ## Solução
  1. Garantir que todos os registros tenham `user_id` populado a partir de `corretor_id`
  2. Atualizar políticas RLS que ainda referenciam `corretor_id` para usar `user_id`
  3. Manter `corretor_id` por compatibilidade, mas deprecado
  4. Padronizar todo o código para usar apenas `user_id`

  ## Tabelas Afetadas
  - `imoveis`: Já possui ambos os campos, vamos sincronizar
  - Políticas RLS em `imovel_images` e `imovel_tags`

  ## Notas Importantes
  - Não removemos `corretor_id` para não quebrar código legacy
  - `user_id` passa a ser o campo oficial
  - Todas as políticas RLS agora usam `user_id`
*/

-- Garantir que user_id está sincronizado com corretor_id
UPDATE imoveis 
SET user_id = corretor_id 
WHERE user_id IS NULL AND corretor_id IS NOT NULL;

UPDATE imoveis 
SET corretor_id = user_id 
WHERE corretor_id IS NULL AND user_id IS NOT NULL;

-- Atualizar políticas RLS de imovel_images para usar user_id ao invés de corretor_id
DROP POLICY IF EXISTS "Users can manage images of own properties" ON imovel_images;
CREATE POLICY "Users can manage images of own properties" ON imovel_images 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM imoveis 
    WHERE imoveis.id = imovel_images.imovel_id 
    AND imoveis.user_id = auth.uid()
  )
);

-- Atualizar políticas RLS de imovel_tags para usar user_id ao invés de corretor_id
DROP POLICY IF EXISTS "Users can manage tags of own properties" ON imovel_tags;
CREATE POLICY "Users can manage tags of own properties" ON imovel_tags 
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM imoveis 
    WHERE imoveis.id = imovel_tags.imovel_id 
    AND imoveis.user_id = auth.uid()
  )
);

-- Adicionar índice em user_id se ainda não existe (para performance)
CREATE INDEX IF NOT EXISTS idx_imoveis_user_id ON imoveis(user_id);

-- Adicionar constraint para garantir que ao menos um dos campos está preenchido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'imoveis_user_reference_check'
  ) THEN
    ALTER TABLE imoveis 
    ADD CONSTRAINT imoveis_user_reference_check 
    CHECK (user_id IS NOT NULL OR corretor_id IS NOT NULL);
  END IF;
END $$;

-- Criar trigger para manter sincronizado (para compatibilidade)
CREATE OR REPLACE FUNCTION sync_imovel_user_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- Se user_id foi definido, sincronizar com corretor_id
  IF NEW.user_id IS NOT NULL AND NEW.user_id != OLD.user_id THEN
    NEW.corretor_id := NEW.user_id;
  END IF;
  
  -- Se corretor_id foi definido, sincronizar com user_id
  IF NEW.corretor_id IS NOT NULL AND NEW.corretor_id != OLD.corretor_id THEN
    NEW.user_id := NEW.corretor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_imovel_user_ids_trigger ON imoveis;
CREATE TRIGGER sync_imovel_user_ids_trigger
  BEFORE UPDATE ON imoveis
  FOR EACH ROW
  EXECUTE FUNCTION sync_imovel_user_ids();
