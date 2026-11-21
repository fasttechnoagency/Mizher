// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { createClientFromRequest } from '../base44.server';

async function isAuthorizedForDoctor(base44, doctorId, credentialId, sessionToken) {
  const user = await base44.auth.me().catch(() => null);
  if (user) {
    const doctor = await base44.asServiceRole.entities.Doctor.get(doctorId).catch(() => null);
    if (doctor && doctor.owner_user_id === user.id) return true;
  }
  if (credentialId && sessionToken) {
    const cred = await base44.asServiceRole.entities.ProviderCredential.get(credentialId).catch(() => null);
    if (cred && cred.provider_type === 'doctor' && cred.provider_id === doctorId && cred.credential_status === 'approved'
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
    const { doctor_id, credential_id, session_token } = body;

    if (!doctor_id) {
      return Response.json({ error: 'doctor_id is required' }, { status: 400 });
    }

    const authorized = await isAuthorizedForDoctor(base44, doctor_id, credential_id, session_token);
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await base44.asServiceRole.entities.Booking.filter(
      { doctor_id },
      '-created_date',
      200
    );

    return Response.json({ bookings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});