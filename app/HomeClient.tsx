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
// Paleta ink + gold ("firma/sello"), a pedido explícito: look de marca
// notarial establecida y premium, no de plantilla genérica. Se agregan
// también dos secciones nuevas (cómo funciona + fila de confianza) que
// no existían antes, para darle más contenido real al sitio.

function formatPhone(e164: string): string {
  const d = e164.replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return e164;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function SealMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <path
        d="M8 12.4l2.6 2.6L16.4 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-5">
      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
      {children}
    </span>
  );
}

// ─── Copy bilingüe ─────────────────────────────────────────────

interface CopyBlock {
  nav: { services: string; book: string; cancel: string; location: string; language: string };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    cta: string;
    ctaIvrLabel: string;
    ctaDirectLabel: string;
  };
  howEyebrow: string;
  howTitle: string;
  howSteps: { title: string; desc: string }[];
  trust: { title: string; desc: string }[];
  servicesEyebrow: string;
  servicesTitle: string;
  services: { icon: string; title: string; desc: string }[];
  locationEyebrow: string;
  locationTitle: string;
  directions: string;
  footerTagline: string;
  footerAccent: string;
  footer: string;
}

const COPY: { en: CopyBlock; es: CopyBlock } = {
  en: {
    nav: { services: 'Services', book: 'Book', cancel: 'Cancel appt', location: 'Location', language: 'ES' },
    hero: {
      eyebrow: 'Bilingual notary public — Lafayette, Louisiana',
      titleLine1: 'Jose E.',
      titleLine2: 'Garcia',
      subtitle:
        'Notary public serving Lafayette and surrounding parishes. Powers of attorney, immigration forms, contracts, tax preparation — English and Spanish, in one place.',
      cta: 'Request an appointment',
      ctaIvrLabel: 'Check appointment date · voice consultation',
      ctaDirectLabel: 'Direct number',
    },
    howEyebrow: 'How it works',
    howTitle: 'Booking is simple',
    howSteps: [
      { title: 'Pick a day & time', desc: 'Choose an open slot from the calendar below — no back-and-forth.' },
      { title: 'Verify by text', desc: 'A quick SMS code confirms it’s really you booking the slot.' },
      { title: 'You’re booked', desc: 'Confirmation and a reminder land by text before your appointment.' },
    ],
    trust: [
      { title: 'Bilingual, start to finish', desc: 'Every step — site, texts, phone line — works in English and Spanish.' },
      { title: 'Text confirmations & reminders', desc: 'You’ll always know your appointment is locked in.' },
      { title: 'Serving Lafayette & nearby parishes', desc: 'Mobile notary services across the Lafayette area.' },
      { title: 'A real person, not a call center', desc: 'One notary, one direct line — no scripts.' },
    ],
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
    footerAccent: 'Se habla español.',
    footer: 'Notary services in Lafayette, LA · English and Spanish',
  },
  es: {
    nav: { services: 'Servicios', book: 'Reservar', cancel: 'Cancelar cita', location: 'Ubicación', language: 'EN' },
    hero: {
      eyebrow: 'Notario público bilingüe — Lafayette, Luisiana',
      titleLine1: 'Jose E.',
      titleLine2: 'Garcia',
      subtitle:
        'Notario público al servicio de Lafayette y las parroquias vecinas. Poderes, formas de inmigración, contratos, impuestos — en inglés y español, en un solo lugar.',
      cta: 'Solicitar una cita',
      ctaIvrLabel: 'Verificar fecha de cita · consulta de voz',
      ctaDirectLabel: 'Número directo',
    },
    howEyebrow: 'Cómo funciona',
    howTitle: 'Agendar es simple',
    howSteps: [
      { title: 'Elegí día y hora', desc: 'Elegí un turno libre en el calendario de abajo — sin idas y vueltas.' },
      { title: 'Verificá por SMS', desc: 'Un código rápido por mensaje confirma que sos vos quien reserva.' },
      { title: 'Listo, tenés tu cita', desc: 'Confirmación y recordatorio te llegan por mensaje antes de tu cita.' },
    ],
    trust: [
      { title: 'Bilingüe, de principio a fin', desc: 'Sitio, mensajes y línea telefónica — todo en inglés y español.' },
      { title: 'Confirmaciones y recordatorios por SMS', desc: 'Siempre vas a saber que tu cita quedó confirmada.' },
      { title: 'Lafayette y parroquias cercanas', desc: 'Servicio de notario móvil en toda el área de Lafayette.' },
      { title: 'Una persona real, no un call center', desc: 'Un solo notario, una línea directa — sin libretos.' },
    ],
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
    footerAccent: 'English also spoken.',
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
      <HowItWorks t={t} />
      <TrustRow t={t} />
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
    <header className="border-b border-gold/20 bg-ink/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-9 h-9 rounded-full border border-gold/50 text-gold">
            <SealMark className="w-5 h-5" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tracking-tight text-cream">
              Notary Garcia
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
              Lafayette, LA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="#services" className="hidden sm:inline text-sm text-cream/70 hover:text-cream px-2">
            {t.nav.services}
          </a>
          <a href="#cancel" className="hidden sm:inline text-sm text-cream/70 hover:text-cream px-2">
            {t.nav.cancel}
          </a>
          <a href="#location" className="hidden sm:inline text-sm text-cream/70 hover:text-cream px-2">
            {t.nav.location}
          </a>
          <a
            href="#book"
            className="text-xs sm:text-sm font-bold text-ink-deep bg-gold hover:bg-gold-light px-4 py-2 rounded-full shadow-sm shadow-black/20 transition-colors"
          >
            {t.nav.book}
          </a>
          <button
            onClick={onToggleLang}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gold border border-gold/40 hover:bg-gold-soft rounded-full transition-colors"
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
    <section className="relative">
      {/* Full-bleed cover photo — the office portrait is the hero, not a
          small avatar. Gradient fade at the bottom blends it into the
          page background instead of hard-cutting to a flat color. */}
      <div className="relative w-full h-[86vh] min-h-[620px] max-h-[880px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-office.jpg"
          alt="Jose E. Garcia — Notary Public, in his Lafayette office"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '62% 22%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-12 sm:pb-16">
          <Eyebrow>{t.hero.eyebrow}</Eyebrow>
          <h1 className="font-display text-5xl sm:text-7xl font-semibold tracking-tight mb-5 leading-[1.02]">
            <span className="text-cream">{t.hero.titleLine1} </span>
            <span className="text-gold">{t.hero.titleLine2}</span>
          </h1>
          <p className="text-lg text-cream/80 max-w-xl mx-auto mb-8" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col items-center gap-3">
            <a
              href="#book"
              className="px-8 py-3 bg-gold hover:bg-gold-light text-ink-deep font-bold rounded-full shadow-lg shadow-black/40 hover:-translate-y-0.5 transition-all"
            >
              {t.hero.cta}
            </a>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`tel:${ivrPhone}`}
                className="px-6 py-3 bg-ink/60 backdrop-blur border border-gold/30 hover:border-gold/60 text-cream rounded-xl transition-all flex flex-col items-center"
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-cream/60">
                  {t.hero.ctaIvrLabel}
                </span>
                <span className="font-bold text-gold">{formatPhone(ivrPhone)}</span>
              </a>
              <a
                href={`tel:${directPhone}`}
                className="px-6 py-3 bg-ink/60 backdrop-blur border border-gold/30 hover:border-gold/60 text-cream rounded-xl transition-all flex flex-col items-center"
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-cream/60">
                  {t.hero.ctaDirectLabel}
                </span>
                <span className="font-bold text-gold">{formatPhone(directPhone)}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ t }: { t: CopyBlock }) {
  return (
    <section className="px-6 py-16 sm:py-20 bg-ink-deep border-y border-gold/15">
      <div className="max-w-5xl mx-auto text-center">
        <Eyebrow>{t.howEyebrow}</Eyebrow>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-cream mb-10">
          {t.howTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {t.howSteps.map((step, i) => (
            <div key={step.title} className="bg-ink-light border border-gold/20 rounded-2xl p-6 text-left">
              <span className="inline-grid place-items-center w-9 h-9 rounded-full border border-gold text-gold font-display font-semibold mb-4">
                {i + 1}
              </span>
              <p className="text-sm font-bold text-cream mb-2">{step.title}</p>
              <p className="text-xs text-cream/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustRow({ t }: { t: CopyBlock }) {
  return (
    <section className="px-6 py-16 sm:py-20 bg-ink">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {t.trust.map((item) => (
            <div key={item.title} className="flex items-start gap-4 bg-ink-light border border-gold/15 rounded-2xl p-5">
              <span className="grid place-items-center w-10 h-10 rounded-full border border-gold/40 text-gold shrink-0">
                <SealMark className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-cream mb-1">{item.title}</p>
                <p className="text-xs text-cream/60 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesGrid({ t }: { t: CopyBlock }) {
  return (
    <section id="services" className="px-6 py-16 sm:py-20 bg-ink-deep border-y border-gold/15">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <Eyebrow>{t.servicesEyebrow}</Eyebrow>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-cream">
            {t.servicesTitle}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.services.map((s) => (
            <div
              key={s.title}
              className="bg-ink-light border border-gold/20 rounded-2xl p-5 hover:border-gold/50 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 grid place-items-center rounded-full bg-gold-soft border border-gold/30 text-xl mb-4">
                {s.icon}
              </div>
              <p className="text-sm font-bold text-cream mb-2">{s.title}</p>
              <p className="text-xs text-cream/60 leading-relaxed">
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
    <section id="location" className="px-6 py-16 sm:py-20 bg-ink-deep border-t border-gold/15">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Eyebrow>{t.locationEyebrow}</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-cream">{t.locationTitle}</h2>
          <p className="text-cream/60 mt-2">100 Eva Dr, Lafayette, LA 70508</p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-gold/25 shadow-md">
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
            className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-gold-light border border-gold/40 hover:bg-gold-soft rounded-full px-4 py-2 transition-colors"
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
    <footer className="border-t border-gold/15 bg-ink">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-8 h-8 rounded-full border border-gold/40 text-gold">
            <SealMark className="w-4 h-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-cream font-display">Notary Garcia</p>
            <p className="text-xs text-cream/50">{t.footerTagline}</p>
          </div>
        </div>
        <p className="font-accent italic text-gold-light text-base">{t.footerAccent}</p>
        <div className="flex items-center gap-4 text-xs text-cream/50">
          <a href="/privacy" className="hover:text-cream underline decoration-gold/20 hover:decoration-gold/50">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-cream underline decoration-gold/20 hover:decoration-gold/50">
            Terms &amp; Conditions
          </a>
        </div>
      </div>
    </footer>
  );
}
