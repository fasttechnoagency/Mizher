import { base44 } from '@/api/base44Client';

let sdkPromise = null;

// base44.functions.invoke throws an axios error on non-2xx responses. Extract
// the server's { error } body so the user sees the real reason (e.g.
// "Invalid amount") instead of the generic "Request failed with status code 400".
function throwServerError(e, fallback) {
  const msg = e?.response?.data?.error || e?.data?.error || e?.message || fallback;
  throw new Error(msg || fallback);
}

/** Returns the public PayPal client-id + currency + env (no secret leaves the server). */
export async function getPaypalConfig() {
  try {
    const res = await base44.functions.invoke('paypalPayment', { action: 'config' });
    return res.data;
  } catch (e) {
    throwServerError(e, 'Failed to load PayPal');
  }
}

function localeFor(lang) {
  // PayPal locale codes; Azerbaijani is not a PayPal locale, fall back to English.
  if (lang === 'ar') return 'ar_AR';
  return 'en_US';
}

/**
 * Loads the official PayPal JavaScript SDK once, globally, using the PUBLIC
 * client-id returned by the server config. The PayPal secret is never read or
 * used in the browser — it stays server-side for order creation and capture.
 *
 * Card funding is enabled (enable-funding=card) so the Debit/Credit Card
 * button can render, and the funding-eligibility component powers the
 * isEligible() check before each button is drawn. Switching Sandbox <-> Live
 * is done by changing PAYPAL_ENVIRONMENT + the PayPal credentials in Secrets;
 * the server then returns the matching client-id here.
 */
export function loadPaypalSdk(lang) {
  if (typeof window !== 'undefined' && window.paypal) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;
  sdkPromise = (async () => {
    const cfg = await getPaypalConfig();
    const clientId = cfg.clientId;
    if (!clientId) throw new Error('PayPal client-id is not configured');
    const currency = cfg.currency || 'USD';
    const locale = localeFor(lang);
    const src =
      `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}` +
      `&currency=${encodeURIComponent(currency)}&intent=capture` +
      `&components=buttons,funding-eligibility,card-fields&enable-funding=card,applepay` +
      `&locale=${encodeURIComponent(locale)}`;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => (window.paypal ? resolve() : reject(new Error('PayPal SDK not available')));
      s.onerror = () => reject(new Error('Failed to load PayPal SDK'));
      document.head.appendChild(s);
    });
    return window.paypal;
  })().catch((e) => {
    sdkPromise = null; // allow a retry after a transient failure
    throw e;
  });
  return sdkPromise;
}

/**
 * Creates a PayPal order SERVER-SIDE; the amount is computed from trusted
 * records (never from the browser). Returns the PayPal order id used by the
 * JS SDK's createOrder callback. The patient/order snapshot is persisted in the
 * PendingPayment binding so capture can build the internal record safely.
 */
export async function createPaypalOrder(context, record, source) {
  try {
    const res = await base44.functions.invoke('paypalPayment', {
      action: 'create',
      ...context,
      record,
      source,
    });
    return res.data;
  } catch (e) {
    throwServerError(e, 'Failed to create PayPal order');
  }
}

/**
 * Captures + verifies an approved PayPal order SERVER-SIDE and creates the
 * internal record (Booking / HospitalBooking / Order). Called from the JS SDK
 * onApprove callback with the PayPal order id; authorization comes from the
 * server-side binding, not from the browser.
 */
export async function capturePaypalOrder(paypalOrderId, context, record) {
  try {
    const payload = { action: 'capture', paypalOrderId };
    if (context && Object.keys(context).length) Object.assign(payload, context);
    if (record) payload.record = record;
    const res = await base44.functions.invoke('paypalPayment', payload);
    return res.data;
  } catch (e) {
    throwServerError(e, 'Payment verification failed');
  }
}