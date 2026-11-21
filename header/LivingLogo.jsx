import React from 'react';

/**
 * <LivingLogo /> — the Header brand mark: the original Mizher logo icon and
 * wordmark, restored to their clean state. All decorative line/arc/sheen
 * layers have been removed per request. Renders a fragment so the two
 * elements stay direct flex children of the existing <Link>.
 */
const LOGO_SRC =
  '/__l5e/assets-v1/f60c9432-b4d1-4af9-85a9-7b6eafad3232/9b65021af_WhatsAppImage2026-06-10at92523AM.jpeg';

export default function LivingLogo({ isRTL }) {
  const wordmark = isRTL ? 'مجتمع مزهر الطبي' : 'Mizher Medical Hub';

  return (
    <>
      <span className="relative inline-flex items-center justify-center rounded-full">
        <img
          src={LOGO_SRC}
          alt="Mizher Clinic"
          className="w-8 h-8 object-contain rounded-full bg-white border border-gray-100"
        />
      </span>
      <span className="text-lg font-semibold text-teal-800 font-heading">
        {wordmark}
      </span>
    </>
  );
}