/**
 * Returns the provider session stored by the credential-based login flow.
 * Shape: { type: 'doctor'|'retailer'|'lab'|'hospital'|'clinic', id: string, name: string, credentialId: string, sessionToken: string } | null
 */
export function getProviderSession() {
  try {
    const raw = sessionStorage.getItem('provider_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearProviderSession() {
  sessionStorage.removeItem('provider_session');
}