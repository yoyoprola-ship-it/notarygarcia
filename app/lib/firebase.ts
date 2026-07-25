'use client';
// Firebase client-side singleton. Shares the same Firebase project as the
// main NotaryHost app (notaryhost-33a33), reachable at notaryhost.com. Every
// collection here is prefixed `notarygarcia_` so it never collides with
// notaryhost's own `notaries`/`users` collections, or with the next notary
// clone's own prefix.
//
// Config is hardcoded rather than injected via secrets: Firebase web app
// config is not sensitive (it ships in the client bundle by design; access
// control lives in Firestore Security Rules, not in hiding this object) —
// same reasoning already applied in the main notaryhost app's src/firebase.js.
//
// Init directo (no Proxy) — Firestore SDK hace instanceof checks
// internos sobre el argument de collection() y otros; un Proxy los
// rompe.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: 'notaryhost-33a33',
  appId: '1:1018880442313:web:1aa7e9c7e0fc53392ab218',
  storageBucket: 'notaryhost-33a33.firebasestorage.app',
  apiKey: 'AIzaSyBgDREKYT_iOk8v0-7U02BCSTJb5ypm8GI',
  authDomain: 'notaryhost-33a33.firebaseapp.com',
  messagingSenderId: '1018880442313',
};

const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
