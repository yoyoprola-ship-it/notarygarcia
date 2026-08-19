import { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/app/lib/firebaseAdmin';
import { validateTwilioSignature } from '@/app/lib/validateTwilio';
import { sendSms } from '@/app/lib/twilioSms';
import { getIvrConfig } from '@/app/lib/ivrConfig';
import { getOwnerPhone } from '@/app/lib/notaryProfile';
import { createUrgentRequest } from '@/app/lib/urgentService';

const BASE = process.env.SITE_URL ?? 'https://notarygarcia.notaryhost.com';
const SITE_URL_TEXT = process.env.SITE_URL ?? 'https://notarygarcia.notaryhost.com';

function twiml(xml: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${xml}`, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

const SMS_TEXT = {
  en: `Book your appointment at ${SITE_URL_TEXT}`,
  es: `Agende su cita en ${SITE_URL_TEXT}`,
};

export async function POST(request: NextRequest) {
  const lang = (request.nextUrl.searchParams.get('lang') ?? 'en') as 'en' | 'es';
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => { params[k] = v.toString(); });

  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  const sig = request.headers.get('X-Twilio-Signature') ?? '';
  const url = `${BASE}/api/twilio/voice/action?lang=${lang}`;
  if (authToken && sig && !validateTwilioSignature(authToken, sig, url, params)) {
    return new Response('Forbidden', { status: 403 });
  }

  const digits = params.Digits;
  const callerE164 = params.From ?? '';

  // Track engaged calls (chose option 1, 2 or 3) — deduped by CallSid
  if ((digits === '1' || digits === '2' || digits === '3') && params.CallSid) {
    void adminDb.collection('notarygarcia_calls').doc(params.CallSid).create({
      callerPhone: callerE164,
      callSid: params.CallSid,
      action: digits === '1' ? 'urgent' : digits === '2' ? 'book' : 'consult',
      createdAt: FieldValue.serverTimestamp(),
    }).catch(() => {});
  }

  const cfg = await getIvrConfig();
  const voice = cfg.voices[lang];

  // Option 1: Urgent service — text the owner right now, let the caller
  // know they'll hear back shortly (the confirmation/address comes as a
  // follow-up SMS once/if the owner replies YES, since the call is over
  // by then).
  if (digits === '1') {
    const callerDigits = callerE164.replace(/\D/g, '').slice(-10);
    if (callerDigits.length === 10) {
      void createUrgentRequest('ivr', callerDigits);
    }
    return twiml(`
<Response>
  <Say voice="${voice}">${cfg.urgentPrompt[lang]}</Say>
  <Hangup/>
</Response>`);
  }

  // Option 2: Book appointment
  if (digits === '2') {
    void sendSms(callerE164, SMS_TEXT[lang]);
    return twiml(`
<Response>
  <Say voice="${voice}">${cfg.bookConfirm[lang]}</Say>
  <Pause length="1"/>
  <Say voice="${voice}">${cfg.bookBye[lang]}</Say>
  <Hangup/>
</Response>`);
  }

  // Option 3: Voice consultation
  if (digits === '3') {
    return twiml(`
<Response>
  <Say voice="${voice}">${cfg.consultPrompt[lang]}</Say>
  <Record action="${BASE}/api/twilio/voice/consult-done?lang=${lang}" method="POST" maxLength="120" finishOnKey="#" playBeep="true" timeout="5"/>
  <Say voice="${voice}">${cfg.consultNoRec[lang]}</Say>
  <Hangup/>
</Response>`);
  }

  // Option 4: Direct call to notary
  if (digits === '4') {
    const ownerPhone = await getOwnerPhone().catch(() => '');
    if (!ownerPhone) {
      return twiml(`
<Response>
  <Say voice="${voice}">${cfg.directBusy[lang]}</Say>
  <Hangup/>
</Response>`);
    }
    return twiml(`
<Response>
  <Say voice="${voice}">${cfg.directPrompt[lang]}</Say>
  <Dial action="${BASE}/api/twilio/voice/direct-fallback?lang=${lang}" timeout="30">
    <Number>${ownerPhone}</Number>
  </Dial>
</Response>`);
  }

  // Unrecognized digit — back to menu
  return twiml(`
<Response>
  <Say voice="${voice}">${cfg.retry[lang]}</Say>
  <Redirect>${BASE}/api/twilio/voice/lang-select</Redirect>
</Response>`);
}
