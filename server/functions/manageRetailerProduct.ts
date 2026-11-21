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

// Only these fields may be set by a retailer through this endpoint.
const ALLOWED_FIELDS = [
  'name_en', 'name_ar', 'description_en', 'description_ar', 'image_url', 'price', 'original_price',
  'category', 'sku', 'stock_quantity', 'unit', 'requires_prescription', 'doctor_recommended', 'is_active',
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
    const { action, retailer_id, product_id, credential_id, session_token, ...data } = body;

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

    if (action === 'create') {
      const safeData = pickAllowedFields(data);
      const created = await base44.asServiceRole.entities.RetailerProduct.create({
        ...safeData,
        retailer_id: retailer.id,
        retailer_name_en: retailer.name_en,
        retailer_name_ar: retailer.name_ar,
      });
      return Response.json(created);
    }

    if (action === 'update') {
      if (!product_id) return Response.json({ error: 'product_id is required' }, { status: 400 });
      const product = await base44.asServiceRole.entities.RetailerProduct.get(product_id).catch(() => null);
      if (!product || product.retailer_id !== retailer.id) {
        return Response.json({ error: 'Product not found' }, { status: 404 });
      }
      const safeData = pickAllowedFields(data);
      const updated = await base44.asServiceRole.entities.RetailerProduct.update(product_id, safeData);
      return Response.json(updated);
    }

    if (action === 'delete') {
      if (!product_id) return Response.json({ error: 'product_id is required' }, { status: 400 });
      const product = await base44.asServiceRole.entities.RetailerProduct.get(product_id).catch(() => null);
      if (!product || product.retailer_id !== retailer.id) {
        return Response.json({ error: 'Product not found' }, { status: 404 });
      }
      await base44.asServiceRole.entities.RetailerProduct.delete(product_id);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});