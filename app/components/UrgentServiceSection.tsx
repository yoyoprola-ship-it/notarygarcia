'use client';
import { useEffect, useRef, useState } from 'react';

// "Need my urgent service?" — only rendered while the notary is inside
// working hours (isOpenNow, computed server-side in page.tsx). Texts the
// owner and waits up to 1 minute for a "YES" reply before showing the
// address, polling /api/urgent-service/status every few seconds.

type Lang = 'en' | 'es';
type Phase = 'idle' | 'sending' | 'waiting' | 'confirmed' | 'expired' | 'cooldown' | 'error';

interface Copy {
  eyebrow: string;
  title: string;
  subtitle: string;
  button: string;
  waitingTitle: string;
  waitingBody: string;
  confirmedTitle: string;
  confirmedBody: string;
  directions: string;
  expiredTitle: string;
  expiredBody: string;
  cooldownBody: string;
  errorBody: string;
  tryAgain: string;
}

const COPY: Record<Lang, Copy> = {
  en: {
    eyebrow: 'Need it now?',
    title: 'Urgent service',
    subtitle: "If the notary is free right now, we'll connect you within 2 minutes.",
    button: 'I need urgent service',
    waitingTitle: 'Asking the notary…',
    waitingBody: "We've texted the notary. Waiting for a reply —",
    confirmedTitle: "The notary is available now!",
    confirmedBody: 'Please head to:',
    directions: 'Get directions',
    expiredTitle: 'No response yet',
    expiredBody: "The notary couldn't confirm availability right now. Please book a regular appointment below, or try again in a few minutes.",
    cooldownBody: "You've already sent a few urgent requests recently. Please wait a bit before trying again.",
    errorBody: 'Something went wrong. Please try again.',
    tryAgain: 'Try again',
  },
  es: {
    eyebrow: '¿Lo necesitás ahora?',
    title: 'Servicio urgente',
    subtitle: 'Si el notario está libre ahora mismo, te conectamos en 2 minutos.',
    button: 'Necesito servicio urgente',
    waitingTitle: 'Consultando al notario…',
    waitingBody: 'Le enviamos un mensaje al notario. Esperando respuesta —',
    confirmedTitle: '¡El notario está disponible ahora!',
    confirmedBody: 'Por favor dirigite a:',
    directions: 'Cómo llegar',
    expiredTitle: 'Sin respuesta por ahora',
    expiredBody: 'El notario no pudo confirmar disponibilidad en este momento. Podés agendar una cita normal más abajo, o volver a intentar en unos minutos.',
    cooldownBody: 'Ya enviaste varias solicitudes urgentes recientemente. Por favor esperá un poco antes de volver a intentar.',
    errorBody: 'Algo salió mal. Intentá de nuevo.',
    tryAgain: 'Intentar de nuevo',
  },
};

const WINDOW_SECONDS = 120;
const POLL_MS = 3_000;

export default function UrgentServiceSection({ lang, isOpenNow }: { lang: Lang; isOpenNow: boolean }) {
  const t = COPY[lang];
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(WINDOW_SECONDS);
  const [address, setAddress] = useState('');
  const requestIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopTimers() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    pollRef.current = null;
    tickRef.current = null;
  }

  useEffect(() => () => stopTimers(), []);

  async function handleClick() {
    setPhase('sending');
    try {
      const res = await fetch('/api/urgent-service/request', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPhase(res.status === 429 ? 'cooldown' : 'error');
        return;
      }

      requestIdRef.current = data.id;
      const expiresAt: number = data.expiresAt;
      setPhase('waiting');
      setSecondsLeft(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));

      tickRef.current = setInterval(() => {
        const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
        setSecondsLeft(left);
        if (left <= 0) {
          stopTimers();
          setPhase((p) => (p === 'waiting' ? 'expired' : p));
        }
      }, 1000);

      pollRef.current = setInterval(async () => {
        if (!requestIdRef.current) return;
        try {
          const r = await fetch(`/api/urgent-service/status?id=${requestIdRef.current}`, { cache: 'no-store' });
          const d = await r.json().catch(() => ({}));
          if (!r.ok) return;
          if (d.status === 'confirmed') {
            stopTimers();
            setAddress(d.address || '');
            setPhase('confirmed');
          } else if (d.status === 'expired') {
            stopTimers();
            setPhase('expired');
          }
        } catch {
          // transient — keep polling until the 1-minute window ends
        }
      }, POLL_MS);
    } catch {
      setPhase('error');
    }
  }

  function reset() {
    stopTimers();
    requestIdRef.current = null;
    setPhase('idle');
    setSecondsLeft(WINDOW_SECONDS);
  }

  if (!isOpenNow) return null;

  // Lives inline in the Hero, right after the subtitle and above every
  // other CTA — this is meant to read as THE most important action on the
  // page, not just another section further down.
  return (
    <div className="mb-7 flex flex-col items-center">
      {(phase === 'idle' || phase === 'sending') && (
        <>
          <button
            onClick={handleClick}
            disabled={phase === 'sending'}
            className="urgent-pulse-bg relative px-10 py-4 text-ink-deep font-black text-lg sm:text-xl rounded-full shadow-2xl shadow-black/50 ring-2 ring-gold/40 hover:-translate-y-0.5 transition-transform disabled:opacity-60"
          >
            {t.button}
          </button>
          <p className="text-xs text-cream/60 mt-3 max-w-xs">{t.subtitle}</p>
        </>
      )}

      {phase === 'waiting' && (
        <div className="bg-ink/70 backdrop-blur border border-gold/40 rounded-2xl px-7 py-5 flex flex-col items-center gap-1 shadow-xl shadow-black/40">
          <p className="text-sm font-bold text-cream">{t.waitingTitle}</p>
          <p className="text-xs text-cream/60">{t.waitingBody}</p>
          <span className="font-display text-4xl font-black text-gold tabular-nums">{secondsLeft}s</span>
        </div>
      )}

      {phase === 'confirmed' && (
        <div className="bg-gold/15 backdrop-blur border border-gold/50 rounded-2xl px-7 py-6 max-w-sm shadow-xl shadow-black/40">
          <p className="text-base font-bold text-gold-light mb-2">{t.confirmedTitle}</p>
          <p className="text-sm text-cream/70 mb-1">{t.confirmedBody}</p>
          <p className="text-lg font-bold text-cream mb-4">{address}</p>
          {address && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-ink-deep bg-gold hover:bg-gold-light rounded-full px-5 py-2.5 transition-colors"
            >
              {t.directions} →
            </a>
          )}
        </div>
      )}

      {phase === 'expired' && (
        <div className="bg-ink/70 backdrop-blur border border-red-400/40 rounded-2xl px-7 py-5 max-w-sm shadow-xl shadow-black/40">
          <p className="text-sm font-bold text-red-200 mb-2">{t.expiredTitle}</p>
          <p className="text-sm text-red-100/80 mb-4">{t.expiredBody}</p>
          <button
            onClick={reset}
            className="text-xs font-bold uppercase tracking-wider text-red-200 border border-red-400/40 hover:bg-red-950/50 rounded-full px-4 py-2"
          >
            {t.tryAgain}
          </button>
        </div>
      )}

      {phase === 'cooldown' && (
        <div className="bg-ink/70 backdrop-blur border border-gold/40 rounded-2xl px-7 py-5 max-w-sm shadow-xl shadow-black/40">
          <p className="text-sm text-cream/80 mb-4">{t.cooldownBody}</p>
          <button
            onClick={reset}
            className="text-xs font-bold uppercase tracking-wider text-gold border border-gold/40 hover:bg-gold-soft rounded-full px-4 py-2"
          >
            {t.tryAgain}
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div className="bg-ink/70 backdrop-blur border border-red-400/40 rounded-2xl px-7 py-5 max-w-sm shadow-xl shadow-black/40">
          <p className="text-sm text-red-100/80 mb-4">{t.errorBody}</p>
          <button
            onClick={reset}
            className="text-xs font-bold uppercase tracking-wider text-red-200 border border-red-400/40 hover:bg-red-950/50 rounded-full px-4 py-2"
          >
            {t.tryAgain}
          </button>
        </div>
      )}
    </div>
  );
}
