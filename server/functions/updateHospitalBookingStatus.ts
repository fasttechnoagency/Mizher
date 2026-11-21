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

export default (async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { hospital_id, booking_id, status, credential_id, session_token } = await req.json();

    if (!hospital_id || !booking_id || !status) {
      return Response.json({ error: 'hospital_id, booking_id and status are required' }, { status: 400 });
    }

    const hospital = await base44.asServiceRole.entities.Hospital.get(hospital_id).catch(() => null);
    if (!hospital) {
      return Response.json({ error: 'Hospital not found' }, { status: 404 });
    }

    const authorized = await isAuthorizedForHospital(base44, hospital, credential_id, session_token);
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await base44.asServiceRole.entities.HospitalBooking.get(booking_id).catch(() => null);
    if (!booking || booking.hospital_id !== hospital_id) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updated = await base44.asServiceRole.entities.HospitalBooking.update(booking_id, { status });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});