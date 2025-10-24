/*
  # Create Public Contacts Table

  1. New Tables
    - `contatos_publicos`
      - `id` (uuid, primary key) - Unique identifier for each contact
      - `nome` (text) - Full name of the person contacting
      - `email` (text) - Email address
      - `telefone` (text) - Phone number
      - `assunto` (text) - Subject of the message
      - `mensagem` (text) - The message content
      - `respondido` (boolean) - Whether the contact has been responded to
      - `created_at` (timestamptz) - When the contact was submitted

  2. Security
    - Enable RLS on `contatos_publicos` table
    - Add policy for public users to insert their own contacts
    - Add policy for authenticated users to read contacts
    - Add policy for authenticated users to update response status
*/

CREATE TABLE IF NOT EXISTS contatos_publicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  telefone text NOT NULL,
  assunto text NOT NULL,
  mensagem text NOT NULL,
  respondido boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contatos_publicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact"
  ON contatos_publicos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contacts"
  ON contatos_publicos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update response status"
  ON contatos_publicos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
