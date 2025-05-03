/*
  # Create email verifications table

  1. New Tables
    - `email_verifications`
      - `email` (text, primary key)
      - `code` (text)
      - `status` (enum)
      - `created_at` (timestamp)
      - `attempts` (integer)

  2. Security
    - Enable RLS on `email_verifications` table
    - Add policies for users to verify their own codes
*/

-- Create enum type for verification status
CREATE TYPE verification_status AS ENUM ('success', 'failed');

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  email text PRIMARY KEY,
  code text NOT NULL,
  status verification_status,
  created_at timestamptz DEFAULT now(),
  attempts integer DEFAULT 0,
  CONSTRAINT max_attempts CHECK (attempts <= 3)
);

-- Enable Row Level Security
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can verify their own codes"
  ON email_verifications
  FOR SELECT
  TO public
  USING (email = current_setting('request.jwt.claims')::json->>'email');

CREATE POLICY "Users can update their own verification status"
  ON email_verifications
  FOR UPDATE
  TO public
  USING (email = current_setting('request.jwt.claims')::json->>'email')
  WITH CHECK (email = current_setting('request.jwt.claims')::json->>'email');