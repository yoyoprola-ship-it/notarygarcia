// "Urgent service" — a customer (web visitor or IVR caller) asks if the
// notary can help RIGHT NOW. We text the owner; if they reply "YES" within
// the request's 2-minute window, every still-pending request is confirmed.
// Web requests are picked up by the browser polling /api/urgent-service/status;
// IVR requests additionally get a follow-up SMS with the address, since the
// caller already hung up by the time the owner replies.
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin';
import { sendSms } from './twilioSms';
import { getNotaryProfile } from './notaryProfile';

const COLLECTION = 'notarygarcia_urgent_requests';
const WINDOW_MS = 120_000;

export type UrgentChannel = 'web' | 'ivr';
export type UrgentStatus = 'pending' | 'confirmed' | 'expired';

export interface UrgentRequest {
  channel: UrgentChannel;
  customerPhone?: string; // 10 dígitos — solo para channel 'ivr'
  status: UrgentStatus;
  createdAt: FirebaseFirestore.Timestamp;
  expiresAt: FirebaseFirestore.Timestamp;
  respondedAt?: FirebaseFirestore.Timestamp;
}

export async function createUrgentRequest(
  channel: UrgentChannel,
  customerPhone?: string
): Promise<{ id: string; expiresAt: number }> {
  const now = Date.now();
  const expiresAt = Timestamp.fromMillis(now + WINDOW_MS);
  const ref = await adminDb.collection(COLLECTION).add({
    channel,
    ...(customerPhone ? { customerPhone } : {}),
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    expiresAt,
  });

  const profile = await getNotaryProfile().catch(() => null);
  const source = channel === 'web'
    ? 'from your website'
    : `from a phone caller${customerPhone ? ` (${customerPhone})` : ''}`;
  void sendSms(
    profile?.ownerPhone || '',
    `URGENT SERVICE REQUEST ${source}. Reply YES within 2 minutes if you can help right now.`
  );

  return { id: ref.id, expiresAt: expiresAt.toMillis() };
}

export async function getUrgentRequestStatus(id: string): Promise<{
  status: UrgentStatus;
  expiresAt: number;
  address?: string;
} | null> {
  const snap = await adminDb.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as UrgentRequest;

  if (data.status === 'pending' && data.expiresAt.toMillis() <= Date.now()) {
    return { status: 'expired', expiresAt: data.expiresAt.toMillis() };
  }
  if (data.status === 'confirmed') {
    const profile = await getNotaryProfile().catch(() => null);
    return {
      status: 'confirmed',
      expiresAt: data.expiresAt.toMillis(),
      address: profile?.businessAddress || '',
    };
  }
  return { status: data.status, expiresAt: data.expiresAt.toMillis() };
}

// Owner replied "YES" — confirm every request still inside its 2-minute
// window, and text IVR callers (who already hung up) the address directly.
export async function confirmPendingUrgentRequests(): Promise<number> {
  const now = Date.now();
  // Single equality filter (auto-indexed) — expiresAt is filtered in JS to
  // avoid needing a manual composite index for a status+expiresAt query.
  const snap = await adminDb
    .collection(COLLECTION)
    .where('status', '==', 'pending')
    .get();

  const stillWaiting = snap.docs.filter((doc) => (doc.data() as UrgentRequest).expiresAt.toMillis() > now);
  if (stillWaiting.length === 0) return 0;

  const profile = await getNotaryProfile().catch(() => null);
  const address = profile?.businessAddress || '';
  const batch = adminDb.batch();
  for (const doc of stillWaiting) {
    batch.update(doc.ref, { status: 'confirmed', respondedAt: FieldValue.serverTimestamp() });
  }
  await batch.commit();

  for (const doc of stillWaiting) {
    const data = doc.data() as UrgentRequest;
    if (data.channel === 'ivr' && data.customerPhone) {
      void sendSms(
        `+1${data.customerPhone}`,
        `Good news — the notary is available right now for your urgent request. Address: ${address}\n\n` +
        `Buenas noticias — el notario está disponible ahora mismo para su solicitud urgente. Dirección: ${address}`
      );
    }
  }

  return stillWaiting.length;
}
