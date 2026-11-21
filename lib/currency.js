// All prices are stored in JOD. Arabic displays JOD; English and Azerbaijani display USD.
export const JOD_TO_USD_RATE = 1.41;

// Marketplace always displays the original JOD price, regardless of language.
// PayPal still converts JOD -> USD server-side; the Marketplace UI never shows
// the converted USD amount. Existing product prices are already stored in JOD,
// so this never re-converts or multiplies by the exchange rate.
export function formatPriceJOD(amountJOD, lang) {
  const amount = Number(amountJOD) || 0;
  const formatted = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return lang === 'ar' ? `${formatted} د.أ` : `${formatted} JOD`;
}

export function formatPrice(amountJOD, lang) {
  const amount = Number(amountJOD) || 0;
  if (lang === 'ar') {
    const formatted = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
    return `${formatted} د.أ`;
  }
  const usd = amount * JOD_TO_USD_RATE;
  return `$${usd.toFixed(2)}`;
}