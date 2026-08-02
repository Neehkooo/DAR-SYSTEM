/* Temporary diagnostic script v2 - with explicit timeouts */
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
const feEnv = path.join(root, 'frontend', '.env');
const supabaseUrl = getEnvValue(feEnv, 'VITE_SUPABASE_URL');
const supabaseKey = getEnvValue(feEnv, 'VITE_SUPABASE_ANON_KEY');
const apiBase = getEnvValue(feEnv, 'VITE_API_BASE_URL') || 'http://127.0.0.1:8000';

const TIMEOUT = 8000;

async function tryFetch(label, url, headers, isJson = true) {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT) });
    console.log(`${label} -> HTTP ${res.status}`);
    if (res.ok && isJson) {
      try { return await res.json(); } catch { return 'ok'; }
    } else if (!res.ok) {
      const txt = await res.text();
      console.log(`  body: ${txt.slice(0, 150)}`);
    }
    return null;
  } catch (e) {
    console.log(`${label} -> ERROR: ${e.message}`);
    return null;
  }
}

(async () => {
  console.log('=== DIAGNOSTIC RUN ===');
  console.log(`Supabase host: ${supabaseUrl ? new URL(supabaseUrl).hostname : 'MISSING'}`);
  console.log(`API base: ${apiBase}`);
  console.log('');

  // 1. Supabase Auth settings
  await tryFetch(
    'GET /auth/v1/settings',
    `${supabaseUrl}/auth/v1/settings`,
    { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  );

  // 2. Supabase REST - auth_metadata
  const meta = await tryFetch(
    'GET /rest/v1/auth_metadata?select=uid,user_level&limit=1',
    `${supabaseUrl}/rest/v1/auth_metadata?select=uid,user_level&limit=1`,
    { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  );
  if (meta) {
    console.log(`  auth_metadata rows: ${Array.isArray(meta) ? meta.length : 'n/a'}`);
  }

  // 3. Supabase REST - a document table
  const docs = await tryFetch(
    'GET /rest/v1/documents_noadocument?select=id&limit=1',
    `${supabaseUrl}/rest/v1/documents_noadocument?select=id&limit=1`,
    { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  );
  if (docs) {
    console.log(`  documents_noadocument rows: ${Array.isArray(docs) ? docs.length : 'n/a'}`);
  }

  // 4. Django API (data layer the app actually uses)
  const logs = await tryFetch(
    `GET ${apiBase}/api/activity_logs/?limit=1`,
    `${apiBase}/api/activity_logs/?limit=1`,
    {}
  );
  if (logs) {
    const arr = Array.isArray(logs) ? logs : (logs.results || []);
    console.log(`  Django API reachable. Activity logs: ${arr.length}`);
  }

  console.log('\n=== DIAGNOSTIC COMPLETE ===');
  process.exit(0);
})();

