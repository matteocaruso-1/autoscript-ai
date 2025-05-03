/*
  # Add user preferences table

  1. New Tables
    - `user_preferences`
      - `user_email` (text, primary key, references auth.users)
      - `theme` (text)
      - `accent_color` (text)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own preferences
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  user_email text PRIMARY KEY REFERENCES auth.users(email) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'dark',
  accent_color text NOT NULL DEFAULT '#7E57C2',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = user_email);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = user_email)
  WITH CHECK (auth.jwt()->>'email' = user_email);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = user_email);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for timestamp
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();