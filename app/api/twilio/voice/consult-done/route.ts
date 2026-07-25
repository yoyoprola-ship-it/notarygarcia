import { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/app/lib/firebaseAdmin';
import { validateTwilioSignature } from '@/app/lib/validateTwilio';
import { getIvrConfig } from '@/app/lib/ivrConfig';
import { notifyOwnerOfConsultation } from '@/app/lib/notifyOwner';

const BASE = process.env.SITE_URL ?? 'https://notarygarcia.notaryhost.com';

function twiml(xml: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${xml}`, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(request: NextRequest) {
  const lang = (request.nextUrl.searchParams.get('lang') ?? 'en') as 'en' | 'es';
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => { params[k] = v.toString(); });

  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  const sig = request.headers.get('X-Twilio-Signature') ?? '';
  const url = `${BASE}/api/twilio/voice/consult-done?lang=${lang}`;
  if (authToken && sig && !validateTwilioSignature(authToken, sig, url, params)) {
    return new Response('Forbidden', { status: 403 });
  }

  const callerE164 = params.From ?? '';
  const recordingUrl = params.RecordingUrl ?? '';
  const recordingSid = params.RecordingSid ?? '';
  const callSid = params.CallSid ?? '';
  const duration = parseInt(params.RecordingDuration ?? '0', 10);

  // Save and notify in parallel — don't block TwiML response
  await Promise.allSettled([
    adminDb.collection('notarygarcia_consultations').add({
      callerPhone: callerE164,
      recordingSid,
      recordingUrl,
      duration,
      callSid,
      lang,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    }),
    notifyOwnerOfConsultation(callerE164, lang),
  ]);

  const cfg = await getIvrConfig();
  return twiml(`
<Response>
  <Say voice="${cfg.voices[lang]}">${cfg.consultBye[lang]}</Say>
  <Hangup/>
</Response>`);
}
