// Notificaciones de citas: al owner por SMS (Twilio) y al cliente también
// por SMS. Habían pasado brevemente a email (Resend) para el owner por
// costo, pero el owner las quiere por SMS — vuelve a Twilio para las tres.
// notifyOwnerOfBooking  — nueva cita creada (al owner)
// notifyOwnerOfCancellation — cita cancelada por el cliente (al owner)
// notifyOwnerOfConsultation — nueva consulta de voz dejada por IVR (al owner)
// notifyCustomerOfBooking — confirmación de la cita (al cliente)

import { getOwnerPhone, getNotaryProfile } from './notaryProfile';
import { sendSms } from './twilioSms';
import { formatDateEs, formatDateShort, formatHour } from './timeSlots';

async function ownerE164(): Promise<string | null> {
  const raw = await getOwnerPhone().catch(() => '');
  const digits = raw.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return null;
  return `+1${digits}`;
}

async function sendOwnerSms(body: string): Promise<void> {
  const to = await ownerE164();
  if (!to) {
    console.warn('[notifyOwner] Missing/invalid owner phone — skipping SMS');
    return;
  }
  await sendSms(to, body);
}

interface BookingNotifyPayload {
  customerName: string;
  customerPhone: string;      // 10 dígitos
  slotIso: string;            // "YYYY-MM-DDTHH:00:00"
  notes?: string;             // qué necesita el customer
}

export async function notifyOwnerOfBooking(b: BookingNotifyPayload): Promise<void> {
  const phone = formatPhone(b.customerPhone);
  const when = formatSlot(b.slotIso);
  // Truncamos notes para no explotar el SMS a muchos segmentos (Twilio
  // cobra por segmento de 160 chars).
  const notesLine = b.notes && b.notes.trim().length > 0
    ? `\nNeeds: ${b.notes.trim().slice(0, 100)}`
    : '';

  await sendOwnerSms(
    `Notary Garcia: new appointment\n${b.customerName} · ${phone}\n${when}${notesLine}`
  );
}

export async function notifyCustomerOfBooking(b: {
  customerPhone: string;   // 10 dígitos
  slotDate: string;        // "YYYY-MM-DD"
  slotHour: number;        // 8..19
}): Promise<void> {
  const profile = await getNotaryProfile().catch(() => null);
  const businessName = profile?.businessName || 'your notary';
  const addressLine = profile?.businessAddress ? `\n${profile.businessAddress}` : '';
  const when = `${formatDateShort(b.slotDate)} at ${formatHour(b.slotHour)}`;
  const whenEs = `${formatDateEs(b.slotDate)} a las ${formatHour(b.slotHour)}`;

  const digits = (b.customerPhone || '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return;

  await sendSms(
    `+1${digits}`,
    `Your appointment with ${businessName} is confirmed for ${when}.${addressLine}\n\n` +
    `Su cita con ${businessName} está confirmada para el ${whenEs}.${addressLine}`,
  );
}

export interface CancellationNotifyPayload {
  customerName: string;
  customerPhone: string;
  slotIso: string;
}

export async function notifyOwnerOfCancellation(b: CancellationNotifyPayload): Promise<void> {
  const phone = formatPhone(b.customerPhone);
  const when = formatSlot(b.slotIso);

  await sendOwnerSms(
    `Notary Garcia: appointment cancelled\n${b.customerName} · ${phone}\n${when}`
  );
}

export async function notifyOwnerOfConsultation(callerPhone: string, lang: string): Promise<void> {
  const phone = formatPhone(callerPhone);
  await sendOwnerSms(
    `Notary Garcia: new voice consultation\n${phone}\nLang: ${lang.toUpperCase()}`
  );
}

function formatPhone(p: string): string {
  const d = (p || '').replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return p;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// "2026-07-18T14:00:00" → "Sat Jul 18, 2 PM"
function formatSlot(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):/);
  if (!m) return iso;
  const [, y, mo, d, hh] = m;
  const h = parseInt(hh, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const twelve = h % 12 === 0 ? 12 : h % 12;
  const date = new Date(`${y}-${mo}-${d}T12:00:00`);
  const dow = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'America/Chicago',
  }).format(date);
  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'America/Chicago',
  }).format(date);
  return `${dow} ${monthName} ${parseInt(d, 10)}, ${twelve} ${suffix}`;
}
