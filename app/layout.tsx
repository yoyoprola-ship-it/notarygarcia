import type { Metadata } from 'next';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Display serif for headings — same family NotaryHost uses on its own
// marketing site, so client sites read as part of one established
// platform instead of a generic template.
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Notary Garcia — Bilingual Notary Public in Lafayette, LA',
  description:
    'Jose E. Garcia — Notary Public serving Lafayette, LA in English and Spanish. Powers of attorney, USCIS/NVC forms, contracts, taxes, and more.',
  openGraph: {
    title: 'Notary Garcia · Lafayette, LA',
    description:
      'Bilingual notary services — powers of attorney, USCIS forms, contracts, taxes.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
