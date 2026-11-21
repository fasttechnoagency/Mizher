import { useEffect, useRef, useState } from 'react';

export default function useHostedCardButton({ sdk, createOrder, onApprove, onCancel, onError, isRTL }) {
  const hostRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let button;
    const host = hostRef.current;
    setStatus('loading');
    setError('');
    setOpened(false);
    const message = isRTL ? 'تعذّر تحميل الدفع بالبطاقة. أعد المحاولة.' : 'Card checkout could not load. Please try again.';

    async function mount() {
      try {
        if (!host || !sdk?.Buttons || !sdk.FUNDING?.CARD) {
          if (active) setStatus('unavailable');
          return;
        }
        host.replaceChildren();
        button = sdk.Buttons({
          fundingSource: sdk.FUNDING.CARD,
          style: { layout: 'vertical', shape: 'rect', height: 55 },
          createOrder,
          onApprove,
          onClick: () => { if (active) setOpened(true); },
          onCancel: (data) => {
            if (!active) return;
            setOpened(false);
            onCancel?.(data);
          },
          onError: (err) => {
            if (!active) return;
            setError(err?.message || message);
            onError?.(err);
          },
        });
        if (!button.isEligible()) {
          if (active) setStatus('unavailable');
          return;
        }
        await button.render(host);
        if (active) setStatus('ready');
      } catch (err) {
        if (!active) return;
        setError(err?.message || message);
        setStatus('failed');
      }
    }

    mount();
    return () => {
      active = false;
      // SDK close can reject when an in-progress render was interrupted.
      Promise.resolve().then(() => button?.close?.()).catch(() => {});
    };
  }, [sdk, createOrder, onApprove, onCancel, onError, isRTL, attempt]);

  return { hostRef, status, error, opened, retry: () => setAttempt((value) => value + 1) };
}