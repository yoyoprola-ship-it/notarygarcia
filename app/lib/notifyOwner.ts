// Notificaciones al owner por email (Resend) — antes eran SMS por Twilio,
// pero cada SMS tiene costo por envío mientras que el email es prácticamente
// gratis con el plan de Resend ya usado para el 2FA del admin.
// notifyOwnerOfBooking  — nueva cita creada
// notifyOwnerOfCancellation — cita cancelada por el cliente

import { getOwnerEmail } from './notaryProfile';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendOwnerEmail(subject: string, bodyHtml: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'notifications@notaryhost.com';
  const to = await getOwnerEmail().catch(() => '');

  if (!apiKey || !to) {
    console.warn('[notifyOwner] Missing Resend API key or owner email — skipping notification');
    return;
  }

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fafaf9; color: #0f172a;">
      <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 16px;">Notary Garcia</p>
      ${bodyHtml}
    </div>
  `;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: [to], subject, html }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[notifyOwner] Resend error:', { status: res.status, err });
      return;
    }
    console.log('[notifyOwner] email sent to owner');
  } catch (err) {
    console.error('[notifyOwner] email send failed:', err);
  } finally {
    clearTimeout(timer);
  }
}

interface BookingNotifyPayload {
  customerName: string;
  customerPhone: string;      // 10 dígitos
  slotIso: string;            // "YYYY-MM-DDTHH:00:00"
  notes?: string;             // qué necesita el customer
}

export async function notifyOwnerOfBooking(b: BookingNotifyPayload): Promise<void> {
  const phone = formatPhone(b.customerPhone);
  const when = formatSlot(b.slotIso);
  const notesLine = b.notes && b.notes.trim().length > 0
    ? `<p style="margin: 8px 0 0;"><strong>Needs:</strong> ${escapeHtml(b.notes.trim())}</p>`
    : '';

  await sendOwnerEmail(
    `New appointment — ${b.customerName}`,
    `
      <h1 style="font-size: 18px; margin: 0 0 12px;">New appointment</h1>
      <p style="margin: 0;"><strong>${escapeHtml(b.customerName)}</strong> · ${escapeHtml(phone)}</p>
      <p style="margin: 4px 0 0;">${escapeHtml(when)}</p>
      ${notesLine}
    `
  );
}

export interface CancellationNotifyPayload {
  customerName: string;
  customerPhone: string;
  slotIso: string;
}

export async function notifyOwnerOfCancellation(b: CancellationNotifyPayload): Promise<void> {
  const phone = formatPhone(b.customerPhone);
  const when = formatSlot(b.slotIso);

  await sendOwnerEmail(
    `Appointment cancelled — ${b.customerName}`,
    `
      <h1 style="font-size: 18px; margin: 0 0 12px; color: #b91c1c;">Appointment cancelled</h1>
      <p style="margin: 0;"><strong>${escapeHtml(b.customerName)}</strong> · ${escapeHtml(phone)}</p>
      <p style="margin: 4px 0 0;">${escapeHtml(when)}</p>
    `
  );
}

export async function notifyOwnerOfConsultation(callerPhone: string, lang: string): Promise<void> {
  const phone = formatPhone(callerPhone);
  await sendOwnerEmail(
    `New voice consultation — ${phone}`,
    `
      <h1 style="font-size: 18px; margin: 0 0 12px;">New voice consultation</h1>
      <p style="margin: 0;"><strong>${escapeHtml(phone)}</strong></p>
      <p style="margin: 4px 0 0;">Language: ${escapeHtml(lang.toUpperCase())}</p>
      <p style="margin: 16px 0 0; color: #64748b; font-size: 13px;">Listen to the recording in the admin dashboard.</p>
    `
  );
}

function formatPhone(p: string): string {
  const d = (p || '').replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return p;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// "2026-07-18T14:00:00" → "Sat Jul 18, 2 PM"
function formatSlot(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):/);
  if (!m) return iso;
  const [, y, mo, d, hh] = m;
  const h = parseInt(hh, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const twelve = h % 12 === 0 ? 12 : h % 12;
  const date = new Date(`${y}-${mo}-${d}T12:00:00`);
  const dow = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'America/Chicago',
  }).format(date);
  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'America/Chicago',
  }).format(date);
  return `${dow} ${monthName} ${parseInt(d, 10)}, ${twelve} ${suffix}`;
}
