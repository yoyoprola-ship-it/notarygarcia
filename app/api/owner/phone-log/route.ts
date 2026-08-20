import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/app/lib/ownerApiAuth';
import { getTwilioPhoneNumber } from '@/app/lib/notaryProfile';

// GET /api/owner/phone-log
// Every call and SMS on this notary's Twilio number, grouped by the other
// party's phone number ("threads"), most recently active thread first —
// the data behind /owner/phone.

const LOOKBACK_DAYS = 180;

interface TwilioPage {
  messages?: Array<{ sid: string; from: string; to: string; body: string; status: string; date_sent: string }>;
  calls?: Array<{ sid: string; from: string; to: string; duration: string; status: string; start_time: string }>;
  next_page_uri?: string | null;
}

async function fetchAllPages(firstUrl: string, creds: string): Promise<TwilioPage[]> {
  const pages: TwilioPage[] = [];
  let pageUrl: string | null = firstUrl;
  while (pageUrl) {
    const res: Response = await fetch(pageUrl, { headers: { Authorization: `Basic ${creds}` } });
    if (!res.ok) break;
    const data = (await res.json()) as TwilioPage;
    pages.push(data);
    pageUrl = data.next_page_uri ? `https://api.twilio.com${data.next_page_uri}` : null;
  }
  return pages;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phone = await getTwilioPhoneNumber().catch(() => '');
  if (!accountSid || !authToken || !phone) {
    return NextResponse.json({ threads: [] });
  }

  const creds = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const since = fmtDate(new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000));

  const [msgsFrom, msgsTo, callsFrom, callsTo] = await Promise.all([
    fetchAllPages(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json?From=${encodeURIComponent(phone)}&DateSent>=${since}&PageSize=200`, creds),
    fetchAllPages(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json?To=${encodeURIComponent(phone)}&DateSent>=${since}&PageSize=200`, creds),
    fetchAllPages(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json?From=${encodeURIComponent(phone)}&StartTime>=${since}&PageSize=200`, creds),
    fetchAllPages(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json?To=${encodeURIComponent(phone)}&StartTime>=${since}&PageSize=200`, creds),
  ]);

  interface ThreadItem {
    type: 'message' | 'call';
    sid: string;
    direction: 'inbound' | 'outbound';
    body?: string;
    status: string;
    duration?: number;
    at: string;
  }
  const threads = new Map<string, { phone: string; items: ThreadItem[] }>();

  function bucket(counterpart: string) {
    const key = counterpart.replace(/\D/g, '').slice(-10) || counterpart;
    let t = threads.get(key);
    if (!t) {
      t = { phone: counterpart, items: [] };
      threads.set(key, t);
    }
    return t;
  }

  for (const page of [...msgsFrom, ...msgsTo]) {
    for (const m of page.messages ?? []) {
      const counterpart = m.from === phone ? m.to : m.from;
      bucket(counterpart).items.push({
        type: 'message',
        sid: m.sid,
        direction: m.from === phone ? 'outbound' : 'inbound',
        body: m.body,
        status: m.status,
        at: m.date_sent,
      });
    }
  }
  for (const page of [...callsFrom, ...callsTo]) {
    for (const c of page.calls ?? []) {
      const counterpart = c.from === phone ? c.to : c.from;
      bucket(counterpart).items.push({
        type: 'call',
        sid: c.sid,
        direction: c.from === phone ? 'outbound' : 'inbound',
        duration: parseInt(c.duration ?? '0', 10) || 0,
        status: c.status,
        at: c.start_time,
      });
    }
  }

  const out = Array.from(threads.values()).map((t) => {
    t.items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return { phone: t.phone, items: t.items, lastAt: t.items[0]?.at ?? null };
  });
  out.sort((a, b) => new Date(b.lastAt ?? 0).getTime() - new Date(a.lastAt ?? 0).getTime());

  return NextResponse.json({ threads: out });
}
