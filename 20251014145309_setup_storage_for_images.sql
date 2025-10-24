/*
  # Configuração do Storage para Imagens

  1. Storage Bucket
    - Cria bucket 'imoveis' para armazenar imagens
    - Configuração de segurança e políticas

  2. Políticas de Acesso
    - Usuários autenticados podem fazer upload
    - Imagens públicas são visíveis para todos
*/

-- Inserir bucket se não existir (será feito via Supabase Dashboard ou SQL)
-- Nota: A criação de buckets geralmente é feita via Dashboard do Supabase

-- Criar políticas de storage
-- Estas políticas devem ser configuradas no Supabase Dashboard:
-- Storage > imoveis > Policies

-- Política 1: Usuários autenticados podem fazer upload
-- CREATE POLICY "Authenticated users can upload images"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'imoveis');

-- Política 2: Todos podem ver imagens
-- CREATE POLICY "Public images are viewable by everyone"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'imoveis');

-- Política 3: Usuários podem atualizar suas imagens
-- CREATE POLICY "Users can update own images"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'imoveis');

-- Política 4: Usuários podem deletar suas imagens
-- CREATE POLICY "Users can delete own images"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'imoveis');

-- Adicionar índice para melhorar performance de queries de imagens
CREATE INDEX IF NOT EXISTS idx_imovel_images_is_cover ON imovel_images(imovel_id, is_cover) WHERE is_cover = true;

-- Função para garantir apenas uma imagem de capa por imóvel
CREATE OR REPLACE FUNCTION ensure_single_cover_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_cover = true THEN
    UPDATE imovel_images
    SET is_cover = false
    WHERE imovel_id = NEW.imovel_id
    AND id != NEW.id
    AND is_cover = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas uma capa
DROP TRIGGER IF EXISTS ensure_single_cover ON imovel_images;
CREATE TRIGGER ensure_single_cover
  BEFORE INSERT OR UPDATE ON imovel_images
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_cover_image();

-- Comentários nas colunas para documentação
COMMENT ON TABLE imovel_images IS 'Armazena múltiplas imagens para cada imóvel';
COMMENT ON COLUMN imovel_images.url IS 'URL pública da imagem no Supabase Storage';
COMMENT ON COLUMN imovel_images.ordem IS 'Ordem de exibição das imagens (0 = primeira)';
COMMENT ON COLUMN imovel_images.is_cover IS 'Indica se esta é a imagem de capa do imóvel';
