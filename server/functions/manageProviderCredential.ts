// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { createClientFromRequest } from '../base44.server';
import { hashPassword } from '../shared/passwordHash';

const ENTITY_FOR_TYPE = {
  doctor: 'Doctor',
  retailer: 'Retailer',
  lab: 'Lab',
  hospital: 'Hospital',
  clinic: 'Hospital',
};

// Authorization for credential management. Three trusted paths:
//   1. Platform admin — may manage any provider's credential.
//   2. The provider record's owner (owner_user_id === user.id) — may create
//      their first credential or update it.
//   3. An existing approved credential with a matching session token — for
//      providers already logged in to their console.
// Credential records themselves are NOT client-writable (entity create is
// admin-only), so a caller can no longer forge a credential for a provider
// they do not own.
async function resolveAuth(base44, providerType, providerId, credentialId, sessionToken) {
  const user = await base44.auth.me().catch(() => null);
  if (!user) return null;
  if (user.role === 'admin') return { user, admin: true };
  const entityName = ENTITY_FOR_TYPE[providerType];
  const record = entityName
    ? await base44.asServiceRole.entities[entityName].get(providerId).catch(() => null)
    : null;
  if (record && record.owner_user_id === user.id) return { user, admin: false, record };
  if (credentialId && sessionToken) {
    const cred = await base44.asServiceRole.entities.ProviderCredential.get(credentialId).catch(() => null);
    if (
      cred &&
      cred.provider_type === providerType &&
      cred.provider_id === providerId &&
      cred.credential_status === 'approved' &&
      (cred.session_token === sessionToken || (Array.isArray(cred.session_tokens) && cred.session_tokens.includes(sessionToken)))
    ) {
      return { user, admin: false };
    }
  }
  return null;
}

export default (async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      provider_type, provider_id, credential_id, session_token, action,
      username, password, provider_name, redirect_path, credential_status,
    } = body;

    if (!provider_type || !provider_id || !action) {
      return Response.json({ error: 'provider_type, provider_id and action are required' }, { status: 400 });
    }

    const auth = await resolveAuth(base44, provider_type, provider_id, credential_id, session_token);
    if (!auth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entityName = ENTITY_FOR_TYPE[provider_type];
    const providerRecord = entityName
      ? await base44.asServiceRole.entities[entityName].get(provider_id).catch(() => null)
      : null;

    const creds = await base44.asServiceRole.entities.ProviderCredential.filter({ provider_type, provider_id });
    let cred = creds[0];

    // ── CREATE ──
    // Used by the self-registration flow (provider owner) and by admins granting
    // credentials. Passwords are hashed server-side; never stored in plaintext.
    if (action === 'create') {
      if (cred) return Response.json({ error: 'Credentials already exist for this provider' }, { status: 400 });
      if (!username || !username.trim() || !password) {
        return Response.json({ error: 'username and password are required' }, { status: 400 });
      }
      const status = credential_status || (auth.admin ? 'approved' : 'pending_approval');
      const hashed = await hashPassword(password);
      const created = await base44.asServiceRole.entities.ProviderCredential.create({
        provider_type,
        provider_id,
        provider_name: provider_name || providerRecord?.name_en || '',
        username: username.trim(),
        password: hashed,
        redirect_path: redirect_path || '/',
        credential_status: status,
      });
      return Response.json({ success: true, id: created.id, username: created.username, credential_status: status });
    }

    // Auto-provision for providers who registered via normal email login and
    // never had a credential. Only reachable by an authorized caller (owner
    // or admin). The generated password is hashed before storage.
    if (!cred) {
      const generatedUsername = (providerRecord?.name_en || provider_type)
        .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '_' + provider_id.slice(-6);
      const generatedPassword = Math.random().toString(36).slice(-10);
      const hashed = await hashPassword(generatedPassword);
      cred = await base44.asServiceRole.entities.ProviderCredential.create({
        provider_type,
        provider_id,
        provider_name: providerRecord?.name_en || '',
        username: generatedUsername,
        password: hashed,
        credential_status: 'approved',
      });
    }

    if (action === 'get') {
      return Response.json({ username: cred.username });
    }

    if (action === 'update') {
      const updates = {};
      if (username && username.trim() && username.trim() !== cred.username) updates.username = username.trim();
      if (password && password.length >= 6) updates.password = await hashPassword(password);
      if (auth.admin && redirect_path) updates.redirect_path = redirect_path;
      if (auth.admin && credential_status) updates.credential_status = credential_status;

      if (Object.keys(updates).length === 0) {
        return Response.json({ error: 'Nothing to update' }, { status: 400 });
      }

      await base44.asServiceRole.entities.ProviderCredential.update(cred.id, updates);
      return Response.json({ success: true, username: updates.username || cred.username });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});