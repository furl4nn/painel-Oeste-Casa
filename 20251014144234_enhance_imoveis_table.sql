/*
  # Melhorias na Tabela de Imóveis

  1. Novos Campos
    - valor_aluguel (para imóveis de locação)
    - latitude e longitude (para integração com Google Maps)
    - video_url (para vídeos do imóvel)
    - tour_virtual_url (para tour 360)
    - destaque (para destacar imóveis)
    - publicado (controle de publicação)
    - codigo_referencia (código único para o imóvel)

  2. Índices adicionais para performance
*/

DO $$
BEGIN
  -- Adicionar novos campos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'valor_aluguel') THEN
    ALTER TABLE imoveis ADD COLUMN valor_aluguel text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'latitude') THEN
    ALTER TABLE imoveis ADD COLUMN latitude numeric(10, 8);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'longitude') THEN
    ALTER TABLE imoveis ADD COLUMN longitude numeric(11, 8);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'video_url') THEN
    ALTER TABLE imoveis ADD COLUMN video_url text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'tour_virtual_url') THEN
    ALTER TABLE imoveis ADD COLUMN tour_virtual_url text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'destaque') THEN
    ALTER TABLE imoveis ADD COLUMN destaque boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'publicado') THEN
    ALTER TABLE imoveis ADD COLUMN publicado boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'codigo_referencia') THEN
    ALTER TABLE imoveis ADD COLUMN codigo_referencia text UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'user_id') THEN
    ALTER TABLE imoveis ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Atualizar user_id com base no corretor_id
UPDATE imoveis SET user_id = corretor_id WHERE user_id IS NULL;

-- Criar índices adicionais
CREATE INDEX IF NOT EXISTS idx_imoveis_user_id ON imoveis(user_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_tipo ON imoveis(tipo);
CREATE INDEX IF NOT EXISTS idx_imoveis_finalidade ON imoveis(finalidade);
CREATE INDEX IF NOT EXISTS idx_imoveis_cidade ON imoveis(cidade);
CREATE INDEX IF NOT EXISTS idx_imoveis_bairro ON imoveis(bairro);
CREATE INDEX IF NOT EXISTS idx_imoveis_status ON imoveis(status);
CREATE INDEX IF NOT EXISTS idx_imoveis_destaque ON imoveis(destaque);
CREATE INDEX IF NOT EXISTS idx_imoveis_publicado ON imoveis(publicado);
CREATE INDEX IF NOT EXISTS idx_imoveis_codigo_referencia ON imoveis(codigo_referencia);
CREATE INDEX IF NOT EXISTS idx_imoveis_preco ON imoveis(preco);
CREATE INDEX IF NOT EXISTS idx_imoveis_quartos ON imoveis(quartos);

-- Função para gerar código de referência automaticamente
CREATE OR REPLACE FUNCTION generate_codigo_referencia()
RETURNS trigger AS $$
BEGIN
  IF NEW.codigo_referencia IS NULL THEN
    NEW.codigo_referencia := 'IMO' || LPAD(nextval('imoveis_codigo_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar sequence para códigos
CREATE SEQUENCE IF NOT EXISTS imoveis_codigo_seq START 1;

-- Trigger para gerar código automaticamente
DROP TRIGGER IF EXISTS generate_imovel_codigo ON imoveis;
CREATE TRIGGER generate_imovel_codigo
  BEFORE INSERT ON imoveis
  FOR EACH ROW
  WHEN (NEW.codigo_referencia IS NULL)
  EXECUTE FUNCTION generate_codigo_referencia();

-- Atualizar políticas RLS para usar user_id
DROP POLICY IF EXISTS "Users can view own imoveis" ON imoveis;
CREATE POLICY "Users can view own imoveis" ON imoveis FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can insert own imoveis" ON imoveis;
CREATE POLICY "Users can insert own imoveis" ON imoveis FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own imoveis" ON imoveis;
CREATE POLICY "Users can update own imoveis" ON imoveis FOR UPDATE TO authenticated USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can delete own imoveis" ON imoveis;
CREATE POLICY "Users can delete own imoveis" ON imoveis FOR DELETE TO authenticated USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Política para visualização pública (API)
CREATE POLICY "Public can view published imoveis" ON imoveis FOR SELECT TO anon USING (publicado = true AND status = 'ativo');
