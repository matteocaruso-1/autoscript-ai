/*
  # Create generated_tweets table

  1. New Tables
    - `generated_tweets`
      - `id` (uuid, primary key)
      - `user_email` (text, references auth.users)
      - `tweets_content` (text)
      - `created_at` (timestamptz)
      - `status` (enum)
      - `webhook_id` (text, optional)

  2. Security
    - Enable RLS on `generated_tweets` table
    - Add policies for authenticated users to:
      - Read their own tweets
      - Create new tweets
*/

-- Create enum type for status
CREATE TYPE tweet_status AS ENUM ('pending', 'completed', 'failed');

-- Create generated_tweets table
CREATE TABLE IF NOT EXISTS generated_tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text REFERENCES auth.users(email),
  tweets_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status tweet_status DEFAULT 'pending',
  webhook_id text,
  CONSTRAINT fk_user_email FOREIGN KEY (user_email) REFERENCES auth.users(email) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE generated_tweets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own tweets"
  ON generated_tweets
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = user_email);

CREATE POLICY "Users can create tweets"
  ON generated_tweets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = user_email);