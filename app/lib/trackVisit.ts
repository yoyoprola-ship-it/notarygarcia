// Cuenta las visitas a la landing pública, una por request server-side
// (page.tsx es force-dynamic, así que corre en cada carga real). Un doc
// por día en notarygarcia_visits, clave = fecha en tz local.
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin';
import { ctDateStr } from './timeSlots';

export async function trackVisit(): Promise<void> {
  try {
    const today = ctDateStr();
    await adminDb.doc(`notarygarcia_visits/${today}`).set(
      { date: today, count: FieldValue.increment(1) },
      { merge: true }
    );
  } catch (err) {
    console.error('[trackVisit] failed:', err);
  }
}
