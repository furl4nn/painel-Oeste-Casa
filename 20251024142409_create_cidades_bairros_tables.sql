/*
  # Create Cities and Neighborhoods Tables

  1. New Tables
    - `cidades`
      - `id` (uuid, primary key) - Unique identifier
      - `nome` (text) - City name
      - `estado` (text) - State abbreviation (SP, RJ, etc)
      - `created_at` (timestamptz) - Creation timestamp
    
    - `bairros`
      - `id` (uuid, primary key) - Unique identifier
      - `nome` (text) - Neighborhood name
      - `cidade_id` (uuid, foreign key) - Reference to cidade
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read all
    - Add policies for authenticated users to insert new entries

  3. Initial Data
    - Add some common cities in São Paulo state
    - Add neighborhoods for each city
*/

CREATE TABLE IF NOT EXISTS cidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  estado text NOT NULL DEFAULT 'SP',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bairros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cidade_id uuid NOT NULL REFERENCES cidades(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE bairros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cities"
  ON cidades
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert cities"
  ON cidades
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read neighborhoods"
  ON bairros
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert neighborhoods"
  ON bairros
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DO $$
DECLARE
  cotia_id uuid;
  sao_paulo_id uuid;
  barueri_id uuid;
  osasco_id uuid;
BEGIN
  INSERT INTO cidades (nome, estado) VALUES ('Cotia', 'SP') RETURNING id INTO cotia_id;
  INSERT INTO cidades (nome, estado) VALUES ('São Paulo', 'SP') RETURNING id INTO sao_paulo_id;
  INSERT INTO cidades (nome, estado) VALUES ('Barueri', 'SP') RETURNING id INTO barueri_id;
  INSERT INTO cidades (nome, estado) VALUES ('Osasco', 'SP') RETURNING id INTO osasco_id;

  INSERT INTO bairros (nome, cidade_id) VALUES
    ('Centro', cotia_id),
    ('Granja Viana', cotia_id),
    ('Jardim Nomura', cotia_id),
    ('Caucaia do Alto', cotia_id),
    ('Tijuco Preto', cotia_id);

  INSERT INTO bairros (nome, cidade_id) VALUES
    ('Centro', sao_paulo_id),
    ('Pinheiros', sao_paulo_id),
    ('Vila Mariana', sao_paulo_id),
    ('Moema', sao_paulo_id),
    ('Itaim Bibi', sao_paulo_id),
    ('Brooklin', sao_paulo_id),
    ('Morumbi', sao_paulo_id),
    ('Butantã', sao_paulo_id);

  INSERT INTO bairros (nome, cidade_id) VALUES
    ('Centro', barueri_id),
    ('Alphaville', barueri_id),
    ('Tamboré', barueri_id),
    ('Jardim Belval', barueri_id);

  INSERT INTO bairros (nome, cidade_id) VALUES
    ('Centro', osasco_id),
    ('Presidente Altino', osasco_id),
    ('Jardim Piratininga', osasco_id),
    ('Bela Vista', osasco_id);
END $$;
