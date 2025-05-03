/*
  # Enable HTTP Extension

  1. Changes
    - Enable the HTTP extension required for password reset functionality
    - Extension will be created in the 'extensions' schema
    - This is required for the `http_post` function used in password reset triggers

  2. Security
    - Extension is created only if it doesn't already exist
    - Uses the extensions schema for proper organization and security
*/

CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;

-- Verify the extension is enabled and accessible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'http'
  ) THEN
    RAISE EXCEPTION 'HTTP extension was not properly enabled';
  END IF;
END $$;