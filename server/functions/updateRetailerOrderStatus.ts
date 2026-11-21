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
    const { retailer_id, order_id, status, credential_id, session_token } = await req.json();

    if (!retailer_id || !order_id || !status) {
      return Response.json({ error: 'retailer_id, order_id and status are required' }, { status: 400 });
    }

    const retailer = await base44.asServiceRole.entities.Retailer.get(retailer_id).catch(() => null);
    if (!retailer) {
      return Response.json({ error: 'Retailer not found' }, { status: 404 });
    }

    const authorized = await isAuthorizedForRetailer(base44, retailer, credential_id, session_token);
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await base44.asServiceRole.entities.Order.get(order_id).catch(() => null);
    if (!order || !Array.isArray(order.items) || !order.items.some(i => i.retailer_id === retailer_id)) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await base44.asServiceRole.entities.Order.update(order_id, { status });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});