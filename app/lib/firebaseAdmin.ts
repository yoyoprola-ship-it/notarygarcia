// Firebase Admin SDK singleton (server-only).
import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    projectId: 'notaryhost-33a33',
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
