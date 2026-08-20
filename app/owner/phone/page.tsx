'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/app/lib/firebase';

interface ThreadItem {
  type: 'message' | 'call';
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

export default function OwnerPhonePage() {
  const [threads, setThreads] = useState<Thread[]>([]);
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
      setThreads(data.threads as Thread[]);
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
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Phone</h1>
        <button onClick={load} className="text-xs text-slate-500 hover:text-slate-800 border border-stone-300 px-3 py-1.5 rounded">
          Refresh
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Every call and text on your number, grouped by who you were talking to. Last 6 months.
      </p>

      {threads.length === 0 ? (
        <p className="text-sm text-slate-500">No calls or messages yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {threads.map((t) => (
            <ThreadCard key={t.phone} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadCard({ t }: { t: Thread }) {
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

  const visibleItems = expanded ? t.items : t.items.slice(0, 3);
  const calls = t.items.filter((i) => i.type === 'call').length;
  const messages = t.items.filter((i) => i.type === 'message').length;

  return (
    <div className="border border-stone-200 bg-white rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-base font-black text-slate-900">{formatPhone(t.phone)}</span>
          <p className="text-xs text-slate-500">
            {formatDate(t.lastAt)} · {calls} call{calls === 1 ? '' : 's'} · {messages} message{messages === 1 ? '' : 's'}
          </p>
        </div>
        <a
          href={`tel:${t.phone}`}
          className="shrink-0 px-3 py-1.5 text-xs font-bold uppercase tracking-wide border border-green-300 text-green-800 hover:bg-green-50 rounded"
        >
          Call
        </a>
      </div>

      <ul className="flex flex-col gap-1.5 mb-3">
        {visibleItems.map((item) => (
          <li key={item.sid} className="text-xs text-slate-600 flex items-start gap-2">
            <span className={`shrink-0 font-bold ${item.direction === 'inbound' ? 'text-blue-700' : 'text-slate-400'}`}>
              {item.direction === 'inbound' ? '←' : '→'}
            </span>
            <span className="shrink-0 text-slate-400">{formatDate(item.at)}</span>
            {item.type === 'call' ? (
              <span>Call · {item.status} · {formatDuration(item.duration)}</span>
            ) : (
              <span className="text-slate-800">{item.body}</span>
            )}
          </li>
        ))}
      </ul>
      {t.items.length > 3 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 mb-3"
        >
          {expanded ? 'Show less' : `Show all ${t.items.length}`}
        </button>
      )}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Reply by SMS
        </p>
        {replyDone ? (
          <p className="text-xs text-green-700 font-bold">Message sent ✓</p>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a message…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              maxLength={320}
              className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
              onKeyDown={(e) => { if (e.key === 'Enter') void sendReply(); }}
            />
            <button
              onClick={sendReply}
              disabled={replying || !replyText.trim()}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold uppercase tracking-wide rounded disabled:opacity-50"
            >
              {replying ? '…' : 'Send'}
            </button>
          </div>
        )}
        {replyError && <p className="text-xs text-red-600 mt-1">{replyError}</p>}
      </div>
    </div>
  );
}
