// @ts-nocheck
import { baseUrl, LIVE_URL, SANDBOX_URL } from './paypalRuntime';

// This stable public endpoint is registered externally, never a dispatcher URL.
export const PAYPAL_WEBHOOK_URL = 'https://mizhermedicalhub.base44.app/functions/paypalWebhook';
const SIGNATURE_HEADERS = [
  'paypal-auth-algo', 'paypal-cert-url', 'paypal-transmission-id',
  'paypal-transmission-sig', 'paypal-transmission-time',
];

export function hasPaypalSignatureHeaders(headers) {
  return SIGNATURE_HEADERS.every(name => Boolean(headers.get(name)));
}

export async function inspectPaypalWebhookRegistrations(token, apiBase = baseUrl()) {
  if (![LIVE_URL, SANDBOX_URL].includes(apiBase)) throw new Error('Invalid PayPal endpoint');
  // Official API has both APPLICATION and ACCOUNT anchors. Inspect both;
  // an application-only lookup does not establish account/NVP webhook setup.
  const results = await Promise.all(['APPLICATION', 'ACCOUNT'].map(async anchor => {
    const response = await fetch(`${apiBase}/v1/notifications/webhooks?anchor_type=${anchor}`, {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000),
    });
    const data = response.ok ? await response.json() : {};
    const registrations = (Array.isArray(data.webhooks) ? data.webhooks : []).filter(webhook =>
      webhook.url === PAYPAL_WEBHOOK_URL && webhook.id &&
      (webhook.event_types || []).some(event => ['PAYMENT.CAPTURE.COMPLETED', '*'].includes(event.name))
    );
    return { anchor, httpStatus: response.status, inspected: response.ok, registrations };
  }));
  const unique = new Map();
  for (const result of results) for (const webhook of result.registrations) unique.set(webhook.id, webhook);
  return {
    inspections: results.map(({ anchor, httpStatus, inspected }) => ({ anchor, httpStatus, inspected })),
    registrations: [...unique.values()],
  };
}

export async function verifyPaypalWebhook(headers, event, token, apiBase = baseUrl()) {
  if (!hasPaypalSignatureHeaders(headers)) return { verified: false, reason: 'MISSING_SIGNATURE_HEADERS' };
  const inspection = await inspectPaypalWebhookRegistrations(token, apiBase);
  if (!inspection.registrations.length) {
    return { verified: false, reason: inspection.inspections.every(item => item.inspected) ? 'EXACT_WEBHOOK_REGISTRATION_NOT_FOUND' : 'WEBHOOK_REGISTRATION_LOOKUP_INCOMPLETE' };
  }
  // Two legitimate anchors may register the same endpoint. Only IDs read from
  // PayPal for this exact URL qualify; never use an ID from the incoming event.
  if (inspection.registrations.length > 2) return { verified: false, reason: 'AMBIGUOUS_WEBHOOK_REGISTRATIONS' };
  for (const webhook of inspection.registrations) {
    const response = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_algo: headers.get('paypal-auth-algo'), cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'), transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'), webhook_id: webhook.id, webhook_event: event,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`PayPal webhook verification request failed (${response.status})`);
    const data = await response.json();
    if (data.verification_status === 'SUCCESS') return { verified: true, reason: 'SUCCESS' };
  }
  return { verified: false, reason: 'SIGNATURE_VERIFICATION_FAILED' };
}