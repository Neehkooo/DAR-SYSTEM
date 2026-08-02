// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

export const apiUrl = (endpoint) => `${API_BASE_URL}/api/${endpoint}`
export { SUPABASE_URL, SUPABASE_ANON_KEY }

export default API_BASE_URL
