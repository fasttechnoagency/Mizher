// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { createClientFromRequest } from '../base44.server';
import { secrets } from '../base44.server';
import { baseUrl, isSandbox, getAccessToken } from '../shared/paypalRuntime';
import { PAYMENT_LINKS_RELEASE, paymentLinksBlockedResponse } from '../shared/paypalLinksSafety';
import { getPaypalDiagnostics } from '../shared/paypalDiagnostics';
import { inspectSandboxCapture } from '../shared/paypalSandboxInspection';

const CURRENCY = 'USD';

// One-time provider activation (registration) fee, priced in USD — the PayPal
// transaction currency. It is converted to JOD at the live rate for the record.
const REGISTRATION_FEE_USD = 1;

// Derive the app's public origin so PayPal can redirect buyers back to our
// hosted return/cancel pages. The function runs behind a proxy, so prefer the
// forwarded host; fall back to the published app domain.
function getAppBase(req) {
  const proto = (req.headers.get('x-forwarded-proto') || 'https').split(',')[0].trim();
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) return `${proto}://${host.split(',')[0].trim()}`;
  return 'https://mizhermedicalhub.base44.app';
}

// JOD (catalog/record currency) -> USD (PayPal transaction currency).
// Display prices stay in JOD; PayPal is charged in USD. The rate is fetched
// from a free no-key exchange-rate service (open.er-api.com) and cached briefly.
// On any service failure the function throws — it never proceeds with an
// unknown or stale rate.
let cachedRate = null; // { rate, at }
const RATE_TTL_MS = 10 * 60 * 1000;

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

async function getJodToUsdRate() {
  if (cachedRate && Date.now() - cachedRate.at < RATE_TTL_MS) {
    return cachedRate.rate;
  }
  const res = await fetch('https://open.er-api.com/v6/latest/JOD', {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error('Exchange rate service unavailable');
  const data = await res.json();
  const usd = Number(data?.rates?.USD);
  if (!Number.isFinite(usd) || usd <= 0) throw new Error('Invalid exchange rate received');
  cachedRate = { rate: usd, at: Date.now() };
  return usd;
}

// Compute the payable amount (in JOD) from trusted server-side data.
// Never trusts an amount submitted by the browser.
async function computeAmount(base44, ctx) {
  const { type } = ctx;

  if (type === 'doctor_consultation') {
    if (!ctx.doctor_id) throw new Error('doctor_id is required');
    const doctor = await base44.asServiceRole.entities.Doctor.get(ctx.doctor_id).catch(() => null);
    if (!doctor) throw new Error('Doctor not found');
    const base = Number(doctor.consultation_fee) || 25;
    // A sub-fee of 0 (or non-numeric) means "not set" — fall back to the base
    // consultation fee so the payable amount is always positive. PayPal rejects
    // zero-amount orders with a 400 "Invalid amount".
    const positive = (v) => (v != null && Number(v) > 0 ? Number(v) : null);
    const feeMap = {
      message: positive(doctor.fee_message) ?? base,
      voice: positive(doctor.fee_voice) ?? (base + 4),
      video: positive(doctor.fee_video) ?? (base + 8),
    };
    const amountJOD = feeMap[ctx.consultation_type] ?? base;
    return { amountJOD, reference: `doctor:${ctx.doctor_id}` };
  }

  if (type === 'hospital_booking') {
    if (!ctx.hospital_id) throw new Error('hospital_id is required');
    const hospital = await base44.asServiceRole.entities.Hospital.get(ctx.hospital_id).catch(() => null);
    if (!hospital) throw new Error('Hospital not found');
    const amountJOD = Number(hospital.consultation_fee) || 15;
    return { amountJOD, reference: `hospital:${ctx.hospital_id}` };
  }

  if (type === 'package') {
    if (!ctx.package_id) throw new Error('package_id is required');
    const pkg = await base44.asServiceRole.entities.TreatmentPackage.get(ctx.package_id).catch(() => null);
    if (!pkg) throw new Error('Package not found');
    return { amountJOD: Number(pkg.price), reference: `package:${ctx.package_id}` };
  }

  if (type === 'provider_registration') {
    // Provider registration is a fixed one-time activation fee. It is priced in
    // USD and converted to JOD so the amount PayPal is asked to charge is
    // exactly REGISTRATION_FEE_USD after the JOD -> USD conversion.
    const rate = await getJodToUsdRate();
    return { amountJOD: round2(REGISTRATION_FEE_USD / rate), reference: 'provider_registration' };
  }

  if (type === 'marketplace_order') {
    const items = Array.isArray(ctx.items) ? ctx.items : [];
    if (items.length === 0) throw new Error('Cart is empty');
    const productIds = items.map((i) => i.product_id).filter(Boolean);
    if (productIds.length === 0) throw new Error('No valid products');
    const page = await base44.asServiceRole.entities.RetailerProduct.filter(
      { id: { $in: productIds } },
      { limit: 100 }
    );
    const products = page.items || page;
    const prodMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems = [];
    const retailerIds = new Set();
    for (const it of items) {
      const p = prodMap.get(it.product_id);
      if (!p) throw new Error('Product not found');
      if (p.is_active === false) throw new Error(`Product unavailable: ${p.name_en || p.name_ar}`);
      const qty = Math.max(1, Math.floor(Number(it.quantity) || 1));
      subtotal += Number(p.price) * qty;
      retailerIds.add(p.retailer_id);
      orderItems.push({
        product_id: p.id,
        product_name_en: p.name_en,
        product_name_ar: p.name_ar,
        retailer_id: p.retailer_id,
        retailer_name_en: p.retailer_name_en,
        retailer_name_ar: p.retailer_name_ar,
        quantity: qty,
        unit_price: Number(p.price),
        subtotal: Number(p.price) * qty,
      });
    }
    const retailers = await base44.asServiceRole.entities.Retailer.filter({ id: { $in: [...retailerIds] } });
    const retailerMap = new Map(retailers.map((r) => [r.id, r]));
    let deliveryFee = 0;
    for (const id of retailerIds) {
      const r = retailerMap.get(id);
      if (r && r.delivery_fee_enabled) deliveryFee += Number(r.delivery_fee || 0);
    }
    let discount = 0;
    let promoCode = null;
    if (ctx.promoCode) {
      const codes = await base44.asServiceRole.entities.PromoCode.filter({
        code: String(ctx.promoCode).toUpperCase(),
        is_active: true,
      });
      const code = codes.find(
        (c) => (!c.expires_at || new Date(c.expires_at) >= new Date()) && (c.max_uses === 0 || c.uses_count < c.max_uses)
      );
      if (code) {
        if (code.min_order_amount > 0 && subtotal < code.min_order_amount) throw new Error('Promo code minimum order not met');
        discount = code.discount_type === 'percentage'
          ? subtotal * (Number(code.discount_value) / 100)
          : Math.min(Number(code.discount_value), subtotal);
        promoCode = code;
      }
    }
    const total = Math.max(0, subtotal - discount) + deliveryFee;
    return {
      amountJOD: Number(total),
      reference: `marketplace:${orderItems.length}`,
      meta: { orderItems, subtotal: Number(subtotal), deliveryFee: Number(deliveryFee), discount: Number(discount), promoCode },
    };
  }

  throw new Error('Invalid payment type');
}

function entityNameFor(type) {
  if (type === 'doctor_consultation' || type === 'package') return 'Booking';
  if (type === 'hospital_booking') return 'HospitalBooking';
  if (type === 'marketplace_order') return 'Order';
  return null;
}

// Validate the internal record can be constructed BEFORE any capture, so we
// never capture a payment we cannot safely persist.
function validateRecord(type, body, record, meta) {
  const rec = record || {};
  // A registration fee fulfils no data record: the provider profile is created
  // by the console once the payment is verified, so nothing to validate here.
  if (type === 'provider_registration') return;
  if (type === 'doctor_consultation') {
    if (!rec.patient_name) throw new Error('Missing patient name');
    if (!body.doctor_id && !rec.doctor_id) throw new Error('Missing doctor');
    if (!body.consultation_type && !rec.consultation_type) throw new Error('Missing consultation type');
    if (!rec.date) throw new Error('Missing appointment date');
    if (!rec.time) throw new Error('Missing appointment time');
    return;
  }
  if (type === 'package') {
    if (!rec.patient_name) throw new Error('Missing patient name');
    if (!body.package_id && !rec.package_id) throw new Error('Missing package');
    return;
  }
  if (type === 'hospital_booking') {
    if (!rec.patient_name) throw new Error('Missing patient name');
    if (!rec.patient_phone) throw new Error('Missing patient phone');
    if (!body.hospital_id && !rec.hospital_id) throw new Error('Missing hospital');
    if (!rec.date) throw new Error('Missing appointment date');
    if (!rec.time) throw new Error('Missing appointment time');
    return;
  }
  if (type === 'marketplace_order') {
    if (!rec.customer_name) throw new Error('Missing customer name');
    if (!rec.customer_phone) throw new Error('Missing customer phone');
    if (!rec.delivery_address) throw new Error('Missing delivery address');
    if (!meta || !Array.isArray(meta.orderItems) || meta.orderItems.length === 0) throw new Error('Empty order');
    return;
  }
  throw new Error('Invalid type');
}

// Build the internal-record payload shared by capture and recovery so both
// paths produce identical records.
function buildCreatePayload(type, body, record, jodAmount, meta, captureId, status) {
  const rec = record || {};
  const paypalOrderId = body.paypalOrderId;
  if (type === 'doctor_consultation') {
    return { entity: 'Booking', payload: {
      patient_name: rec.patient_name, patient_email: rec.patient_email, patient_phone: rec.patient_phone,
      doctor_id: body.doctor_id || rec.doctor_id, booking_type: 'consultation',
      consultation_type: body.consultation_type || rec.consultation_type,
      date: rec.date, time: rec.time, notes: rec.notes,
      total_amount: jodAmount, payment_method: 'paypal',
      paypal_order_id: paypalOrderId, paypal_capture_id: captureId, status,
    } };
  }
  if (type === 'hospital_booking') {
    return { entity: 'HospitalBooking', payload: {
      hospital_id: body.hospital_id || rec.hospital_id,
      hospital_name_en: rec.hospital_name_en, hospital_name_ar: rec.hospital_name_ar,
      service_type: rec.service_type, department: rec.department,
      date: rec.date, time: rec.time,
      patient_name: rec.patient_name, patient_email: rec.patient_email, patient_phone: rec.patient_phone,
      notes: rec.notes, total_amount: jodAmount, payment_method: 'paypal',
      paypal_order_id: paypalOrderId, paypal_capture_id: captureId, status,
    } };
  }
  if (type === 'package') {
    return { entity: 'Booking', payload: {
      patient_name: rec.patient_name, patient_email: rec.patient_email, patient_phone: rec.patient_phone,
      package_id: body.package_id || rec.package_id, booking_type: 'package', notes: rec.notes,
      total_amount: jodAmount, payment_method: 'paypal',
      paypal_order_id: paypalOrderId, paypal_capture_id: captureId, status,
    } };
  }
  const notes = [rec.notes, meta?.promoCode?.code ? `Promo: ${meta.promoCode.code}` : ''].filter(Boolean).join('\n');
  return { entity: 'Order', payload: {
    customer_name: rec.customer_name, customer_phone: rec.customer_phone, customer_email: rec.customer_email,
    delivery_address: rec.delivery_address, city: rec.city,
    items: meta.orderItems, subtotal: meta.subtotal, delivery_fee: meta.deliveryFee,
    total_amount: jodAmount, payment_method: 'paypal',
    paypal_order_id: paypalOrderId, paypal_capture_id: captureId, status, notes,
  } };
}

// Authoritatively verify a capture by id: status, amount, currency.
async function verifyCapture(token, captureId, expectedAmount) {
  const res = await fetch(`${baseUrl()}/v2/payments/captures/${captureId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 'COMPLETED') return null;
  const amt = Number(data.amount?.value);
  const cur = data.amount?.currency_code;
  if (cur !== CURRENCY) return null;
  if (!amt || Math.abs(amt - expectedAmount) > 0.01) return null;
  return data;
}

// Build the trusted checkout context stored in the binding at creation time.
// At capture, this is read back from the binding — never from the browser.
function buildContext(body, meta) {
  const t = body.type;
  if (t === 'doctor_consultation') return { doctor_id: body.doctor_id, consultation_type: body.consultation_type };
  if (t === 'hospital_booking') return { hospital_id: body.hospital_id };
  if (t === 'package') return { package_id: body.package_id };
  if (t === 'marketplace_order') return { meta };
  return {};
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(e => {
      if ((e.status || e.response?.status) === 401) return null;
      throw e;
    });
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'diagnostics' || action === 'inspectSandboxCapture') {
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      if (action === 'inspectSandboxCapture') return await inspectSandboxCapture(body.captureId);
      return Response.json(await getPaypalDiagnostics(Boolean(body.inspectSpecification)));
    }

    // Public client-id + currency for the PayPal JS SDK. Client-id is safe to expose.
    if (action === 'config') {
      const sandbox = isSandbox();
      const clientId = secrets.get('PAYPAL_CLIENT_ID');
      if (!clientId) return Response.json({ error: 'PAYPAL_CLIENT_ID is not configured' }, { status: 500 });
      // Production routing stays unchanged pending a verified replacement.
      const checkoutMode = sandbox ? 'links' : 'orders';
      return Response.json({ clientId, currency: CURRENCY, env: sandbox ? 'sandbox' : 'live', checkoutMode, paymentLinksEnabled: PAYMENT_LINKS_RELEASE.enabled });
    }

    // Create a PayPal order with a server-computed amount and persist the
    // server-side owner binding (PendingPayment).
    if (action === 'create') {
      const { amountJOD, reference, meta } = await computeAmount(base44, body);
      if (!amountJOD || amountJOD <= 0) return Response.json({ error: 'Invalid amount' }, { status: 400 });
      // Convert the trusted JOD total to USD for PayPal. USD is the PayPal
      // transaction currency; JOD remains the app's pricing/record currency.
      const rate = await getJodToUsdRate();
      const amountUSD = round2(amountJOD * rate);
      if (!amountUSD || amountUSD <= 0) return Response.json({ error: 'Invalid converted amount' }, { status: 400 });
      const rateAt = new Date().toISOString();
      const appBase = getAppBase(req);
      const token = await getAccessToken();
      const orderRes = await fetch(`${baseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': crypto.randomUUID(),
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: reference,
              amount: { currency_code: CURRENCY, value: amountUSD.toFixed(2) },
            },
          ],
          ...(user.email ? { payer: { email_address: user.email } } : {}),
          application_context: {
            brand_name: 'Mizher Medical Hub',
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
            return_url: `${appBase}/payment/return`,
            cancel_url: `${appBase}/payment/cancel`,
          },
        }),
        signal: AbortSignal.timeout(15000),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        const details = Array.isArray(orderData?.error_details) && orderData.error_details.length
          ? orderData.error_details.map((d) => d.description || d.issue).filter(Boolean).join('; ')
          : null;
        const msg = details || orderData?.message || 'PayPal order creation failed';
        return Response.json({ error: msg, debug_id: orderData?.debug_id || null }, { status: 400 });
      }
      // The official PayPal-hosted checkout URL (HATEOAS approve link). Redirect
      // the buyer here; PayPal shows only the methods eligible for that account.
      const approveLink = Array.isArray(orderData.links)
        ? orderData.links.find((l) => l.rel === 'approve' || l.rel === 'payer-action')?.href
        : null;
      // Persist the binding: PayPal order -> authenticated owner + trusted
      // context. The patient/order record is stored server-side at create time
      // so the hosted-checkout return flow (which carries only the PayPal order
      // id) can still build the internal record without trusting the browser.
      await base44.entities.PendingPayment.create({
        paypal_order_id: orderData.id,
        checkout_type: body.type,
        user_id: user.id,
        amount: amountUSD,
        currency: CURRENCY,
        context: {
          ...buildContext(body, meta),
          record: body.record || null,
          source_path: body.source || '/',
          jod_amount: amountJOD,
          usd_amount: amountUSD,
          rate,
          rate_at: rateAt,
        },
        status: 'pending',
      });
      return Response.json({
        orderId: orderData.id,
        approveUrl: approveLink,
        clientId: secrets.get('PAYPAL_CLIENT_ID'),
        currency: CURRENCY,
        amountJOD,
        amountUSD,
        rate,
        rateAt,
        reference,
        status: orderData.status,
      });
    }

    // Capture (or recover) a PayPal order. Authorization comes from the
    // server-side binding, never from a browser-supplied PayPal order id alone.
    if (action === 'capture') {
      const { paypalOrderId } = body;
      if (!paypalOrderId) return Response.json({ error: 'paypalOrderId is required' }, { status: 400 });

      // 1) Load the server-side binding for this PayPal order.
      const pending = await base44.asServiceRole.entities.PendingPayment.filter({ paypal_order_id: paypalOrderId }).catch(() => []);
      if (!pending || pending.length === 0) {
        return Response.json({ error: 'No pending payment found for this order' }, { status: 404 });
      }
      const pp = pending[0];

      // Checkout type and the patient/order record come from the server-side
      // binding (stored at create time), so the hosted-checkout return flow —
      // which only carries the PayPal order id — can safely complete capture.
      const type = body.type || pp.checkout_type;
      if (!type) return Response.json({ error: 'type is required' }, { status: 400 });
      // A registration fee is a one-time activation charge: it fulfils no data
      // record, so it intentionally has no target entity.
      const isRegistration = type === 'provider_registration';
      const entityName = entityNameFor(type);
      if (!entityName && !isRegistration) return Response.json({ error: 'Invalid type' }, { status: 400 });
      const record = body.record || pp.context?.record || {};

      // 2) Authorization: only the authenticated owner who created the order may capture it.
      if (pp.user_id !== user.id) {
        return Response.json({ error: 'Not authorized to capture this payment' }, { status: 403 });
      }
      if (pp.checkout_type !== type) {
        return Response.json({ error: 'Checkout type does not match the payment binding' }, { status: 400 });
      }
      if (pp.currency !== CURRENCY) {
        return Response.json({ error: 'Currency mismatch' }, { status: 400 });
      }
      const expectedAmount = Number(pp.amount);
      if (!expectedAmount || expectedAmount <= 0) {
        return Response.json({ error: 'Invalid bound amount' }, { status: 400 });
      }
      // Original JOD total kept in the binding; the internal record stores JOD.
      const jodAmount = Number(pp.context?.jod_amount);
      if (!jodAmount || jodAmount <= 0) {
        return Response.json({ error: 'Invalid bound JOD amount' }, { status: 400 });
      }

      // Trusted checkout context (ids, marketplace order meta) comes from the
      // binding, not from the browser.
      const meta = pp.context?.meta || null;

      // 3) Fast path: already fulfilled — return the existing record.
      if (pp.status === 'captured' && pp.fulfilled_record_id) {
        const rec = await base44.entities[entityName].get(pp.fulfilled_record_id).catch(() => null);
        if (rec) return Response.json({ success: true, record: rec, duplicate: true, checkout_type: type, source_path: pp.context?.source_path || '/' });
        return Response.json({ error: 'Payment already fulfilled but record unavailable; manual reconciliation required', paypalOrderId, captureId: pp.capture_id }, { status: 409 });
      }

      // A captured registration binding IS the proof of payment (there is no
      // fulfilment record), so retries report success instead of re-capturing.
      if (isRegistration && pp.status === 'captured') {
        return Response.json({ success: true, record: null, duplicate: true, captureId: pp.capture_id, checkout_type: type, source_path: pp.context?.source_path || '/' });
      }

      // 4) Validate the internal record can be constructed BEFORE any capture.
      try {
        validateRecord(type, body, record, meta);
      } catch (e) {
        return Response.json({ error: e.message }, { status: 400 });
      }

      const token = await getAccessToken();

      // 5) Authoritatively query the PayPal order status + amount + currency.
      const verifyRes = await fetch(`${baseUrl()}/v2/checkout/orders/${paypalOrderId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(15000),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) return Response.json({ error: 'PayPal order not found' }, { status: 400 });

      const pu = verifyData.purchase_units?.[0];
      const paypalOrderAmount = Number(pu?.amount?.value);
      const paypalOrderCurrency = pu?.amount?.currency_code;
      if (paypalOrderCurrency !== CURRENCY) return Response.json({ error: 'Currency mismatch' }, { status: 400 });
      if (!paypalOrderAmount || Math.abs(paypalOrderAmount - expectedAmount) > 0.01) {
        return Response.json({ error: 'Payment amount does not match the bound total' }, { status: 400 });
      }

      let captureId;
      let recovered = false;

      if (verifyData.status === 'COMPLETED') {
        const cap = pu?.payments?.captures?.[0];
        if (!cap || cap.status !== 'COMPLETED') {
          return Response.json({ error: 'Order already captured but no completed capture found; manual reconciliation required', paypalOrderId }, { status: 409 });
        }
        const verified = await verifyCapture(token, cap.id, expectedAmount);
        if (!verified) {
          return Response.json({ error: 'Order already captured but capture could not be verified; manual reconciliation required', paypalOrderId }, { status: 409 });
        }
        captureId = cap.id;
        recovered = true;
      } else if (verifyData.status === 'APPROVED') {
        // Attempt capture. If the HTTP response times out, PayPal may still
        // have captured — query the authoritative order status before deciding.
        let capRes, capData;
        try {
          capRes = await fetch(`${baseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(15000),
          });
          capData = await capRes.json();
        } catch (e) {
          const recheck = await fetch(`${baseUrl()}/v2/checkout/orders/${paypalOrderId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: AbortSignal.timeout(15000),
          }).then((r) => r.json()).catch(() => null);
          const cap = recheck?.purchase_units?.[0]?.payments?.captures?.[0];
          if (recheck?.status === 'COMPLETED' && cap?.status === 'COMPLETED' && (await verifyCapture(token, cap.id, expectedAmount))) {
            captureId = cap.id;
            recovered = true;
          }
          if (!captureId) {
            return Response.json({ error: 'Capture timed out; please retry', retryable: true }, { status: 503 });
          }
        }
        if (!captureId) {
          if (!capRes.ok) {
            const msg = capData?.message || 'PayPal capture failed';
            return Response.json({ error: msg }, { status: 400 });
          }
          const capture = capData.purchase_units?.[0]?.payments?.captures?.[0];
          if (!capture || capture.status !== 'COMPLETED') {
            return Response.json({ error: `Capture not completed (status: ${capture?.status || 'unknown'})` }, { status: 400 });
          }
          const finalAmount = Number(capture.amount?.value);
          const finalCurrency = capture.amount?.currency_code;
          if (finalCurrency !== CURRENCY || !finalAmount || Math.abs(finalAmount - expectedAmount) > 0.01) {
            return Response.json({ error: 'Captured amount does not match the bound total' }, { status: 400 });
          }
          captureId = capture.id;
        }
      } else {
        return Response.json({ error: `Order cannot be captured (status: ${verifyData.status})` }, { status: 400 });
      }

      // 6) Atomic claim on the binding so concurrent retries cannot both fulfill.
      //    Only one call transitions pending (or a stale capturing) -> capturing.
      const nonce = crypto.randomUUID();
      const now = new Date().toISOString();
      const staleAt = new Date(Date.now() - 60000).toISOString();
      await base44.asServiceRole.entities.PendingPayment.updateMany(
        { paypal_order_id: paypalOrderId, $or: [ { status: 'pending' }, { status: 'capturing', claim_at: { $lt: staleAt } } ] },
        { $set: { status: 'capturing', claim_token: nonce, claim_at: now } }
      ).catch(() => {});
      const claimed = (await base44.asServiceRole.entities.PendingPayment.filter({ paypal_order_id: paypalOrderId }).catch(() => []))[0];

      if (claimed && claimed.status === 'captured' && claimed.fulfilled_record_id) {
        const rec = await base44.entities[entityName].get(claimed.fulfilled_record_id).catch(() => null);
        return Response.json({ success: true, record: rec, duplicate: true, checkout_type: type, source_path: pp.context?.source_path || '/' });
      }
      if (!claimed || claimed.status !== 'capturing' || claimed.claim_token !== nonce) {
        // Another call owns the capturing state. The capture already succeeded,
        // so do NOT re-capture — tell the client to retry and read the fulfilled record.
        return Response.json({ error: 'Payment is being finalized; please retry', retryable: true, paypalOrderId, captureId, recovered }, { status: 503 });
      }

      // 7) Registration fee: the captured binding is the whole outcome — no
      // provider record is created here (the console creates the profile).
      if (isRegistration) {
        await base44.asServiceRole.entities.PendingPayment.updateMany(
          { paypal_order_id: paypalOrderId, status: 'capturing', claim_token: nonce },
          { $set: { status: 'captured', capture_id: captureId } }
        ).catch(() => {});
        return Response.json({ success: true, captureId, record: null, recovered, checkout_type: type, source_path: pp.context?.source_path || '/' });
      }

      // 7) Persist the internal record.
      const status = type === 'marketplace_order' ? 'confirmed' : 'pending';
      const { entity, payload } = buildCreatePayload(type, body, record, jodAmount, meta, captureId, status);

      let created;
      try {
        created = await base44.entities[entity].create(payload);
      } catch (e) {
        // Captured but the DB write failed. Release the claim so a retry recovers.
        await base44.asServiceRole.entities.PendingPayment.updateMany(
          { paypal_order_id: paypalOrderId, status: 'capturing', claim_token: nonce },
          { $set: { status: 'pending', claim_token: '', claim_at: '' } }
        ).catch(() => {});
        return Response.json({ error: 'Payment captured but record could not be saved; retry to recover', retryable: true, paypalOrderId, captureId, recovered }, { status: 503 });
      }

      // 8) Mark the binding fulfilled with the record id (final transition).
      await base44.asServiceRole.entities.PendingPayment.updateMany(
        { paypal_order_id: paypalOrderId, status: 'capturing', claim_token: nonce },
        { $set: { status: 'captured', capture_id: captureId, fulfilled_record_id: created.id } }
      ).catch(() => {});

      if (type === 'marketplace_order' && meta?.promoCode?.id) {
        await base44.asServiceRole.entities.PromoCode
          .updateMany({ id: meta.promoCode.id }, { $inc: { uses_count: 1 } })
          .catch(() => {});
      }

      return Response.json({ success: true, captureId, record: created, recovered, checkout_type: type, source_path: pp.context?.source_path || '/' });
    }

    // Quote the payable amount (JOD + USD) without creating a PayPal order, so
    // the client can show the conversion to the customer before they approve.
    if (action === 'quote') {
      const { amountJOD, reference } = await computeAmount(base44, body);
      if (!amountJOD || amountJOD <= 0) return Response.json({ error: 'Invalid amount' }, { status: 400 });
      const rate = await getJodToUsdRate();
      const amountUSD = round2(amountJOD * rate);
      return Response.json({
        currency: CURRENCY,
        amountJOD,
        amountUSD,
        rate,
        rateAt: new Date().toISOString(),
        reference,
      });
    }

    // Remove the unsafe experimental path: a browser-provided ref + a same-
    // amount transaction does not establish a payment-to-checkout binding.
    // No resource creation or fulfillment is allowed while release is blocked.
    if (action === 'createLink' || action === 'verifyLink') {
      return paymentLinksBlockedResponse();
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}