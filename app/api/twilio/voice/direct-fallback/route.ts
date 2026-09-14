import { NextRequest } from 'next/server';
import { validateTwilioSignature } from '@/app/lib/validateTwilio';
import { getIvrConfig } from '@/app/lib/ivrConfig';

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
  const url = `${BASE}/api/twilio/voice/direct-fallback?lang=${lang}`;
  if (!authToken || !sig || !validateTwilioSignature(authToken, sig, url, params)) {
    return new Response('Forbidden', { status: 403 });
  }

  const dialStatus = params.DialCallStatus ?? '';

  if (dialStatus === 'completed') {
    return twiml(`<Response><Hangup/></Response>`);
  }

  const cfg = await getIvrConfig();
  return twiml(`
<Response>
  <Say voice="${cfg.voices[lang]}">${cfg.directBusy[lang]}</Say>
  <Hangup/>
</Response>`);
}
