// @ts-nocheck
// Server runtime that gives the ported backend functions the same
// `createClientFromRequest(req)` shape they were written against:
//   base44.auth.me()                       -> the signed-in caller (or throws)
//   base44.entities.X                      -> table access as the caller (RLS applies)
//   base44.asServiceRole.entities.X        -> privileged table access (bypasses RLS)
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { createEntitiesProxy, createEntityApi } from '@/lib/entity-query';

export const secrets = {
  get(name) {
    const v = process.env[name];
    return v === undefined ? undefined : v;
  },
};

function keyFetch(key) {
  return (input, init) => {
    const headers = new Headers(typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((value, k) => headers.set(k, value));
    if ((key.startsWith('sb_publishable_') || key.startsWith('sb_secret_')) && headers.get('Authorization') === `Bearer ${key}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  };
}

function bearerFrom(req) {
  const h = req.headers.get('authorization') || '';
  if (!h.startsWith('Bearer ')) return null;
  const token = h.slice(7).trim();
  return token.split('.').length === 3 ? token : null;
}

function userScopedClient(token) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  return createClient(url, key, {
    global: { fetch: keyFetch(key), headers: token ? { Authorization: `Bearer ${token}` } : {} },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function loadAccount(userId) {
  const [{ data: profile }, { data: roles }, { data: authData }] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabaseAdmin.from('user_roles').select('role').eq('user_id', userId),
    supabaseAdmin.auth.admin.getUserById(userId),
  ]);
  const u = authData?.user;
  return {
    ...((profile && profile.data) || {}),
    id: userId,
    email: profile?.email || u?.email || '',
    full_name: profile?.full_name || u?.user_metadata?.full_name || '',
    phone: profile?.phone || '',
    role: (roles || []).some((r) => r.role === 'admin') ? 'admin' : 'user',
    created_date: profile?.created_date || u?.created_at,
  };
}

// Admin-side "User" entity: reads the account list, writes profile fields and the role.
function serviceUserApi() {
  const view = createEntityApi(() => supabaseAdmin, 'User');
  return {
    ...view,
    async update(id, data) {
      const { role, full_name, phone } = data || {};
      const patch = {};
      if (full_name !== undefined) patch.full_name = full_name;
      if (phone !== undefined) patch.phone = phone;
      if (Object.keys(patch).length) await supabaseAdmin.from('profiles').update(patch).eq('id', id);
      if (role === 'admin') {
        await supabaseAdmin.from('user_roles').upsert({ user_id: id, role: 'admin' }, { onConflict: 'user_id,role' });
      } else if (role === 'user') {
        await supabaseAdmin.from('user_roles').delete().eq('user_id', id).eq('role', 'admin');
      }
      return view.get(id);
    },
    async create() { throw new Error('Users are created through sign-up'); },
    async delete(id) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (error) throw new Error(error.message);
      return { success: true };
    },
  };
}

export function createClientFromRequest(req) {
  const token = bearerFrom(req);
  const userClient = userScopedClient(token);
  let mePromise = null;

  const serviceEntities = createEntitiesProxy(() => supabaseAdmin);
  const serviceProxy = new Proxy({}, {
    get(_t, name) {
      if (name === 'User') return serviceUserApi();
      return serviceEntities[name];
    },
  });

  return {
    auth: {
      me() {
        if (!mePromise) {
          mePromise = (async () => {
            if (!token) { const e = new Error('Not authenticated'); e.status = 401; throw e; }
            const { data, error } = await userClient.auth.getClaims(token);
            if (error || !data?.claims?.sub) { const e = new Error('Not authenticated'); e.status = 401; throw e; }
            return loadAccount(data.claims.sub);
          })();
        }
        return mePromise;
      },
    },
    entities: createEntitiesProxy(() => userClient),
    asServiceRole: { entities: serviceProxy },
  };
}
