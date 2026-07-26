'use client';
// Firebase Phone Auth helpers — mismo patrón que rudewear/toolhome.
// Usado por (a) el BookingModal público (customer verifica phone antes
// de confirmar cita) y (b) el /owner/login (notary auth).

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as fbSignOut,
  onAuthStateChanged,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('setupRecaptcha called server-side');
  }
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      /* ignore */
    }
    window.recaptchaVerifier = undefined;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      /* success */
    },
    'expired-callback': () => {
      /* next attempt resets */
    },
  });
  return window.recaptchaVerifier;
}

export async function sendSmsCode(digitsUS: string): Promise<void> {
  if (!/^\d{10}$/.test(digitsUS)) {
    throw new Error('Phone must be 10 digits (US only).');
  }
  if (!window.recaptchaVerifier) {
    throw new Error('reCAPTCHA verifier not initialized.');
  }
  const result = await signInWithPhoneNumber(
    auth,
    `+1${digitsUS}`,
    window.recaptchaVerifier
  );
  window.confirmationResult = result;
}

export async function confirmSmsCode(code: string): Promise<User> {
  if (!/^\d{6}$/.test(code)) {
    throw new Error('Code must be 6 digits.');
  }
  if (!window.confirmationResult) {
    throw new Error('No pending confirmation. Request a new code.');
  }
  const cred = await window.confirmationResult.confirm(code);
  window.confirmationResult = undefined;
  return cred.user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}
