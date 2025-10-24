/*
  # Add CRECI field to profiles

  1. Changes
    - Add creci (text, nullable) - CRECI number for real estate agents
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS creci text;
