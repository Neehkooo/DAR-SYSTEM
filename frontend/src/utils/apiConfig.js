// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const DEFAULT_SUPABASE_URL = 'https://risqomufhavlwtlymqbx.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc3FvbXVmaGF2bHd0bHltcWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTkxODYsImV4cCI6MjA5NjEzNTE4Nn0.gMv7q0d0F7eqsfzWXQLYhchIbRWx8GCeMCoptYbRkQ4'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY

export const apiUrl = (endpoint) => `${API_BASE_URL}/api/${endpoint}`
export { SUPABASE_URL, SUPABASE_ANON_KEY }

export default API_BASE_URL
