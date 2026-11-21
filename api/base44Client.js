// Browser data client. Keeps the original `base44.*` call shape used across the
// pages, backed by Lovable Cloud (database, auth, storage) and server functions.
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { createEntitiesProxy } from '@/lib/entity-query';
import { invokeAppFunction } from '@/lib/app-functions.functions';

const PROFILE_COLUMNS = ['full_name', 'phone', 'email'];

async function loadMe() {
  const { data: { session } } = await supabase.auth.getSession();
  const authUser = session?.user;
  if (!authUser) {
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  }
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', authUser.id),
  ]);
  const extra = (profile && profile.data) || {};
  return {
    ...extra,
    id: authUser.id,
    email: profile?.email || authUser.email,
    full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
    phone: profile?.phone || authUser.user_metadata?.phone || '',
    role: (roles || []).some((r) => r.role === 'admin') ? 'admin' : 'user',
    created_date: profile?.created_date || authUser.created_at,
  };
}

function authError(error, fallback) {
  const err = new Error(error?.message || fallback);
  err.response = { status: error?.status || 400, data: { error: error?.message || fallback } };
  return err;
}

const auth = {
  me: loadMe,
  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },
  async updateMe(data) {
    const me = await loadMe();
    const patch = {};
    const extra = {};
    for (const [k, v] of Object.entries(data || {})) {
      if (PROFILE_COLUMNS.includes(k)) patch[k] = v;
      else if (!['id', 'role', 'created_date'].includes(k)) extra[k] = v;
    }
    const { data: current } = await supabase.from('profiles').select('data').eq('id', me.id).maybeSingle();
    patch.data = { ...((current && current.data) || {}), ...extra };
    const { error } = await supabase.from('profiles').update(patch).eq('id', me.id);
    if (error) throw authError(error, 'Failed to update profile');
    return loadMe();
  },
  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: String(email).trim(), password });
    if (error) throw authError(error, 'Invalid email or password');
    return data;
  },
  async register({ email, password, full_name, phone }) {
    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: full_name || '', phone: phone || '' },
      },
    });
    if (error) throw authError(error, 'Registration failed');
    return data;
  },
  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin } });
    if (error) throw authError(error, 'Failed to resend');
  },
  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
    if (error) throw authError(error, 'Invalid verification code');
    return data;
  },
  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(String(email).trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw authError(error, 'Failed to send reset email');
  },
  async resetPassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw authError(error, 'Failed to reset password');
  },
  async loginWithProvider(provider, returnPath = '/') {
    try { sessionStorage.setItem('auth_return_to', returnPath || '/'); } catch { /* ignore */ }
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) throw authError(result.error, 'Sign-in failed');
    if (result.redirected) return;
    window.location.href = returnPath || '/';
  },
  setToken() { /* sessions are managed by Lovable Cloud */ },
  async logout(redirectUrl) {
    await supabase.auth.signOut();
    try { sessionStorage.removeItem('provider_session'); } catch { /* ignore */ }
    if (redirectUrl !== undefined) window.location.href = '/login';
  },
  redirectToLogin(returnUrl) {
    const target = returnUrl ? `?returnTo=${encodeURIComponent(returnUrl)}` : '';
    window.location.href = `/login${target}`;
  },
};

const functions = {
  // Mirrors the original axios-style contract: resolves { data }, throws with
  // err.response.data.error on non-2xx responses.
  async invoke(name, payload) {
    const res = await invokeAppFunction({ data: { name, payload: payload ?? {} } });
    if (res.status >= 400) {
      const message = (res.data && res.data.error) || `Request failed with status code ${res.status}`;
      const err = new Error(message);
      err.response = { status: res.status, data: res.data };
      err.data = res.data;
      throw err;
    }
    return { data: res.data, status: res.status };
  },
};

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

const integrations = {
  Core: {
    async UploadFile({ file }) {
      const { data: { session } } = await supabase.auth.getSession();
      const owner = session?.user?.id || 'anonymous';
      const ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : 'bin';
      const path = `${owner}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (error) throw new Error(error.message || 'Upload failed');
      const { data, error: urlError } = await supabase.storage.from('uploads').createSignedUrl(path, TEN_YEARS);
      if (urlError) throw new Error(urlError.message || 'Upload failed');
      return { file_url: data.signedUrl };
    },
  },
};

export const base44 = {
  entities: createEntitiesProxy(() => supabase),
  auth,
  functions,
  integrations,
};
