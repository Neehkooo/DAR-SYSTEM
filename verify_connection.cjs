/* Temporary diagnostic script - checks Supabase config & connectivity without printing secrets */
const fs = require('fs');
const path = require('path');

function getEnvValue(file, key) {
  if (!fs.existsSync(file)) return '';
  const txt = fs.readFileSync(file, 'utf8');
  const re = new RegExp('^\\s*' + key + '\\s*=\\s*(.*)$', 'm');
  const m = txt.match(re);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}

const root = __dirname;

/* ── Frontend env ── */
const feEnv = path.join(root, 'frontend', '.env');
const feEnvExists = fs.existsSync(feEnv);
const supabaseUrl = getEnvValue(feEnv, 'VITE_SUPABASE_URL');
const supabaseKey = getEnvValue(feEnv, 'VITE_SUPABASE_ANON_KEY');
const apiBase = getEnvValue(feEnv, 'VITE_API_BASE_URL');

console.log('=== FRONTEND .env ===');
console.log('frontend/.env exists:', feEnvExists);
console.log('VITE_SUPABASE_URL present:', !!supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY present:', !!supabaseKey);
console.log('VITE_API_BASE_URL present:', !!apiBase);
if (supabaseUrl) {
  try {
    const u = new URL(supabaseUrl);
    console.log('Supabase project host:', u.hostname);
    console.log('Uses https:', u.protocol === 'https:');
  } catch (e) {
    console.log('Supabase URL is INVALID:', e.message);
  }
}

/* ── Backend env ── */
const beEnv = path.join(root, 'backend', '.env');
const beEnvExists = fs.existsSync(beEnv);
const dbUrl = getEnvValue(beEnv, 'DATABASE_URL') || getEnvValue(beEnv, 'SUPABASE_DATABASE_URL');
console.log('\n=== BACKEND .env ===');
console.log('backend/.env exists:', beEnvExists);
console.log('DATABASE_URL / SUPABASE_DATABASE_URL present:', !!dbUrl);
if (dbUrl) {
  try {
    const u = new URL(dbUrl);
    console.log('DB host:', u.hostname);
    console.log('DB scheme:', u.protocol);
  } catch (e) {
    console.log('DB URL could not be parsed.');
  }
}

/* ── Connectivity tests ── */
async function testSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n=== SUPABASE CONNECTIVITY ===');
    console.log('Skipped: credentials missing in frontend/.env.');
    return;
  }
  console.log('\n=== SUPABASE CONNECTIVITY ===');
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    console.log('GET /auth/v1/settings -> HTTP', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('CONNECTED OK. Auth external site:', data.external?.site_url || 'n/a');
    } else {
      const txt = await res.text();
      console.log('Response body (truncated):', txt.slice(0, 200));
    }
  } catch (e) {
    console.log('Network error connecting to Supabase:', e.message);
  }
}

async function testRest() {
  if (!supabaseUrl || !supabaseKey) return;
  console.log('\n=== SUPABASE REST (auth_metadata table) ===');
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/auth_metadata?select=uid,user_level&limit=1`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    console.log('GET /rest/v1/auth_metadata?limit=1 -> HTTP', res.status);
    if (res.ok) {
      const rows = await res.json();
      console.log('Rows returned:', Array.isArray(rows) ? rows.length : 'n/a');
      console.log('auth_metadata table is readable with anon key.');
    } else {
      const txt = await res.text();
      console.log('Response (truncated):', txt.slice(0, 200));
    }
  } catch (e) {
    console.log('Network error on REST test:', e.message);
  }
}

async function testDjangoApi() {
  const base = apiBase || 'http://127.0.0.1:8000';
  console.log('\n=== DJANGO API (data layer) ===');
  try {
    const res = await fetch(`${base}/api/activity_logs/?limit=1`, { signal: AbortSignal.timeout(4000) });
    console.log(`GET ${base}/api/activity_logs/?limit=1 -> HTTP`, res.status);
    if (res.ok) {
      const data = await res.json();
      const logs = Array.isArray(data) ? data : (data.results || []);
      console.log('Django API reachable. Activity logs count:', logs.length);
    } else {
      const txt = await res.text();
      console.log('Response (truncated):', txt.slice(0, 200));
    }
  } catch (e) {
    console.log('Django API not reachable:', e.message);
  }
}

testSupabase()
  .then(testRest)
  .then(testDjangoApi)
  .catch((e) => console.log('Unexpected error:', e.message));

