import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/app/lib/ownerApiAuth';
import { getTwilioPhoneNumber } from '@/app/lib/notaryProfile';

// GET /api/owner/phone-log
// Every call and SMS on THIS notary's own Twilio number (never any other
// number on the shared account) from the last 6 months, split into a
// messages log and a calls log, each grouped into threads by the other
// party's phone number — most recently active thread first.

const LOOKBACK_DAYS = 180;

interface TwilioPage {
  messages?: Array<{ sid: string; from: string; to: string; body: string; status: string; date_sent: string }>;
  calls?: Array<{ sid: string; from: string; to: string; duration: string; status: string; start_time: string }>;
  next_page_uri?: string | null;
}

interface ThreadItem {
  sid: string;
  direction: 'inbound' | 'outbound';
  body?: string;
  status: string;
  duration?: number;
  at: string;
}
interface Thread {
  phone: string;
  items: ThreadItem[];
  lastAt: string | null;
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

function groupByCounterpart(records: Array<{ counterpart: string; item: ThreadItem }>): Thread[] {
  const threads = new Map<string, Thread>();
  for (const r of records) {
    const key = r.counterpart.replace(/\D/g, '').slice(-10) || r.counterpart;
    let t = threads.get(key);
    if (!t) {
      t = { phone: r.counterpart, items: [], lastAt: null };
      threads.set(key, t);
    }
    t.items.push(r.item);
  }
  const out = Array.from(threads.values()).map((t) => {
    t.items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return { ...t, lastAt: t.items[0]?.at ?? null };
  });
  out.sort((a, b) => new Date(b.lastAt ?? 0).getTime() - new Date(a.lastAt ?? 0).getTime());
  return out;
}

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phone = await getTwilioPhoneNumber().catch(() => '');
  if (!accountSid || !authToken || !phone) {
    return NextResponse.json({ messageThreads: [], callThreads: [] });
  }

  const creds = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const since = fmtDate(new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000));

  const [msgsFrom, msgsTo, callsFrom, callsTo] = await Promise.all([
    fetchAllPages(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json?From=${encodeURIComponent(phone)}&DateSent>=${since}&PageSize=200`, creds),
    fetchAllPages(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json?To=${encodeURIComponent(phone)}&DateSent>=${since}&PageSize=200`, creds),
    fetchAllPages(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json?From=${encodeURIComponent(phone)}&StartTime>=${since}&PageSize=200`, creds),
    fetchAllPages(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json?To=${encodeURIComponent(phone)}&StartTime>=${since}&PageSize=200`, creds),
  ]);

  const messageRecords: Array<{ counterpart: string; item: ThreadItem }> = [];
  for (const page of [...msgsFrom, ...msgsTo]) {
    for (const m of page.messages ?? []) {
      messageRecords.push({
        counterpart: m.from === phone ? m.to : m.from,
        item: {
          sid: m.sid,
          direction: m.from === phone ? 'outbound' : 'inbound',
          body: m.body,
          status: m.status,
          at: m.date_sent,
        },
      });
    }
  }

  const callRecords: Array<{ counterpart: string; item: ThreadItem }> = [];
  for (const page of [...callsFrom, ...callsTo]) {
    for (const c of page.calls ?? []) {
      callRecords.push({
        counterpart: c.from === phone ? c.to : c.from,
        item: {
          sid: c.sid,
          direction: c.from === phone ? 'outbound' : 'inbound',
          duration: parseInt(c.duration ?? '0', 10) || 0,
          status: c.status,
          at: c.start_time,
        },
      });
    }
  }

  return NextResponse.json({
    messageThreads: groupByCounterpart(messageRecords),
    callThreads: groupByCounterpart(callRecords),
  });
}
