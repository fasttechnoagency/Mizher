// @ts-nocheck
import { isSandbox, requestPaypalToken, paypalCredentialPresence, LIVE_URL, SANDBOX_URL } from './paypalRuntime';
import { PAYMENT_LINKS_RELEASE, inspectPaymentLinksSpecification } from './paypalLinksSafety';
import { inspectPaypalWebhookRegistrations } from './paypalWebhookValidation';

const SAFE_ERRORS = ['invalid_client', 'invalid_request', 'unauthorized_client', 'unsupported_grant_type', 'invalid_scope'];
function authenticationSummary(result) {
  return {
    attempted: Boolean(result),
    httpStatus: result?.status || null,
    accepted: Boolean(result?.ok),
    error: result?.data?.error ? (SAFE_ERRORS.includes(result.data.error) ? result.data.error : 'OTHER_PROVIDER_ERROR') : null,
    errorDescription: result?.data?.error_description === 'Client Authentication failed' ? 'Client Authentication failed' : null,
  };
}

export async function getPaypalDiagnostics(inspectSpecification = false) {
  const presence = paypalCredentialPresence();
  const sandbox = presence.clientIdPresent && presence.clientSecretPresent ? await requestPaypalToken(SANDBOX_URL) : null;
  // Authentication only, never a live payment or a configuration mutation.
  const live = sandbox?.status === 401 ? await requestPaypalToken(LIVE_URL) : null;
  const isLivePair = Boolean(live?.ok && sandbox?.status === 401 && sandbox?.data?.error === 'invalid_client');
  const scopes = sandbox?.ok ? String(sandbox.data.scope || '').split(/\s+/) : [];
  const registrationInspection = sandbox?.ok ? await inspectPaypalWebhookRegistrations(sandbox.data.access_token, SANDBOX_URL) : null;
  return {
    scope: 'current editor/test backend and its secrets; not a read of the last-published backend or its secret snapshot',
    environment: isSandbox() ? 'sandbox' : 'live',
    ...presence,
    sandboxAuthentication: authenticationSummary(sandbox),
    liveAuthentication: authenticationSummary(live),
    credentialDiagnosis: isLivePair ? 'LIVE_PAIR_REJECTED_BY_SANDBOX' : sandbox?.ok ? 'SANDBOX_PAIR_ACCEPTED' : 'SANDBOX_AUTHENTICATION_NOT_ESTABLISHED',
    explanation: isLivePair ? 'This exact pair authenticates on PayPal Live, but Sandbox rejects it as invalid_client. Use the existing Sandbox app client ID and secret together; changing PAYPAL_ENVIRONMENT alone does not convert live credentials into Sandbox credentials.' : sandbox?.ok ? 'The configured pair is accepted by Sandbox.' : 'No more specific cause is established by these authentication responses.',
    sandboxPaymentResourcesScope: sandbox?.ok ? scopes.some(scope => ['https://uri.paypal.com/services/checkout/payment-resources', 'https://uri.paypal.com/services/checkout/payment-resources/readwrite'].includes(scope)) : null,
    sandboxWebhookRegistration: registrationInspection ? {
      inspections: registrationInspection.inspections,
      exactMatchingRegistrations: registrationInspection.registrations.length,
      signatureDeliveryProven: false,
    } : { status: 'NOT_INSPECTED', reason: 'Sandbox authentication unavailable' },
    paymentLinks: PAYMENT_LINKS_RELEASE,
    specification: inspectSpecification ? await inspectPaymentLinksSpecification() : undefined,
    financialOperationsPerformed: false,
    paymentStateChanged: false,
  };
}