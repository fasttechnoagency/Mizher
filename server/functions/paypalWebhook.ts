// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { getAccessToken } from '../shared/paypalRuntime';
import { hasPaypalSignatureHeaders, verifyPaypalWebhook } from '../shared/paypalWebhookValidation';

// Staged receiver. No heuristic UUID scan, amount-based matching, or financial
// record writes. The release gate remains closed until exact correlation and
// repeat-payment prevention are demonstrated with actual Sandbox payments.
export default async function(req) {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  if (!hasPaypalSignatureHeaders(req.headers)) {
    return Response.json({ error: 'Missing PayPal signature headers' }, { status: 401 });
  }
  const event = await req.json().catch(() => null);
  if (!event?.id || !event?.event_type) return Response.json({ error: 'Invalid event' }, { status: 400 });
  try {
    const token = await getAccessToken();
    const result = await verifyPaypalWebhook(req.headers, event, token);
    if (!result.verified) {
      return Response.json({ error: 'PayPal signature could not be verified', code: result.reason }, { status: 401 });
    }
    if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') return Response.json({ received: true, ignored: true });
    // Not 200: do not silently acknowledge a completed payment we have not
    // safely associated and fulfilled. PayPal can retry a valid notification.
    return Response.json({
      error: 'Payment Links fulfillment is disabled pending verified correlation and repeat-payment protection.',
      code: 'PAYMENT_LINKS_NOT_VERIFIED',
      signatureVerified: true,
      fulfilled: false,
    }, { status: 503 });
  } catch {
    return Response.json({ error: 'PayPal webhook validation unavailable; retry later' }, { status: 503 });
  }
}