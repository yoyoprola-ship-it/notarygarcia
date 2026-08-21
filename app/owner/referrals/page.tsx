'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/app/lib/firebase';

interface Referred {
  businessName: string;
  confirmed: boolean;
  lastPaidPeriod: string | null;
}
interface ReferralsData {
  referralCode: string;
  freeMonthsRemaining: number;
  freeMonthsEarnedTotal: number;
  referred: Referred[];
}

export default function OwnerReferralsPage() {
  const [data, setData] = useState<ReferralsData | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setError('');
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) { setError('Not authenticated'); return; }
      const res = await fetch('/api/owner/referrals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Load failed');
      setData(json as ReferralsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading');
    }
  };

  useEffect(() => { void load(); }, []);

  const link = data ? `https://notaryhost.com/?ref=${data.referralCode}` : '';

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Referrals</h1>
        <button onClick={load} className="text-xs text-slate-500 hover:text-slate-800 border border-stone-300 px-3 py-1.5 rounded">
          Refresh
        </button>
      </div>

      <div className="border border-stone-200 bg-white rounded-lg p-5 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Your referral link
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-sm bg-stone-100 px-3 py-2 rounded break-all">{link}</code>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold uppercase tracking-wide rounded shrink-0"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Share this with other notaries. When someone who signs up through it goes live and
          pays their first bill, you get a free month automatically — no limit.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Free months available</p>
          <p className="text-3xl font-black text-slate-900">{data.freeMonthsRemaining}</p>
        </div>
        <div className="border border-stone-200 bg-white rounded-lg p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Earned all-time</p>
          <p className="text-3xl font-black text-slate-900">{data.freeMonthsEarnedTotal}</p>
        </div>
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        Notaries you referred
      </h2>
      {data.referred.length === 0 ? (
        <p className="text-sm text-slate-500">
          No referrals yet — share your link above to start earning free months.
        </p>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white divide-y divide-stone-200">
          {data.referred.map((r, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-900">{r.businessName}</span>
              {r.confirmed ? (
                <span className="text-xs text-green-700">
                  Confirmed — paid through {r.lastPaidPeriod || '—'}
                </span>
              ) : (
                <span className="text-xs text-slate-400">Not paying yet</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
