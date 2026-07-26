import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebaseAdmin';
import { requireOwner } from '@/app/lib/ownerApiAuth';
import { ctDateStr } from '@/app/lib/timeSlots';

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;

  try {
    const snap = await adminDb
      .collection('notarygarcia_visits')
      .orderBy('date', 'desc')
      .limit(90)
      .get();

    const daily = snap.docs.map((d) => {
      const data = d.data();
      return { date: data.date as string, count: (data.count as number) || 0 };
    });

    const today = ctDateStr();
    const last7 = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const last30 = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const todayCount = daily.find((d) => d.date === today)?.count ?? 0;
    const last7Count = daily.filter((d) => d.date >= last7).reduce((s, d) => s + d.count, 0);
    const last30Count = daily.filter((d) => d.date >= last30).reduce((s, d) => s + d.count, 0);
    const totalCount = daily.reduce((s, d) => s + d.count, 0);

    return NextResponse.json({
      today: todayCount,
      last7: last7Count,
      last30: last30Count,
      total: totalCount,
      daily,
    });
  } catch (err) {
    console.error('[owner/visits] failed:', err);
    return NextResponse.json({ error: 'Failed to load visits' }, { status: 500 });
  }
}
