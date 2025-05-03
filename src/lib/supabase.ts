import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type GeneratedTweet = {
  id: string;
  user_email: string;
  tweets_content: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
  webhook_id?: string;
  script_title?: string;
};