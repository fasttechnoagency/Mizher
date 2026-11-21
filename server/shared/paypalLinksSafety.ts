// @ts-nocheck
// Release gate is deliberately in reviewed server code, not a browser flag or
// a secret that could accidentally turn an unverified payment flow live.
export const PAYMENT_LINKS_RELEASE = Object.freeze({
  enabled: false,
  supportedReusableModes: ['MULTIPLE'],
  reasons: [
    'PayPal explicitly states Payment Links do not support single-use links or expiration. Repeated payments cannot be prevented by merely deleting a link after a webhook.',
    'Capture and related order IDs are documented, but a guaranteed link-resource/product_id-to-transaction relationship is not established. No amount-only, note, or browser-reference matching is allowed.',
    'A genuine signed Sandbox webhook and all four checkout journeys have not passed verification.',
  ],
  reference: 'https://developer.paypal.com/payment-links-buttons/faq#do-payment-links-expire',
  transactionIdentifiersReference: 'https://www.paypal.com/us/cshelp/article/paypal-pay-links-and-buttons-troubleshooting-tips-help1137',
  alternativeReference: 'https://developer.paypal.com/payment-links-buttons/overview#choose-between-invoicing-and-payment-links',
});

export function paymentLinksBlockedResponse() {
  return Response.json({
    error: 'Payment Links checkout is staged and unavailable until payment matching and repeat-payment protection are verified. No new payment or fulfillment was initiated.',
    code: 'PAYMENT_LINKS_NOT_VERIFIED',
    reasons: PAYMENT_LINKS_RELEASE.reasons,
    retryable: false,
  }, { status: 409 });
}

export async function inspectPaymentLinksSpecification() {
  const response = await fetch('https://developer.paypal.com/api/payment-links-buttons/v1/schema.json', {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('PayPal API specification unavailable');
  const specification = await response.json();
  const schemas = specification.components?.schemas || {};
  return {
    documentedReusableModes: schemas.reusable?.enum || [],
    resourceEndpoints: Object.keys(specification.paths || {}),
    productIdSupported: Boolean(schemas.line_item?.properties?.product_id),
    singleUseDocumented: (schemas.reusable?.enum || []).some(value => value !== 'MULTIPLE'),
    resourceTransactionListingEndpoint: Object.keys(specification.paths || {}).some(path => /transaction|capture|order|context/.test(path)),
    documentationDistinguishesCaptureOrderAndResourceIds: true,
    productIdPropagationGuaranteedBySchema: false,
  };
}