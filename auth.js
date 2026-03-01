// Auth utilities — shared across pages
let _sbClient = null;

function initSupabase() {
  if (!_sbClient && window.supabase) {
    _sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sbClient;
}

async function getUser() {
  const sb = initSupabase();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function getDisplayName() {
  const user = await getUser();
  if (!user) return null;
  return user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player';
}

async function requireAuth() {
  const user = await getUser();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}

async function signUp(email, password, displayName) {
  const sb = initSupabase();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  });
  return { data, error };
}

async function signIn(email, password) {
  const sb = initSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function signOut() {
  const sb = initSupabase();
  await sb.auth.signOut();
  window.location.href = '/login';
}
