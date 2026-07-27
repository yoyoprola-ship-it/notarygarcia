'use client';
import { useState } from 'react';
import AppointmentSection from './components/AppointmentSection';
import CancelSection from './components/CancelSection';

// Landing pública de Notary Garcia. Portea la sección de la app original
// (lafayette-market/app/services/providers/NotaryJose) como subdomain
// propio. Bilingüe EN/ES — el switch está arriba a la derecha.
// ivrPhone/directPhone vienen del server component en page.tsx (leídos en
// vivo del perfil central) — son dos números distintos: el de Twilio/IVR
// (robot de voz) y el personal/directo del notario.
//
// Misma paleta que siempre (amber/stone/slate) — este pase solo sube el
// nivel de pulido visual: tipografía display (Fraunces, la misma que usa
// NotaryHost), badges en vez del placeholder "—", profundidad con
// gradientes/sombras suaves, y una marca de sello que refuerza que esto
// es un servicio oficial, no una plantilla genérica.

function formatPhone(e164: string): string {
  const d = e164.replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return e164;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function SealMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" className="fill-amber-800" />
      <path
        d="M8 12.4l2.6 2.6L16.4 9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
      {children}
    </span>
  );
}

// ─── Copy bilingüe ─────────────────────────────────────────────

interface CopyBlock {
  nav: { services: string; book: string; cancel: string; location: string; language: string };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaIvrLabel: string;
    ctaDirectLabel: string;
  };
  servicesEyebrow: string;
  servicesTitle: string;
  services: { icon: string; title: string; desc: string }[];
  locationEyebrow: string;
  locationTitle: string;
  directions: string;
  footerTagline: string;
  footer: string;
}

const COPY: { en: CopyBlock; es: CopyBlock } = {
  en: {
    nav: { services: 'Services', book: 'Book', cancel: 'Cancel appt', location: 'Location', language: 'ES' },
    hero: {
      eyebrow: 'Bilingual notary public — Lafayette, Louisiana',
      title: 'Jose E. Garcia',
      subtitle:
        'Notary public serving Lafayette and surrounding parishes. Powers of attorney, immigration forms, contracts, tax preparation — English and Spanish, in one place.',
      cta: 'Request an appointment',
      ctaIvrLabel: 'Check appointment date · voice consultation',
      ctaDirectLabel: 'Direct number',
    },
    servicesEyebrow: 'What we offer',
    servicesTitle: 'Services',
    services: [
      {
        icon: '✍️',
        title: 'Powers of Attorney',
        desc: 'General, special, and durable powers of attorney for any legal matter requiring authorized representation.',
      },
      {
        icon: '🏠',
        title: 'Purchase & Sale',
        desc: 'Real estate transactions, purchase-sale agreements, and property transfer documentation.',
      },
      {
        icon: '📋',
        title: 'Contracts',
        desc: 'Business contracts, personal agreements, and legally binding document notarization.',
      },
      {
        icon: '💼',
        title: 'Taxes',
        desc: 'Tax preparation and filing assistance for individuals, families, and small businesses.',
      },
      {
        icon: '🗽',
        title: 'USCIS / NVC Forms',
        desc: 'Immigration petitions, USCIS applications, and National Visa Center document preparation.',
      },
      {
        icon: '🛡️',
        title: 'Asylum Assistance',
        desc: 'Guidance and document preparation for asylum seekers and their families.',
      },
      {
        icon: '🛂',
        title: 'Passports',
        desc: 'Passport application assistance, passport photos, and official document notarization.',
      },
      {
        icon: '🏛️',
        title: 'Consular Appointments',
        desc: 'Scheduling assistance and full document preparation for consular appointments.',
      },
    ],
    locationEyebrow: 'Visit us',
    locationTitle: 'Location',
    directions: 'Get directions',
    footerTagline: 'Bilingual notary public',
    footer: 'Notary services in Lafayette, LA · English and Spanish',
  },
  es: {
    nav: { services: 'Servicios', book: 'Reservar', cancel: 'Cancelar cita', location: 'Ubicación', language: 'EN' },
    hero: {
      eyebrow: 'Notario público bilingüe — Lafayette, Luisiana',
      title: 'Jose E. Garcia',
      subtitle:
        'Notario público al servicio de Lafayette y las parroquias vecinas. Poderes, formas de inmigración, contratos, impuestos — en inglés y español, en un solo lugar.',
      cta: 'Solicitar una cita',
      ctaIvrLabel: 'Verificar fecha de cita · consulta de voz',
      ctaDirectLabel: 'Número directo',
    },
    servicesEyebrow: 'Qué ofrecemos',
    servicesTitle: 'Servicios',
    services: [
      {
        icon: '✍️',
        title: 'Poderes',
        desc: 'Poderes generales, especiales y duraderos para cualquier asunto legal que requiera representación autorizada.',
      },
      {
        icon: '🏠',
        title: 'Compra-venta',
        desc: 'Transacciones inmobiliarias, contratos de compra-venta y documentación de transferencia de propiedad.',
      },
      {
        icon: '📋',
        title: 'Contratos',
        desc: 'Contratos comerciales, acuerdos personales y notarización de documentos legalmente vinculantes.',
      },
      {
        icon: '💼',
        title: 'Impuestos',
        desc: 'Preparación y presentación de impuestos para individuos, familias y pequeños negocios.',
      },
      {
        icon: '🗽',
        title: 'Formas USCIS / NVC',
        desc: 'Peticiones de inmigración, solicitudes de USCIS y preparación de documentos para el National Visa Center.',
      },
      {
        icon: '🛡️',
        title: 'Asilo',
        desc: 'Orientación y preparación de documentos para solicitantes de asilo y sus familias.',
      },
      {
        icon: '🛂',
        title: 'Pasaportes',
        desc: 'Asistencia con solicitudes de pasaporte, fotos y notarización de documentos oficiales.',
      },
      {
        icon: '🏛️',
        title: 'Citas consulares',
        desc: 'Asistencia con el agendamiento y preparación completa de documentos para citas consulares.',
      },
    ],
    locationEyebrow: 'Visítanos',
    locationTitle: 'Ubicación',
    directions: 'Cómo llegar',
    footerTagline: 'Notario público bilingüe',
    footer: 'Servicios notariales en Lafayette, LA · Inglés y español',
  },
};

type Lang = 'en' | 'es';

export default function HomeClient({
  ivrPhone,
  directPhone,
}: {
  ivrPhone: string;
  directPhone: string;
}) {
  const [lang, setLang] = useState<Lang>('en');
  const t = COPY[lang];

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar lang={lang} onToggleLang={() => setLang(lang === 'en' ? 'es' : 'en')} t={t} />
      <Hero t={t} ivrPhone={ivrPhone} directPhone={directPhone} />
      <ServicesGrid t={t} />
      <AppointmentSection lang={lang} />
      <CancelSection lang={lang} />
      <LocationSection t={t} />
      <Footer t={t} />
    </main>
  );
}

function TopBar({
  lang,
  onToggleLang,
  t,
}: {
  lang: Lang;
  onToggleLang: () => void;
  t: CopyBlock;
}) {
  return (
    <header className="border-b border-stone-200 bg-white/85 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SealMark className="w-7 h-7" />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tracking-tight text-slate-900">
              Notary Garcia
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Lafayette, LA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#services"
            className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
          >
            {t.nav.services}
          </a>
          <a
            href="#cancel"
            className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
          >
            {t.nav.cancel}
          </a>
          <a
            href="#location"
            className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
          >
            {t.nav.location}
          </a>
          <a
            href="#book"
            className="text-xs sm:text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 px-4 py-2 rounded-full shadow-sm shadow-amber-800/20 transition-colors"
          >
            {t.nav.book}
          </a>
          <button
            onClick={onToggleLang}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-amber-800 border border-amber-300 hover:bg-amber-50 rounded-full transition-colors"
            title={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}
          >
            {t.nav.language}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({
  t,
  ivrPhone,
  directPhone,
}: {
  t: CopyBlock;
  ivrPhone: string;
  directPhone: string;
}) {
  return (
    <section className="relative px-6 pt-16 pb-24 sm:pt-24 overflow-hidden">
      {/* Soft gradient depth behind the hero — pure CSS, no extra assets */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(180,83,9,0.10), transparent 70%),' +
            'radial-gradient(40% 35% at 85% 15%, rgba(180,83,9,0.06), transparent 70%)',
        }}
      />

      <div className="max-w-3xl mx-auto text-center">
        <div className="relative mx-auto mb-8 w-32 h-32 sm:w-40 sm:h-40">
          <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-amber-700/30 ring-offset-4 ring-offset-stone-50 shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/jose.jpg"
              alt="Jose E. Garcia — Notary Public"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'top center' }}
            />
          </div>
          <span className="absolute bottom-1 right-1 grid place-items-center w-9 h-9 rounded-full bg-white shadow-md ring-1 ring-stone-200">
            <SealMark className="w-6 h-6" />
          </span>
        </div>

        <Eyebrow>{t.hero.eyebrow}</Eyebrow>
        <h1 className="font-display text-5xl sm:text-6xl font-semibold tracking-tight text-slate-900 mb-6 leading-[1.05]">
          {t.hero.title}
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10">
          {t.hero.subtitle}
        </p>
        <div className="flex flex-col items-center gap-3">
          <a
            href="#book"
            className="px-8 py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-full shadow-lg shadow-amber-800/25 hover:-translate-y-0.5 transition-all"
          >
            {t.hero.cta}
          </a>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`tel:${ivrPhone}`}
              className="px-6 py-3 bg-white border border-stone-200 hover:border-amber-300 hover:shadow-sm text-slate-800 rounded-xl transition-all flex flex-col items-center"
            >
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {t.hero.ctaIvrLabel}
              </span>
              <span className="font-bold">{formatPhone(ivrPhone)}</span>
            </a>
            <a
              href={`tel:${directPhone}`}
              className="px-6 py-3 bg-white border border-stone-200 hover:border-amber-300 hover:shadow-sm text-slate-800 rounded-xl transition-all flex flex-col items-center"
            >
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {t.hero.ctaDirectLabel}
              </span>
              <span className="font-bold">{formatPhone(directPhone)}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesGrid({ t }: { t: CopyBlock }) {
  return (
    <section id="services" className="px-6 py-16 sm:py-20 bg-white border-y border-stone-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <Eyebrow>{t.servicesEyebrow}</Eyebrow>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            {t.servicesTitle}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.services.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-amber-300 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 grid place-items-center rounded-xl bg-amber-50 border border-amber-100 text-xl mb-4">
                {s.icon}
              </div>
              <p className="text-sm font-bold text-slate-900 mb-2">{s.title}</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationSection({ t }: { t: CopyBlock }) {
  return (
    <section id="location" className="px-6 py-16 sm:py-20 bg-white border-t border-stone-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Eyebrow>{t.locationEyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-900">{t.locationTitle}</h2>
          <p className="text-slate-600 mt-2">100 Eva Dr, Lafayette, LA 70508</p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-md">
          <iframe
            title="Notary Garcia location"
            src="https://maps.google.com/maps?q=100+Eva+Dr+Lafayette+LA+70508&output=embed&z=15"
            width="100%"
            height="380"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="mt-5">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=100+Eva+Dr+Lafayette+LA+70508"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-800 hover:text-amber-900 border border-amber-200 hover:bg-amber-50 rounded-full px-4 py-2 transition-colors"
          >
            {t.directions} →
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer({ t }: { t: CopyBlock }) {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SealMark className="w-5 h-5" />
          <div>
            <p className="text-sm font-semibold text-slate-900 font-display">Notary Garcia</p>
            <p className="text-xs text-slate-500">{t.footerTagline}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center">{t.footer}</p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <a href="/privacy" className="hover:text-slate-800 underline decoration-stone-300 hover:decoration-slate-500">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-slate-800 underline decoration-stone-300 hover:decoration-slate-500">
            Terms &amp; Conditions
          </a>
        </div>
      </div>
    </footer>
  );
}
