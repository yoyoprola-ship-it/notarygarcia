import { NextRequest } from 'next/server';
import { validateTwilioSignature } from '@/app/lib/validateTwilio';
import { getOwnerPhone } from '@/app/lib/notaryProfile';
import { confirmPendingUrgentRequests } from '@/app/lib/urgentService';

const BASE = process.env.SITE_URL ?? 'https://notarygarcia.notaryhost.com';

function emptyTwiml() {
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  });
}

// Twilio "a message comes in" webhook for this notary's number. The only
// thing we currently act on is the owner texting back "yes" to confirm an
// urgent-service request — anything else (customers texting the number,
// typos, etc.) is a silent no-op.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((v, k) => { params[k] = v.toString(); });

  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  const sig = request.headers.get('X-Twilio-Signature') ?? '';
  const url = `${BASE}/api/twilio/sms/webhook`;
  if (authToken && sig && !validateTwilioSignature(authToken, sig, url, params)) {
    return new Response('Forbidden', { status: 403 });
  }

  const fromDigits = (params.From || '').replace(/\D/g, '').slice(-10);
  const body = (params.Body || '').trim().toLowerCase();

  const ownerPhone = await getOwnerPhone().catch(() => '');
  const ownerDigits = ownerPhone.replace(/\D/g, '').slice(-10);

  if (fromDigits && ownerDigits && fromDigits === ownerDigits && body === 'yes') {
    await confirmPendingUrgentRequests().catch((err) => {
      console.error('[sms/webhook] confirmPendingUrgentRequests failed:', err);
    });
  }

  return emptyTwiml();
}
