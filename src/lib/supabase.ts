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
        const createMock = () => {
          const mock: any = {
            select: () => mock,
            insert: () => mock,
            update: () => mock,
            delete: () => mock,
            eq: () => mock,
            neq: () => mock,
            gt: () => mock,
            lt: () => mock,
            gte: () => mock,
            lte: () => mock,
            like: () => mock,
            ilike: () => mock,
            is: () => mock,
            in: () => mock,
            contains: () => mock,
            containedBy: () => mock,
            range: () => mock,
            textSearch: () => mock,
            match: () => mock,
            not: () => mock,
            or: () => mock,
            filter: () => mock,
            order: () => mock,
            limit: () => mock,
            range_adj: () => mock,
            single: () => mock,
            maybeSingle: () => mock,
            csv: () => mock,
            abortSignal: () => mock,
            then: (onfulfilled: any) => Promise.resolve(onfulfilled({ data: null, error: new Error('Supabase not configured') })),
            catch: (onrejected: any) => Promise.resolve(onrejected(new Error('Supabase not configured'))),
            on: () => mock,
            subscribe: () => ({ unsubscribe: () => {} }),
            channel: () => mock,
          };
          return mock;
        };

        if (['from', 'auth', 'storage', 'functions', 'channel'].includes(prop as string)) {
          return () => {
            console.error(`Supabase client used but VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Action: ${String(prop)}`);
            return createMock();
          };
        }
        return undefined;
      }
    });

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}
