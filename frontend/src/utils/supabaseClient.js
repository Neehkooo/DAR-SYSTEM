import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://risqomufhavlwtlymqbx.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc3FvbXVmaGF2bHd0bHltcWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTkxODYsImV4cCI6MjA5NjEzNTE4Nn0.gMv7q0d0F7eqsfzWXQLYhchIbRWx8GCeMCoptYbRkQ4'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY

const hasExplicitEnv = Boolean(import.meta.env.VITE_SUPABASE_URL?.trim() && import.meta.env.VITE_SUPABASE_ANON_KEY?.trim())
if (!hasExplicitEnv) {
  console.info('[Supabase] Using built-in fallback configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel or your local env for production safety.')
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export default supabase
