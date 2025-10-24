/*
  # Fix Profiles RLS Policies

  1. Changes
    - Drop existing policies with infinite recursion
    - Create new safe policies for profiles table
    - Remove self-referencing policies that cause recursion

  2. Security
    - Users can view all profiles
    - Users can update their own profile only
    - System remains secure without recursion issues
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create safe policies without recursion
CREATE POLICY "Allow authenticated users to view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
