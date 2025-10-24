/*
  # Add Avatar Storage and Field

  1. Changes
    - Add avatar_url field to profiles table
    - Create avatars bucket in storage
*/

-- Adicionar campo avatar_url na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Criar bucket de avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
