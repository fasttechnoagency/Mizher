// @ts-nocheck
import { secrets } from '../base44.server';

export const LIVE_URL = 'https://api-m.paypal.com';
export const SANDBOX_URL = 'https://api-m.sandbox.paypal.com';

export function isSandbox() {
  const e = (secrets.get('PAYPAL_ENVIRONMENT') || 'live').toLowerCase();
  return e === 'sandbox' || e === 'test';
}

export function baseUrl() {
  return isSandbox() ? SANDBOX_URL : LIVE_URL;
}

export async function requestPaypalToken(apiBase = baseUrl()) {
  // Never change credential selection on behalf of a caller. The existing pair
  // is probed against Sandbox without changing this app's environment.
  if (![LIVE_URL, SANDBOX_URL].includes(apiBase)) throw new Error('Invalid PayPal endpoint');
  const clientId = secrets.get('PAYPAL_CLIENT_ID');
  const clientSecret = secrets.get('PAYPAL_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('PayPal credentials are not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)');
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok && Boolean(data.access_token), status: response.status, data };
}

export async function getAccessToken() {
  const result = await requestPaypalToken();
  if (!result.ok) throw new Error(`PayPal authentication failed (${result.status})`);
  return result.data.access_token;
}

export function paypalCredentialPresence() {
  return {
    clientIdPresent: Boolean(secrets.get('PAYPAL_CLIENT_ID')),
    clientSecretPresent: Boolean(secrets.get('PAYPAL_CLIENT_SECRET')),
    environmentSettingPresent: Boolean(secrets.get('PAYPAL_ENVIRONMENT')),
    clientIdHasSurroundingWhitespace: Boolean(secrets.get('PAYPAL_CLIENT_ID') && secrets.get('PAYPAL_CLIENT_ID') !== secrets.get('PAYPAL_CLIENT_ID').trim()),
    secretHasSurroundingWhitespace: Boolean(secrets.get('PAYPAL_CLIENT_SECRET') && secrets.get('PAYPAL_CLIENT_SECRET') !== secrets.get('PAYPAL_CLIENT_SECRET').trim()),
  };
}