import { NextRequest } from 'next/server';
import { validateTwilioSignature } from '@/app/lib/validateTwilio';
import { getIvrConfig } from '@/app/lib/ivrConfig';
import { findUpcomingAppointment } from '@/app/lib/findAppointment';
import { formatDateEs, formatDateShort, formatHour } from '@/app/lib/timeSlots';

const BASE = process.env.SITE_URL ?? 'https://notarygarcia.notaryhost.com';

function twiml(xml: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${xml}`, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => { params[k] = v.toString(); });

  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  const sig = request.headers.get('X-Twilio-Signature') ?? '';
  const url = `${BASE}/api/twilio/voice/lang-select`;
  if (authToken && sig && !validateTwilioSignature(authToken, sig, url, params)) {
    return new Response('Forbidden', { status: 403 });
  }

  const lang = params.Digits === '2' ? 'es' : 'en';
  const cfg = await getIvrConfig();

  // Ya sabemos el idioma elegido — anunciamos la cita (si existe) solo en
  // ese idioma, en vez de repetirla en los dos como antes de elegir.
  const callerE164 = params.From ?? '';
  const appointment = await findUpcomingAppointment(callerE164).catch(() => null);

  const appointmentSay = appointment ? `
  <Say voice="${cfg.voices[lang]}">${lang === 'es'
    ? `Usted tiene una cita próxima el ${formatDateEs(appointment.slotDate)} a las ${formatHour(appointment.slotHour)}.`
    : `You have an upcoming appointment on ${formatDateShort(appointment.slotDate)} at ${formatHour(appointment.slotHour)}.`}</Say>
  <Pause length="1"/>` : '';

  return twiml(`
<Response>${appointmentSay}
  <Gather numDigits="1" action="${BASE}/api/twilio/voice/action?lang=${lang}" method="POST" timeout="8">
    <Say voice="${cfg.voices[lang]}">${cfg.menu[lang]}</Say>
  </Gather>
  <Redirect>${BASE}/api/twilio/voice/welcome</Redirect>
</Response>`);
}
