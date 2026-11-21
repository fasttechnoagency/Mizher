import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Loader2, Lock } from 'lucide-react';
import CardPaymentAction from '@/components/payment/CardPaymentAction';
import HostedCardPayment from '@/components/payment/HostedCardPayment';

/**
 * CardPaymentFields — inline PayPal Advanced Card Fields (paypal.CardFields).
 *
 * Replaces the previous smart popup "Debit or Credit Card" button with card
 * fields rendered directly on the page so the form opens instantly. A
 * country dropdown is shown, preselected to Jordan (JO) and editable, and the
 * selected value is passed to PayPal via cardField.submit({ billingAddress }).
 *
 * Order creation and capture are SERVER-VALIDATED, identical to the smart
 * buttons: createOrder/onApprove are passed in from the parent and reuse the
 * same backend (paypalPayment) — the amount is computed from trusted records
 * and capture is verified server-side. The PayPal secret never reaches the
 * browser, and no payment is marked successful from a browser event alone.
 *
 * Falls back to an eligible hosted card button without hiding its expanding form.
 */
const COUNTRIES = [
  { code: 'JO', en: 'Jordan', ar: 'الأردن' },
  { code: 'SA', en: 'Saudi Arabia', ar: 'السعودية' },
  { code: 'AE', en: 'United Arab Emirates', ar: 'الإمارات' },
  { code: 'EG', en: 'Egypt', ar: 'مصر' },
  { code: 'IQ', en: 'Iraq', ar: 'العراق' },
  { code: 'KW', en: 'Kuwait', ar: 'الكويت' },
  { code: 'QA', en: 'Qatar', ar: 'قطر' },
  { code: 'BH', en: 'Bahrain', ar: 'البحرين' },
  { code: 'OM', en: 'Oman', ar: 'عُمان' },
  { code: 'LB', en: 'Lebanon', ar: 'لبنان' },
  { code: 'PS', en: 'Palestine', ar: 'فلسطين' },
  { code: 'SY', en: 'Syria', ar: 'سوريا' },
  { code: 'YE', en: 'Yemen', ar: 'اليمن' },
  { code: 'TR', en: 'Turkey', ar: 'تركيا' },
  { code: 'US', en: 'United States', ar: 'الولايات المتحدة' },
  { code: 'GB', en: 'United Kingdom', ar: 'المملكة المتحدة' },
  { code: 'CA', en: 'Canada', ar: 'كندا' },
  { code: 'DE', en: 'Germany', ar: 'ألمانيا' },
  { code: 'FR', en: 'France', ar: 'فرنسا' },
  { code: 'IT', en: 'Italy', ar: 'إيطاليا' },
  { code: 'ES', en: 'Spain', ar: 'إسبانيا' },
  { code: 'NL', en: 'Netherlands', ar: 'هولندا' },
  { code: 'IN', en: 'India', ar: 'الهند' },
  { code: 'PK', en: 'Pakistan', ar: 'باكستان' },
  { code: 'AU', en: 'Australia', ar: 'أستراليا' },
];

export default function CardPaymentFields({ sdk, createOrder, onApprove, onCancel, onError, onEligibilityChange }) {
  const { isRTL, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState('');
  const [country, setCountry] = useState('JO');

  const instanceRef = useRef(null);
  const renderedRef = useRef(false);
  const renderingRef = useRef(false);
  const numberRef = useRef(null);
  const expiryRef = useRef(null);
  const cvvRef = useRef(null);
  const formRef = useRef(null);
  const payButtonRef = useRef(null);

  // When the inline card form opens it expands below the fold; bring the Pay
  // button into view. 'nearest' alone does nothing while the top of the form is
  // visible, which left the button (and the rest of the page) unreachable, so
  // the button itself is the scroll target.
  const revealPayButton = () => {
    const el = payButtonRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  };

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(revealPayButton, 120);
    return () => clearTimeout(id);
  }, [open]);

  // Create the CardFields instance + check eligibility once the SDK is ready.
  // The SDK itself is preloaded by the parent on mount, so this is cheap and
  // happens before the user clicks — only the iframe render happens on click.
  useEffect(() => {
    if (!sdk) { setChecked(false); setEligible(false); onEligibilityChange?.(false); return; }
    if (!sdk.CardFields || typeof sdk.CardFields !== 'function') { setChecked(true); setEligible(false); onEligibilityChange?.(false); return; }
    let instance;
    let ok = false;
    try {
      instance = sdk.CardFields({
        createOrder,
        onApprove,
        onCancel,
        onError,
        style: {
          input: { 'font-size': '16px', 'font-family': 'Inter, ui-sans-serif, system-ui, sans-serif', color: '#2c3b49' },
          '.invalid': { color: '#dc2626' },
          '.valid': { color: '#0f766e' },
        },
        inputEvents: { onChange: () => setCardError('') },
      });
      instanceRef.current = instance;
      ok = !!(instance.isEligible && instance.isEligible());
      setEligible(ok);
    } catch {
      setEligible(false);
    }
    setChecked(true);
    // Report eligibility so the parent can show the smart card-button fallback
    // when inline fields are unsupported — never hide the card option entirely.
    onEligibilityChange?.(ok);
    return () => {
      try { instance && instance.close && instance.close(); } catch { /* ignore */ }
      instanceRef.current = null;
      renderedRef.current = false;
      renderingRef.current = false;
    };
  }, [sdk, createOrder, onApprove, onCancel, onError, onEligibilityChange]);

  // Render the hosted fields on first open (instant — SDK already loaded).
  useEffect(() => {
    if (!open || !eligible || renderedRef.current || renderingRef.current || !instanceRef.current) return;
    if (!numberRef.current || !expiryRef.current || !cvvRef.current) return;
    renderingRef.current = true;
    setRendering(true);
    const inst = instanceRef.current;
    const fieldStyle = {
      input: { 'font-size': '16px', 'font-family': 'Inter, ui-sans-serif, system-ui, sans-serif', color: '#2c3b49', padding: '0 12px' },
      '.invalid': { color: '#dc2626' },
      '.valid': { color: '#0f766e' },
    };
    Promise.all([
      inst.NumberField({ style: fieldStyle, placeholder: isRTL ? 'رقم البطاقة' : 'Card number' }).render(numberRef.current),
      inst.ExpiryField({ style: fieldStyle, placeholder: 'MM/YY' }).render(expiryRef.current),
      inst.CVVField({ style: fieldStyle, placeholder: isRTL ? 'CVC' : 'CVC' }).render(cvvRef.current),
    ])
      .then(() => {
        renderedRef.current = true;
        renderingRef.current = false;
        setRendering(false);
        revealPayButton();
      })
      .catch((e) => { renderingRef.current = false; setCardError(e?.message || (isRTL ? 'تعذّر تحميل حقول البطاقة. حاول مرة أخرى.' : 'Failed to load card fields. Please try again.')); setRendering(false); });
  }, [open, eligible, isRTL]);


  if (!checked) return null;

  const toggle = () => setOpen((o) => !o);

  const handlePay = async () => {
    if (submitting || !instanceRef.current || !renderedRef.current) return;
    setSubmitting(true);
    setCardError('');
    try {
      // The selected billing country is passed to PayPal; the transaction
      // currency is untouched (server-side USD conversion stays as-is).
      await instanceRef.current.submit({ billingAddress: { countryCode: country } });
      // onApprove (passed from the parent) performs the server-side capture +
      // verification and persists the internal record.
    } catch (e) {
      setCardError(e?.message || (isRTL ? 'تحقق من بيانات البطاقة وحاول مرة أخرى.' : 'Please check your card details and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!eligible) {
    return <HostedCardPayment sdk={sdk} isRTL={isRTL} createOrder={createOrder} onApprove={onApprove} onCancel={onCancel} onError={onError} />;
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <CardPaymentAction isRTL={isRTL} onClick={toggle} open={open} disabled={submitting} />

      {/* Keep hosted iframes mounted when collapsed so reopening preserves working fields. */}
        <div hidden={!open} ref={formRef} className="mt-3 rounded-2xl border border-payment-border bg-payment-surface p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'رقم البطاقة' : 'Card number'}</label>
            <div ref={numberRef} className="h-11 rounded-lg border border-payment-border bg-white overflow-hidden" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'تاريخ الانتهاء' : 'Expiry'}</label>
              <div ref={expiryRef} className="h-11 rounded-lg border border-payment-border bg-white overflow-hidden" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'رمز التحقق' : 'CVC'}</label>
              <div ref={cvvRef} className="h-11 rounded-lg border border-payment-border bg-white overflow-hidden" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'الدولة' : 'Country'}</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-payment-border bg-white px-3 text-sm text-payment-ink focus:outline-none focus:ring-2 focus:ring-payment-focus"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{lang === 'ar' ? c.ar : c.en}</option>
              ))}
            </select>
          </div>

          {cardError && <p className="text-sm text-red-600">{cardError}</p>}

          <button
            type="button"
            ref={payButtonRef}
            onClick={handlePay}
            disabled={submitting || rendering || !renderedRef.current}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors hover:bg-primary/90"
          >
            {rendering ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {isRTL ? 'جاري التحميل…' : 'Loading…'}</>
            ) : submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {isRTL ? 'جاري المعالجة…' : 'Processing…'}</>
            ) : (
              <><Lock className="w-4 h-4" /> {isRTL ? 'ادفع الآن' : 'Pay now'}</>
            )}
          </button>
        </div>
    </div>
  );
}