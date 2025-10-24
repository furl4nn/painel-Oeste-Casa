/*
  # Add tipo_permuta field to imoveis table

  1. Changes
    - Add `tipo_permuta` (text, nullable) - Type of property desired in exchange
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'imoveis' AND column_name = 'tipo_permuta'
  ) THEN
    ALTER TABLE imoveis ADD COLUMN tipo_permuta text;
  END IF;
END $$;
