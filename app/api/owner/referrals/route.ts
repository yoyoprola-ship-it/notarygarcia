import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/app/lib/ownerApiAuth';
import { adminDb } from '@/app/lib/firebaseAdmin';

// GET /api/owner/referrals
// This notary's own permanent referral code/link, their free-month credit
// balance, and who they've referred so far — all live from the central
// `notaries` collection in notaryhost-33a33 (the same one the admin panel
// reads/writes), not a separate copy.

function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
}

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;

  const notaryId = process.env.NOTARY_ID;
  if (!notaryId) {
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  const selfRef = adminDb.collection('notaries').doc(notaryId);
  const selfSnap = await selfRef.get();
  const self = selfSnap.data() ?? {};

  // Lazily backfill — mirrors the same lazy-generate the admin panel does,
  // so this works even if nobody has opened the notary's admin page yet.
  let referralCode: string = self.referralCode;
  if (!referralCode) {
    referralCode = generateReferralCode();
    await selfRef.update({ referralCode });
  }

  const referredSnap = await adminDb.collection('notaries').where('referredBy', '==', notaryId).get();
  const referred = await Promise.all(
    referredSnap.docs.map(async (d) => {
      const data = d.data();
      let lastPaidPeriod: string | null = null;
      if (data.firstPaymentDate && data.collectionPrefix) {
        const billsSnap = await adminDb
          .collection(`${data.collectionPrefix}_bills`)
          .where('status', '==', 'paid')
          .orderBy('period', 'desc')
          .limit(1)
          .get();
        lastPaidPeriod = billsSnap.empty ? null : (billsSnap.docs[0].data().period ?? null);
      }
      return {
        businessName: data.businessName || 'Notary',
        confirmed: Boolean(data.firstPaymentDate),
        lastPaidPeriod,
      };
    })
  );

  return NextResponse.json({
    referralCode,
    freeMonthsRemaining: self.freeMonthsRemaining || 0,
    freeMonthsEarnedTotal: self.freeMonthsEarnedTotal || 0,
    referred,
  });
}
