import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Helper to determine if an error is due to missing SQL tables in PostgREST schema cache (PGRST205 / 42P01)
 */
export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const msg = typeof error === 'string' ? error : (error.message || '');
  const code = error.code || '';
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('in the schema cache') ||
    msg.includes('Could not find the table') ||
    (msg.includes('relation') && msg.includes('does not exist'))
  );
}

/**
 * Helper to check if the Supabase database schema and required tables are ready
 */
export async function checkSupabaseSchemaReady(): Promise<{ ready: boolean; tablesMissing: boolean; message: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { ready: false, tablesMissing: false, message: 'Supabase credentials not configured' };
  }

  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      if (isTableMissingError(error)) {
        return {
          ready: false,
          tablesMissing: true,
          message: 'Supabase connected, but PostgreSQL tables (public.products, etc.) have not been created yet in the database. Run supabase_schema.sql in your Supabase SQL Editor.',
        };
      }
      return {
        ready: false,
        tablesMissing: false,
        message: `Database query returned error: ${error.message} (${error.code || 'unknown'})`,
      };
    }
    return {
      ready: true,
      tablesMissing: false,
      message: 'Successfully connected to Supabase PostgreSQL database!',
    };
  } catch (err: any) {
    return {
      ready: false,
      tablesMissing: false,
      message: err?.message || 'Network error connecting to Supabase.',
    };
  }
}

/**
 * Helper to check live Supabase connectivity
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  const result = await checkSupabaseSchemaReady();
  return {
    connected: result.ready,
    message: result.message,
  };
}
