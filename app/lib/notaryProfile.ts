// Reads this notary's business info live from the central NotaryHost admin
// database (the `notaries` collection, managed from notaryhost.com/admin —
// NOT prefixed like this app's own notarygarcia_* collections, since it's
// intentionally shared/central across every notary clone). Lets the admin
// update the owner's phone from one place instead of it being frozen in a
// secret here.
import { adminDb } from './firebaseAdmin';

export interface NotaryProfile {
  businessName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  twilioPhoneNumber: string;
}

let cached: NotaryProfile | null = null;
let cachedAt = 0;
const TTL_MS = 5 * 60 * 1000;

export async function getNotaryProfile(): Promise<NotaryProfile> {
  const now = Date.now();
  if (cached && now - cachedAt < TTL_MS) return cached;

  const notaryId = process.env.NOTARY_ID;
  if (!notaryId) {
    throw new Error('NOTARY_ID is not configured');
  }

  const snap = await adminDb.collection('notaries').doc(notaryId).get();
  if (!snap.exists) {
    throw new Error(`No notary record found for NOTARY_ID=${notaryId}`);
  }

  const data = snap.data()!;
  cached = {
    businessName: data.businessName,
    ownerName: data.ownerName,
    ownerPhone: data.ownerPhone,
    ownerEmail: data.ownerEmail,
    twilioPhoneNumber: data.twilioPhoneNumber,
  };
  cachedAt = now;
  return cached;
}

export async function getOwnerPhone(): Promise<string> {
  const { ownerPhone } = await getNotaryProfile();
  return ownerPhone;
}

export async function getTwilioPhoneNumber(): Promise<string> {
  const { twilioPhoneNumber } = await getNotaryProfile();
  return twilioPhoneNumber;
}
