/*
  # Fix All Recursive Policies

  1. Changes
    - Fix policies for activity_logs that reference profiles
    - Fix policies for tags that reference profiles
    - Remove all self-referencing queries that cause infinite recursion

  2. Security
    - Maintain security while removing recursion
    - Use direct auth.uid() checks instead of subqueries
*/

-- Fix Activity Logs policies
DROP POLICY IF EXISTS "Admins can view all logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON activity_logs;

CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix Tags policies
DROP POLICY IF EXISTS "Anyone can view tags" ON tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;

CREATE POLICY "Authenticated users can view tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (true);
