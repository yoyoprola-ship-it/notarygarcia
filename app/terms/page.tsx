import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions · Notary Garcia',
};

export default function TermsPage() {
  return (
    <div className="min-h-full bg-navy">
      <header className="border-b border-gold/20 bg-navy/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-cream">
            Notary Garcia
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-2">Legal</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-cream mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-cream/50 mb-6">Last updated: July 25, 2026</p>

        <div className="border border-gold/30 bg-navy-light rounded-lg p-4 text-sm text-cream/70 mb-6">
          This is a general-purpose terms template drafted for the actual services offered on
          this site. It is not legal advice — have it reviewed by an attorney before treating it
          as final.
        </div>

        <div className="border-2 border-red-400/30 bg-red-950/30 rounded-lg p-5 mb-10">
          <p className="font-black text-red-200 mb-1">
            A Notary Public is not an attorney and cannot give legal advice.
          </p>
          <p className="text-sm text-red-300">
            Un Notario Público no es un abogado y no puede dar asesoría legal. Este servicio no
            sustituye la consulta con un abogado, especialmente para asuntos de inmigración.
          </p>
        </div>

        <div className="bg-cream rounded-2xl p-8 sm:p-10 shadow-xl">
        <div className="prose-notary space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">1. Services offered</h2>
            <p>
              Jose E. Garcia is a bilingual Notary Public serving Lafayette, LA, offering
              notarization services including powers of attorney, USCIS/NVC form notarization,
              contracts, and tax documents. We notarize signatures and documents — we do not
              prepare legal documents, give legal advice, or represent you before any government
              agency or court.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">2. Booking an appointment</h2>
            <p>
              You can book an appointment through this website or by calling our phone line.
              Booking requires a valid phone number, which we verify by text message. Appointment
              availability is subject to change.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">3. What to bring</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>A valid, unexpired government-issued photo ID</li>
              <li>The complete, unsigned document(s) you need notarized</li>
              <li>All signers must be personally present and sign willingly, without coercion</li>
            </ul>
            <p className="mt-2">
              We may decline to notarize if we have reason to doubt a signer&apos;s identity,
              willingness, or capacity, as required by Louisiana notary law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">4. Fees</h2>
            <p>
              Notarization fees are disclosed at the time of service and comply with applicable
              Louisiana notary fee limits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">5. Cancellations</h2>
            <p>
              Please give us at least 24 hours&apos; notice if you need to cancel or reschedule.
              You can reply to your confirmation text or call us directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">6. Voice consultations</h2>
            <p>
              If you leave a message through our phone system&apos;s voice consultation option,
              that message is recorded and reviewed by the notary before we respond. See our{' '}
              <Link href="/privacy" className="text-amber-800 underline">Privacy Policy</Link> for how recordings are handled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">7. Not legal advice</h2>
            <p>
              A Notary Public performs notarial acts — verifying identity and witnessing
              signatures. We are not attorneys, cannot draft or interpret legal documents, cannot
              advise on immigration strategy or forms (including USCIS/NVC filings), and cannot
              represent you in any legal or administrative proceeding. For legal advice, please
              consult a licensed attorney.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, our liability for any claim relating to our
              services is limited to the fee you paid for that notarization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">9. Governing law</h2>
            <p>These terms are governed by the laws of the State of Louisiana.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">10. Changes to these terms</h2>
            <p>We may update these terms from time to time. The date at the top shows the latest revision.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">11. Contact</h2>
            <p>
              Call <a className="text-amber-800 font-bold" href="tel:+13378494503">(337) 849-4503</a>{' '}
              or visit us at 100 Eva Dr, Lafayette, LA 70508.
            </p>
          </section>
        </div>
        </div>
      </main>

      <footer className="border-t border-gold/15 py-6 text-center bg-navy">
        <p className="text-xs text-cream/50">
          <Link href="/" className="underline decoration-gold/20 hover:decoration-gold/50 hover:text-cream">
            ← Back to Notary Garcia
          </Link>
        </p>
      </footer>
    </div>
  );
}
