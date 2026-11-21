// @ts-nocheck
import { requestPaypalToken, SANDBOX_URL } from './paypalRuntime';

// Admin-only caller is enforced in paypalPayment. This module has no entity
// writes and no payment-creation, capture, or refund calls. A resource/link ID
// is never substituted for a capture ID, even if both look like PayPal IDs.
async function readSandboxResource(token, path) {
  const response = await fetch(`${SANDBOX_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export async function inspectSandboxCapture(captureId) {
  if (typeof captureId !== 'string' || !/^[A-Z0-9]{1,36}$/.test(captureId)) {
    return Response.json({ error: 'A PayPal capture ID is required, not a link ID or return reference.' }, { status: 400 });
  }
  const authentication = await requestPaypalToken(SANDBOX_URL);
  if (!authentication.ok) {
    return Response.json({ error: 'Sandbox credentials are not accepted. No transaction lookup or payment operation was performed.', code: 'SANDBOX_AUTHENTICATION_FAILED', providerHttpStatus: authentication.status }, { status: 409 });
  }
  const token = authentication.data.access_token;
  const capture = await readSandboxResource(token, `/v2/payments/captures/${encodeURIComponent(captureId)}`);
  if (!capture.ok) {
    return Response.json({ error: 'PayPal did not allow retrieval of that Sandbox capture.', providerHttpStatus: capture.status, paymentStateChanged: false }, { status: capture.status === 404 ? 404 : 502 });
  }
  if (capture.data.id !== captureId) return Response.json({ error: 'Capture identifier mismatch.' }, { status: 502 });
  const orderId = capture.data.supplementary_data?.related_ids?.order_id;
  if (typeof orderId !== 'string' || !/^[A-Z0-9]{1,36}$/.test(orderId)) {
    return Response.json({ captureId, captureStatus: capture.data.status, correlationEstablished: false, reason: 'Retrieved capture has no usable related order ID.', paymentStateChanged: false });
  }
  // GET only: reading PayPal's underlying order is not an Orders checkout.
  const order = await readSandboxResource(token, `/v2/checkout/orders/${encodeURIComponent(orderId)}`);
  if (!order.ok) {
    return Response.json({ captureId, orderId, correlationEstablished: false, reason: 'Related order could not be retrieved.', providerHttpStatus: order.status, paymentStateChanged: false });
  }
  if (order.data.id !== orderId) return Response.json({ error: 'Order identifier mismatch.' }, { status: 502 });
  const units = Array.isArray(order.data.purchase_units) ? order.data.purchase_units : [];
  return Response.json({
    scope: 'Sandbox read-only transaction evidence; no PendingPayment is claimed, fulfilled, or marked paid',
    captureId, orderId, captureStatus: capture.data.status, orderStatus: order.data.status,
    captureAppearsInRetrievedOrder: units.some(unit => (unit.payments?.captures || []).some(item => item.id === captureId)),
    referenceEvidence: units.map(unit => ({
      referenceId: unit.reference_id || null, customId: unit.custom_id || null, invoiceId: unit.invoice_id || null,
      itemSkus: (unit.items || []).map(item => item.sku || null),
    })),
    correlationEstablished: false,
    reason: 'These are provider-retrieved identifiers, not proof of their relationship to a Payment Links resource or PendingPayment. Exact product_id propagation must be established with a controlled Sandbox link payment.',
    paymentStateChanged: false,
  });
}