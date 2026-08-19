import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, rateLimitOr429 } from '@/app/lib/rateLimit';
import { getUrgentRequestStatus } from '@/app/lib/urgentService';

// GET /api/urgent-service/status?id=xxx
// Polled by the browser countdown UI while it waits for the owner's reply.
export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rl = await rateLimitOr429(`nj-urgent-web-status-ip:${ip}`, {
    maxRequests: 60,
    windowMs: 60_000,
  });
  if (rl) return rl;

  const id = request.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });

  const result = await getUrgentRequestStatus(id).catch(() => null);
  if (!result) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return NextResponse.json(result);
}
