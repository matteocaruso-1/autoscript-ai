/*
  # Add webhook trigger for password reset codes

  1. Changes
    - Create function to handle webhook notifications
    - Add trigger to send webhook on new password reset code records
    
  2. Security
    - Function runs with SECURITY DEFINER to ensure webhook access
*/

-- Create or replace the webhook notification function
CREATE OR REPLACE FUNCTION notify_password_reset_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_payload jsonb;
BEGIN
  -- Construct the webhook payload
  webhook_payload := jsonb_build_object(
    'user_email', NEW.user_email,
    'id', NEW.id,
    'request', 'request reset password'
  );

  -- Make the webhook request
  PERFORM http_post(
    'https://hook.us2.make.com/h6twj111ekbh0wf4glyq1df38atrvuhi',
    webhook_payload,
    '{}'::jsonb,
    10 -- timeout in seconds
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'password_reset_webhook_trigger'
  ) THEN
    CREATE TRIGGER password_reset_webhook_trigger
      AFTER INSERT ON password_reset_codes
      FOR EACH ROW
      EXECUTE FUNCTION notify_password_reset_webhook();
  END IF;
END
$$;