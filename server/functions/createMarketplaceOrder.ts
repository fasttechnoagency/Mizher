// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { createClientFromRequest } from '../base44.server';

// Cash-on-delivery marketplace orders. The order total, item prices, delivery
// fee and promo discount are ALL recomputed server-side from RetailerProduct
// records — never from client-supplied totals — so the recorded amount the
// retailer acts on cannot be tampered with.
export default (async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      items, customer_name, customer_phone, customer_email,
      delivery_address, city, notes, promoCode,
    } = body;

    if (!customer_name || !customer_phone || !delivery_address) {
      return Response.json({ error: 'Missing delivery details' }, { status: 400 });
    }
    const cartItems = Array.isArray(items) ? items : [];
    if (cartItems.length === 0) return Response.json({ error: 'Cart is empty' }, { status: 400 });

    // Recompute prices from trusted product records.
    const productIds = cartItems.map((i) => i.product_id).filter(Boolean);
    if (productIds.length === 0) return Response.json({ error: 'No valid products' }, { status: 400 });
    const page = await base44.asServiceRole.entities.RetailerProduct.filter(
      { id: { $in: productIds } },
      { limit: 100 }
    );
    const products = page.items || page;
    const prodMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = [];
    const retailerIds = new Set();
    for (const it of cartItems) {
      const p = prodMap.get(it.product_id);
      if (!p) return Response.json({ error: 'Product not found' }, { status: 400 });
      if (p.is_active === false) return Response.json({ error: `Product unavailable: ${p.name_en || p.name_ar}` }, { status: 400 });
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
    let promo = null;
    if (promoCode) {
      const codes = await base44.asServiceRole.entities.PromoCode.filter({
        code: String(promoCode).toUpperCase(),
        is_active: true,
      });
      const code = codes.find(
        (c) => (!c.expires_at || new Date(c.expires_at) >= new Date()) && (c.max_uses === 0 || c.uses_count < c.max_uses)
      );
      if (code) {
        if (code.min_order_amount > 0 && subtotal < code.min_order_amount) {
          return Response.json({ error: 'Promo code minimum order not met' }, { status: 400 });
        }
        discount = code.discount_type === 'percentage'
          ? subtotal * (Number(code.discount_value) / 100)
          : Math.min(Number(code.discount_value), subtotal);
        promo = code;
      }
    }

    const total = Math.max(0, subtotal - discount) + deliveryFee;
    const finalNotes = [notes, promo?.code ? `Promo: ${promo.code}` : ''].filter(Boolean).join('\n');

    const order = await base44.entities.Order.create({
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      city,
      items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: total,
      payment_method: 'cash_on_delivery',
      status: 'pending',
      notes: finalNotes,
    });

    if (promo?.id) {
      await base44.asServiceRole.entities.PromoCode
        .updateMany({ id: promo.id }, { $inc: { uses_count: 1 } })
        .catch(() => {});
    }

    return Response.json({ success: true, order });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});