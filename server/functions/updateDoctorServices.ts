// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { createClientFromRequest } from '../base44.server';

async function isAuthorizedForDoctor(base44, doctor, credentialId, sessionToken) {
  const user = await base44.auth.me().catch(() => null);
  if (user && doctor.owner_user_id === user.id) return true;
  if (credentialId && sessionToken) {
    const cred = await base44.asServiceRole.entities.ProviderCredential.get(credentialId).catch(() => null);
    if (cred && cred.provider_type === 'doctor' && cred.provider_id === doctor.id && cred.credential_status === 'approved'
      && sessionToken && (cred.session_token === sessionToken || (Array.isArray(cred.session_tokens) && cred.session_tokens.includes(sessionToken)))) {
      return true;
    }
  }
  return false;
}

// Only these fields may be edited by a doctor through this endpoint.
// Administrative fields (verified, status, owner_user_id, rating, reviews_count, etc.) are never accepted here.
const ALLOWED_FIELDS = [
  'name_en', 'name_ar', 'specialty_en', 'specialty_ar', 'bio_en', 'bio_ar', 'photo_url',
  'gender', 'location_en', 'location_ar', 'consultation_fee', 'experience_years',
  'available_today', 'specialties', 'services', 'insurance_accepted', 'clinic_name_en',
  'clinic_name_ar', 'clinic_address', 'phone', 'license_number', 'languages',
  'available_slots', 'instagram_url', 'facebook_url', 'maps_code',
  'active_message', 'active_voice', 'active_video', 'fee_message', 'fee_voice', 'fee_video',
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
    const { doctor_id, credential_id, session_token, ...data } = body;

    if (!doctor_id) {
      return Response.json({ error: 'doctor_id is required' }, { status: 400 });
    }

    const doctor = await base44.asServiceRole.entities.Doctor.get(doctor_id).catch(() => null);
    if (!doctor) {
      return Response.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const authorized = await isAuthorizedForDoctor(base44, doctor, credential_id, session_token);
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const safeData = pickAllowedFields(data);
    const updated = await base44.asServiceRole.entities.Doctor.update(doctor_id, safeData);
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});