import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY
  });
  throw new Error('Missing Supabase environment variables. Please check your Vercel environment variables configuration.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
