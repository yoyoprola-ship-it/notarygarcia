import { adminDb } from './firebaseAdmin';

export interface UpcomingAppointment {
  slotDate: string;
  slotHour: number;
}

// El caller puede tener varias citas confirmadas — solo anunciamos la
// más próxima (la primera al ordenar por slot ascendente).
export async function findUpcomingAppointment(callerE164: string): Promise<UpcomingAppointment | null> {
  const digits = callerE164.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return null;

  const snap = await adminDb
    .collection('notarygarcia_bookings')
    .where('customerPhone', '==', digits)
    .get();

  const now = new Date().toISOString().slice(0, 19);
  const upcoming = snap.docs
    .map((d) => d.data() as { status: string; slot: string; slotDate: string; slotHour: number })
    .filter((b) => b.status === 'confirmed' && b.slot >= now)
    .sort((a, b) => a.slot.localeCompare(b.slot));

  return upcoming[0] ?? null;
}
