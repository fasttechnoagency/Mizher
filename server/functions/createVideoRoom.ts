// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { secrets } from '../base44.server';
import { createClientFromRequest } from '../base44.server';

async function isAuthorizedForBooking(base44, booking, credentialId, sessionToken) {
  const user = await base44.auth.me().catch(() => null);
  if (user && booking.created_by_id === user.id) return true;
  if (user && booking.doctor_id) {
    const doctor = await base44.asServiceRole.entities.Doctor.get(booking.doctor_id).catch(() => null);
    if (doctor && doctor.owner_user_id === user.id) return true;
  }
  if (credentialId && sessionToken) {
    const cred = await base44.asServiceRole.entities.ProviderCredential.get(credentialId).catch(() => null);
    if (cred && cred.provider_type === 'doctor' && cred.provider_id === booking.doctor_id && cred.credential_status === 'approved'
      && (cred.session_token === sessionToken || (Array.isArray(cred.session_tokens) && cred.session_tokens.includes(sessionToken)))) {
      return true;
    }
  }
  return false;
}

export default (async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id, credential_id, session_token } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'booking_id is required' }, { status: 400 });
    }

    const booking = await base44.asServiceRole.entities.Booking.get(booking_id).catch(() => null);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const authorized = await isAuthorizedForBooking(base44, booking, credential_id, session_token);
    if (!authorized) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (booking.video_room_url) {
      return Response.json({ room_url: booking.video_room_url });
    }

    const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secrets.get('DAILY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `booking-${booking_id}`,
        properties: { enable_chat: true, start_video_off: false, start_audio_off: false },
      }),
    });

    const dailyData = await dailyRes.json();
    if (!dailyRes.ok) {
      return Response.json({ error: dailyData.error || dailyData.info || 'Failed to create video room' }, { status: 500 });
    }

    await base44.asServiceRole.entities.Booking.update(booking_id, { video_room_url: dailyData.url });
    return Response.json({ room_url: dailyData.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});