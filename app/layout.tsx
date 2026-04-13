import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const appname = process.env.NEXT_PUBLIC_APP_NAME;

export const metadata: Metadata = {
  title: {
    default: `${appname} — Premium Contemporary Fashion`,
    template: `%s | ${appname}`,
  },
  description:
    `Discover premium contemporary fashion at ${appname}. Curated collections of elevated essentials crafted for the discerning individual.`,
  keywords: ['fashion', 'luxury', 'clothing', 'premium', 'Nigeria', 'contemporary'],
  authors: [{ name: appname }],
  creator: appname,
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: appname,
    title: `${appname} — Premium Contemporary Fashion`,
    description: 'Curated collections of elevated essentials.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${appname} Fashion`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${appname} — Premium Contemporary Fashion`,
    description: 'Curated collections of elevated essentials.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-ivory text-ink font-body antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-dm-sans)',
              background: '#1A1A1A',
              color: '#FAF9F6',
              borderRadius: '2px',
              fontSize: '13px',
              letterSpacing: '0.02em',
            },
          }}
        />
      </body>
    </html>
  );
}
