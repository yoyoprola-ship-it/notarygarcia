import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy · Notary Garcia',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-ink">
      <header className="border-b border-gold/20 bg-ink/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-cream">
            Notary Garcia
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-2">Legal</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-cream mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-cream/50 mb-6">Last updated: July 25, 2026</p>

        <div className="border border-gold/30 bg-ink-light rounded-lg p-4 text-sm text-cream/70 mb-10">
          This policy is a general-purpose template drafted for the actual services offered on
          this site. It is not legal advice — have it reviewed by an attorney before treating it
          as final.
        </div>

        <div className="bg-cream rounded-2xl p-8 sm:p-10 shadow-xl">
        <div className="prose-notary space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">1. Who we are</h2>
            <p>
              This site is operated by Jose E. Garcia, a bilingual Notary Public serving
              Lafayette, LA (&ldquo;we,&rdquo; &ldquo;us&rdquo;). This policy explains what
              information we collect from visitors and clients who use this website or call our
              phone line, and how we use it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your name and phone number, when you book an appointment or call us</li>
              <li>Appointment details — date, time, and any notes you provide about what you need</li>
              <li>
                A recording of your message, if you leave a voice consultation through our phone
                system
              </li>
              <li>Phone verification codes, used only to confirm you own the phone number you provide</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">3. How we use this information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To schedule, confirm, and remind you about your appointment</li>
              <li>To contact you about your notarization needs, including by phone and text message</li>
              <li>To review voice consultations and respond to them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">4. Text messages</h2>
            <p>
              By providing your phone number, you agree to receive text messages related to your
              appointment (confirmations, reminders, and replies to voice consultations). Message
              and data rates may apply. We don&apos;t use your number for marketing you
              haven&apos;t asked for.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">5. Who we share information with</h2>
            <p>We don&apos;t sell your information. We use these service providers to run the site and phone system:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Twilio</strong> — sends text messages and powers our phone line</li>
              <li><strong>Google Firebase</strong> — securely stores your appointment and consultation data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">6. Data retention</h2>
            <p>
              We keep appointment and consultation records for as long as reasonably needed for
              our business and legal record-keeping obligations as a notary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">7. Your rights</h2>
            <p>
              You can ask us to access, correct, or delete your information by contacting us at
              the number or email below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">8. Not legal advice</h2>
            <p>
              Jose E. Garcia is a Notary Public, not an attorney, and does not provide legal
              advice. Collecting your information to schedule or perform a notarization does not
              create an attorney-client relationship.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">9. Changes to this policy</h2>
            <p>We may update this policy from time to time. The date at the top shows the latest revision.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-2">10. Contact</h2>
            <p>
              Call <a className="text-amber-800 font-bold" href="tel:+13378494503">(337) 849-4503</a>{' '}
              or visit us at 100 Eva Dr, Lafayette, LA 70508.
            </p>
          </section>
        </div>
        </div>
      </main>

      <footer className="border-t border-gold/15 py-6 text-center bg-ink">
        <p className="text-xs text-cream/50">
          <Link href="/" className="underline decoration-gold/20 hover:decoration-gold/50 hover:text-cream">
            ← Back to Notary Garcia
          </Link>
        </p>
      </footer>
    </div>
  );
}
