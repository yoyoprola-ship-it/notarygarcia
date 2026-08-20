'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/app/lib/firebase';

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

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return raw;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatDuration(s?: number): string {
  if (!s) return '0s';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function previewFor(item: ThreadItem, kind: 'message' | 'call'): string {
  if (kind === 'call') {
    const dir = item.direction === 'inbound' ? 'Inbound' : 'Outbound';
    return `${dir} · ${item.status} · ${formatDuration(item.duration)}`;
  }
  return item.body ?? '';
}

export default function OwnerPhonePage() {
  const [messageThreads, setMessageThreads] = useState<Thread[]>([]);
  const [callThreads, setCallThreads] = useState<Thread[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) { setError('Not authenticated'); return; }
      const res = await fetch('/api/owner/phone-log', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Load failed');
      setMessageThreads(data.messageThreads as Thread[]);
      setCallThreads(data.callThreads as Thread[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Phone</h1>
          <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
        </div>
        <button onClick={load} className="text-xs text-slate-500 hover:text-slate-800 border border-stone-300 px-3 py-1.5 rounded">
          Refresh
        </button>
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Messages</h2>
      {messageThreads.length === 0 ? (
        <p className="text-sm text-slate-500 mb-6">No messages yet.</p>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden mb-6 bg-white divide-y divide-stone-200">
          {messageThreads.map((t) => (
            <ThreadRow key={t.phone} t={t} kind="message" />
          ))}
        </div>
      )}

      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Calls</h2>
      {callThreads.length === 0 ? (
        <p className="text-sm text-slate-500">No calls yet.</p>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white divide-y divide-stone-200">
          {callThreads.map((t) => (
            <ThreadRow key={t.phone} t={t} kind="call" />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadRow({ t, kind }: { t: Thread; kind: 'message' | 'call' }) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyDone, setReplyDone] = useState(false);
  const [replyError, setReplyError] = useState('');

  const sendReply = async () => {
    if (replying || !replyText.trim()) return;
    setReplying(true);
    setReplyError('');
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/owner/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: t.phone, message: replyText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Send failed');
      setReplyDone(true);
      setReplyText('');
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : 'Error');
    } finally {
      setReplying(false);
    }
  };

  const last = t.items[0];

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between gap-4 px-4 py-2 text-left hover:bg-stone-50 ${expanded ? 'bg-stone-50' : ''}`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm">
            <span className="font-bold text-slate-900">{formatPhone(t.phone)}</span>
            <span className="text-slate-400"> · {t.items.length} {kind === 'call' ? 'call' : 'message'}{t.items.length === 1 ? '' : 's'}</span>
          </span>
          <span className="block text-xs text-slate-500 truncate">{previewFor(last, kind)}</span>
        </span>
        <span className="shrink-0 flex items-center gap-3 text-xs text-slate-400">
          <span>{formatDate(t.lastAt)}</span>
          <span className="text-[10px]">{expanded ? '▲' : '▼'}</span>
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-dashed border-stone-200">
          <ul className="flex flex-col gap-1.5 my-3 max-h-60 overflow-y-auto">
            {t.items.map((item) => (
              <li key={item.sid} className="text-xs text-slate-600 flex items-start gap-2">
                <span className={`shrink-0 font-bold ${item.direction === 'inbound' ? 'text-blue-700' : 'text-slate-400'}`}>
                  {item.direction === 'inbound' ? '←' : '→'}
                </span>
                <span className="shrink-0 text-slate-400">{formatDate(item.at)}</span>
                <span className="text-slate-800">{previewFor(item, kind)}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${t.phone}`}
              className="shrink-0 px-3 py-1.5 text-xs font-bold uppercase tracking-wide border border-green-300 text-green-800 hover:bg-green-50 rounded"
            >
              Call
            </a>
            {kind === 'message' && (
              replyDone ? (
                <span className="text-xs text-green-700 font-bold">Sent ✓</span>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Write a message…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    maxLength={320}
                    className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                    onKeyDown={(e) => { if (e.key === 'Enter') void sendReply(); }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={replying || !replyText.trim()}
                    className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold uppercase tracking-wide rounded disabled:opacity-50"
                  >
                    {replying ? '…' : 'Send'}
                  </button>
                </>
              )
            )}
          </div>
          {replyError && <p className="text-xs text-red-600 mt-1">{replyError}</p>}
        </div>
      )}
    </div>
  );
}
