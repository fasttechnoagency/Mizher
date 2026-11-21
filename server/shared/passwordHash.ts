// @ts-nocheck
// Server-side password hashing using PBKDF2 (Web Crypto / SubtleCrypto).
// Used by provider auth functions so credentials are never stored in plaintext.
// Format: "pbkdf2:<iterations>:<base64-salt>:<base64-hash>"

const ITERATIONS = 100000;
const HASH_BITS = 256;
const SALT_BYTES = 16;

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromB64(str: string): Uint8Array {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function hashPassword(plaintext: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(plaintext), 'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    HASH_BITS
  );
  return `pbkdf2:${ITERATIONS}:${toB64(salt.buffer)}:${toB64(hash)}`;
}

export async function verifyPassword(plaintext: string, stored: string): Promise<boolean> {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    // Legacy plaintext credentials are rejected — they must be re-issued.
    return false;
  }
  const iter = Number(parts[1]);
  const salt = fromB64(parts[2]);
  const storedHash = fromB64(parts[3]);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(plaintext), 'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
    keyMaterial,
    storedHash.length * 8
  );
  const hashBytes = new Uint8Array(hash);
  if (hashBytes.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hashBytes.length; i++) diff |= hashBytes[i] ^ storedHash[i];
  return diff === 0;
}