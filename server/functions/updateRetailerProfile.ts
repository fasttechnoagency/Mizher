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

// Only these fields may be edited by a retailer through this endpoint.
// Administrative fields (verified, status, owner_user_id, rating, etc.) are never accepted here.
const ALLOWED_FIELDS = [
  'name_en', 'name_ar', 'type', 'logo_url', 'description_en', 'description_ar',
  'phone', 'address_en', 'address_ar', 'city', 'license_number',
  'delivery_fee_enabled', 'delivery_fee',
  'deletion_requested',
];

function pickAllowedFields(data) {
  const result = {};
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      result[key] = data[key];
    }
  }
  return result;
}

export default (async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { retailer_id, credential_id, session_token, ...data } = body;

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

    const safeData = pickAllowedFields(data);
    const updated = await base44.asServiceRole.entities.Retailer.update(retailer_id, safeData);
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});