// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { createClientFromRequest } from '../base44.server';

async function isAuthorizedForRetailer(base44, retailer, credentialId, sessionToken) {
  const user = await base44.auth.me().catch(() => null);
  if (user && retailer.owner_user_id === user.id) return true;
  if (credentialId && sessionToken) {
    const cred = await base44.asServiceRole.entities.ProviderCredential.get(credentialId).catch(() => null);
    if (cred && cred.provider_type === 'retailer' && cred.provider_id === retailer.id && cred.credential_status === 'approved'
      && sessionToken && (cred.session_token === sessionToken || (Array.isArray(cred.session_tokens) && cred.session_tokens.includes(sessionToken)))) {
      return true;
    }
  }
  return false;
}

export default (async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, retailer_id, promo_id, credential_id, session_token, ...data } = body;

    if (!retailer_id) {
      return Response.json({ error: 'retailer_id is required' }, { status: 400 });
    }

    const retailer = await base44.asServiceRole.entities.Retailer.get(retailer_id).catch(() => null);
    if (!retailer) {
      return Response.json({ error: 'Retailer not found' }, { status: 404 });
    }

    const authorized = await isAuthorizedForRetailer(base44, retailer, credential_id, session_token);
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'list') {
      const codes = await base44.asServiceRole.entities.PromoCode.filter({ retailer_id: retailer.id });
      return Response.json(codes);
    }

    if (action === 'create') {
      const created = await base44.asServiceRole.entities.PromoCode.create({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        min_order_amount: data.min_order_amount ? Number(data.min_order_amount) : 0,
        max_uses: data.max_uses ? Number(data.max_uses) : 0,
        uses_count: 0,
        expires_at: data.expires_at || undefined,
        is_active: true,
        retailer_id: retailer.id,
      });
      return Response.json(created);
    }

    if (action === 'toggle') {
      if (!promo_id) return Response.json({ error: 'promo_id is required' }, { status: 400 });
      const promo = await base44.asServiceRole.entities.PromoCode.get(promo_id).catch(() => null);
      if (!promo || promo.retailer_id !== retailer.id) {
        return Response.json({ error: 'Promo code not found' }, { status: 404 });
      }
      const updated = await base44.asServiceRole.entities.PromoCode.update(promo_id, { is_active: !!data.is_active });
      return Response.json(updated);
    }

    if (action === 'delete') {
      if (!promo_id) return Response.json({ error: 'promo_id is required' }, { status: 400 });
      const promo = await base44.asServiceRole.entities.PromoCode.get(promo_id).catch(() => null);
      if (!promo || promo.retailer_id !== retailer.id) {
        return Response.json({ error: 'Promo code not found' }, { status: 404 });
      }
      await base44.asServiceRole.entities.PromoCode.delete(promo_id);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});