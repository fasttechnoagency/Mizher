// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { createClientFromRequest } from '../base44.server';
import { verifyPassword, hashPassword } from '../shared/passwordHash';

export default (async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { provider_type, username, password } = await req.json();

    if (!provider_type || !username || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const matches = await base44.asServiceRole.entities.ProviderCredential.filter({
      provider_type,
      username: username.trim(),
    });
    // Passwords are stored as PBKDF2 hashes; compare with the constant-time
    // verifier. Legacy plaintext records (pre-migration) are compared directly
    // and then re-hashed on successful login so they migrate lazily without
    // locking existing providers out.
    let cred = null;
    for (const c of matches) {
      if (c.username !== username.trim()) continue;
      const stored = c.password || '';
      if (stored.startsWith('pbkdf2:')) {
        if (await verifyPassword(password, stored)) { cred = c; break; }
      } else if (stored === password) {
        // Migrate legacy plaintext to a hash.
        try {
          const hashed = await hashPassword(password);
          await base44.asServiceRole.entities.ProviderCredential.update(c.id, { password: hashed });
        } catch (_e) { /* migration is best-effort; login still proceeds */ }
        cred = c;
        break;
      }
    }

    if (!cred) {
      return Response.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    if (cred.credential_status !== 'approved') {
      const msg = cred.credential_status === 'pending_approval'
        ? 'Your account is pending admin approval.'
        : 'Your account has been rejected. Please contact support.';
      return Response.json({ error: msg }, { status: 403 });
    }

    // Issue a fresh, unguessable session token — this (not the record id) is the real credential.
    // Keep a rolling list of recent tokens so logging in elsewhere doesn't sign out other sessions.
    const sessionToken = crypto.randomUUID() + crypto.randomUUID();
    const existingTokens = Array.isArray(cred.session_tokens) ? cred.session_tokens : (cred.session_token ? [cred.session_token] : []);
    const updatedTokens = [...existingTokens, sessionToken].slice(-5);
    await base44.asServiceRole.entities.ProviderCredential.update(cred.id, { session_token: sessionToken, session_tokens: updatedTokens });

    return Response.json({
      credential_id: cred.id,
      session_token: sessionToken,
      provider_id: cred.provider_id,
      provider_name: cred.provider_name,
      redirect_path: cred.redirect_path,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});