// @ts-nocheck
// Dispatches a named backend action to its ported handler. Each handler takes a
// standard Request and returns a standard Response, exactly like the original.
const HANDLERS = {
  adminEntityAction: () => import('./functions/adminEntityAction'),
  createMarketplaceOrder: () => import('./functions/createMarketplaceOrder'),
  createVideoRoom: () => import('./functions/createVideoRoom'),
  getProviderBookings: () => import('./functions/getProviderBookings'),
  manageProviderCredential: () => import('./functions/manageProviderCredential'),
  manageRetailerProduct: () => import('./functions/manageRetailerProduct'),
  manageRetailerPromoCode: () => import('./functions/manageRetailerPromoCode'),
  paypalPayment: () => import('./functions/paypalPayment'),
  providerLogin: () => import('./functions/providerLogin'),
  sendProviderMessage: () => import('./functions/sendProviderMessage'),
  updateDoctorServices: () => import('./functions/updateDoctorServices'),
  updateHospitalBookingStatus: () => import('./functions/updateHospitalBookingStatus'),
  updateHospitalProfile: () => import('./functions/updateHospitalProfile'),
  updateLabProfile: () => import('./functions/updateLabProfile'),
  updateRetailerOrderStatus: () => import('./functions/updateRetailerOrderStatus'),
  updateRetailerProfile: () => import('./functions/updateRetailerProfile'),
};

const FORWARDED = ['authorization', 'host', 'origin', 'x-forwarded-host', 'x-forwarded-proto', 'user-agent'];

export async function runAppFunction(name, payload, request) {
  const load = HANDLERS[name];
  if (!load) return { status: 404, data: { error: `Unknown function: ${name}` } };
  const headers = new Headers({ 'content-type': 'application/json' });
  for (const h of FORWARDED) {
    const v = request?.headers?.get(h);
    if (v) headers.set(h, v);
  }
  const url = request?.url ? new URL(request.url) : new URL('http://localhost');
  const req = new Request(`${url.origin}/functions/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload ?? {}),
  });
  try {
    const mod = await load();
    const res = await mod.default(req);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { status: res.status, data };
  } catch (error) {
    console.error(`[${name}]`, error);
    return { status: 500, data: { error: error?.message || 'Server error' } };
  }
}

export async function runRawHandler(name, req) {
  const load = HANDLERS[name] || (name === 'paypalWebhook' ? () => import('./functions/paypalWebhook') : null);
  if (!load) return Response.json({ error: 'Not found' }, { status: 404 });
  const mod = await load();
  return mod.default(req);
}
