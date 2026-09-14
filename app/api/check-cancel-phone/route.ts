import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebaseAdmin';
import { getClientIp, rateLimitOr429 } from '@/app/lib/rateLimit';
import { isPastSlot } from '@/app/lib/timeSlots';

interface Body { phone?: unknown }

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rl = await rateLimitOr429(`nj-check-cancel-phone-ip:${ip}`, {
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (rl) return rl;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const raw = typeof body.phone === 'string' ? body.phone : '';
  const digits = raw.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
  }

  try {
    const snap = await adminDb
      .collection('notarygarcia_bookings')
      .where('customerPhone', '==', digits)
      .where('status', '==', 'confirmed')
      .limit(10)
      .get();

    const hasUpcoming = snap.docs.some((d) => {
      const data = d.data();
      const slotDate = data.slotDate as string | undefined;
      const slotHour = data.slotHour as number | undefined;
      return slotDate !== undefined && slotHour !== undefined && !isPastSlot(slotDate, slotHour);
    });

    return NextResponse.json({ hasBookings: hasUpcoming });
  } catch (err) {
    console.error('[check-cancel-phone] failed:', err);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
