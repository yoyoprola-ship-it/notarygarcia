import { NextRequest } from 'next/server';
import { validateTwilioSignature } from '@/app/lib/validateTwilio';
import { getIvrConfig } from '@/app/lib/ivrConfig';
import { adminDb } from '@/app/lib/firebaseAdmin';
import { formatDateShort, formatHour } from '@/app/lib/timeSlots';
import { OPERATION_TZ } from '@/app/types';

const BASE = process.env.SITE_URL ?? 'https://notarygarcia.notaryhost.com';

function twiml(xml: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${xml}`, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

function formatDateEs(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: OPERATION_TZ,
  }).format(d);
}

interface UpcomingAppointment {
  slotDate: string;
  slotHour: number;
}

// El caller puede tener varias citas confirmadas — solo anunciamos la
// más próxima (la primera al ordenar por slot ascendente).
async function findUpcomingAppointment(callerE164: string): Promise<UpcomingAppointment | null> {
  const digits = callerE164.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return null;

  const snap = await adminDb
    .collection('notarygarcia_bookings')
    .where('customerPhone', '==', digits)
    .get();

  const now = new Date().toISOString().slice(0, 19);
  const upcoming = snap.docs
    .map((d) => d.data() as { status: string; slot: string; slotDate: string; slotHour: number })
    .filter((b) => b.status === 'confirmed' && b.slot >= now)
    .sort((a, b) => a.slot.localeCompare(b.slot));

  return upcoming[0] ?? null;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => { params[k] = v.toString(); });

  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  const sig = request.headers.get('X-Twilio-Signature') ?? '';
  const url = `${BASE}/api/twilio/voice/welcome`;
  if (authToken && sig && !validateTwilioSignature(authToken, sig, url, params)) {
    return new Response('Forbidden', { status: 403 });
  }

  const cfg = await getIvrConfig();

  const callerE164 = params.From ?? '';
  const appointment = await findUpcomingAppointment(callerE164).catch(() => null);

  const appointmentSay = appointment ? `
  <Say voice="${cfg.voices.en}">You have an upcoming appointment on ${formatDateShort(appointment.slotDate)} at ${formatHour(appointment.slotHour)}.</Say>
  <Pause length="1"/>
  <Say voice="${cfg.voices.es}">Usted tiene una cita próxima el ${formatDateEs(appointment.slotDate)} a las ${formatHour(appointment.slotHour)}.</Say>
  <Pause length="1"/>` : '';

  return twiml(`
<Response>${appointmentSay}
  <Gather numDigits="1" action="${BASE}/api/twilio/voice/lang-select" method="POST" timeout="10">
    <Say voice="${cfg.voices.en}">${cfg.intro.en}</Say>
    <Pause length="1"/>
    <Say voice="${cfg.voices.es}">${cfg.intro.es}</Say>
    <Pause length="1"/>
    <Say voice="${cfg.voices.en}">${cfg.langPrompt.en}</Say>
    <Pause length="1"/>
    <Say voice="${cfg.voices.es}">${cfg.langPrompt.es}</Say>
  </Gather>
  <Redirect>${BASE}/api/twilio/voice/welcome</Redirect>
</Response>`);
}
