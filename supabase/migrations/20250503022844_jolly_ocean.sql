/*
  # Add default value for updated_at column

  1. Changes
    - Add default value for updated_at column in user_preferences table
    - This ensures the column is always populated with the current timestamp
*/

ALTER TABLE user_preferences 
ALTER COLUMN updated_at SET DEFAULT now();