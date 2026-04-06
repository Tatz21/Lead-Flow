import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// We use a proxy to avoid crashing on initialization if credentials are missing.
// This allows the app to load and show a warning instead of a white screen.
const isConfigured = supabaseUrl && supabaseUrl.length > 0 && supabaseAnonKey && supabaseAnonKey.length > 0;

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get: (target, prop) => {
        if (prop === 'from' || prop === 'auth' || prop === 'storage' || prop === 'functions') {
          return () => {
            console.error('Supabase client used but VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set.');
            return {
              select: () => ({ data: null, error: new Error('Supabase not configured') }),
              insert: () => ({ error: new Error('Supabase not configured') }),
              update: () => ({ error: new Error('Supabase not configured') }),
              delete: () => ({ error: new Error('Supabase not configured') }),
              on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
              channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) }),
            };
          };
        }
        return undefined;
      }
    });

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}
