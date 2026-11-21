// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { createClientFromRequest } from '../base44.server';

async function isAuthorizedForHospital(base44, hospital, credentialId, sessionToken) {
  const user = await base44.auth.me().catch(() => null);
  if (user && hospital.owner_user_id === user.id) return true;
  if (credentialId && sessionToken) {
    const cred = await base44.asServiceRole.entities.ProviderCredential.get(credentialId).catch(() => null);
    if (cred && (cred.provider_type === 'hospital' || cred.provider_type === 'clinic') && cred.provider_id === hospital.id
      && cred.credential_status === 'approved' && sessionToken && (cred.session_token === sessionToken || (Array.isArray(cred.session_tokens) && cred.session_tokens.includes(sessionToken)))) {
      return true;
    }
  }
  return false;
}

// Only these fields may be edited by a hospital/clinic through this endpoint.
// Administrative fields (verified, status, owner_user_id, rating, reviews_count, etc.) are never accepted here.
const ALLOWED_FIELDS = [
  'name_en', 'name_ar', 'description_en', 'description_ar', 'photo_url', 'city',
  'address_en', 'address_ar', 'phone', 'email', 'website', 'type', 'specialties',
  'insurance_accepted', 'services', 'consultation_fee', 'instagram_url', 'facebook_url', 'maps_code',
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
    const { hospital_id, credential_id, session_token, ...data } = body;

    if (!hospital_id) {
      return Response.json({ error: 'hospital_id is required' }, { status: 400 });
    }

    const hospital = await base44.asServiceRole.entities.Hospital.get(hospital_id).catch(() => null);
    if (!hospital) {
      return Response.json({ error: 'Hospital not found' }, { status: 404 });
    }

    const authorized = await isAuthorizedForHospital(base44, hospital, credential_id, session_token);
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const safeData = pickAllowedFields(data);
    const updated = await base44.asServiceRole.entities.Hospital.update(hospital_id, safeData);
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});