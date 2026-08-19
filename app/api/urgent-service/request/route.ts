import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebaseAdmin';
import { getClientIp, rateLimitOr429 } from '@/app/lib/rateLimit';
import { isOpenNow } from '@/app/lib/timeSlots';
import { createUrgentRequest } from '@/app/lib/urgentService';
import type { WorkingHours } from '@/app/types';

// POST /api/urgent-service/request
// A web visitor asks "do you need my urgent service right now?" — texts the
// owner and returns a request id + expiry for the client to poll/countdown.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  // Per-IP throttle — the anti-abuse guard for this endpoint. Each urgent
  // request texts the owner (real Twilio cost), so a single visitor/bot
  // can't rack up more than 3 in 10 minutes.
  const rl = await rateLimitOr429(`nj-urgent-web-ip:${ip}`, {
    maxRequests: 3,
    windowMs: 10 * 60_000,
  });
  if (rl) return rl;

  try {
    const cfgSnap = await adminDb.doc('notarygarcia_config/hours').get();
    const cfg = cfgSnap.exists ? (cfgSnap.data() as WorkingHours) : null;
    if (!isOpenNow(cfg)) {
      return NextResponse.json({ error: 'closed' }, { status: 400 });
    }

    const result = await createUrgentRequest('web');
    return NextResponse.json(result);
  } catch (err) {
    console.error('[urgent-service/request] failed:', err);
    return NextResponse.json({ error: 'Could not send the request' }, { status: 500 });
  }
}
