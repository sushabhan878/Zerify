import React from 'react';
import { Syne } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://zerify.in'),
  title: 'Zerify — Direct Collaboration Platform for Brands & Influencers',
  description: 'Zerify is the direct collaboration platform connecting top brands with high-converting creators & influencers. No agency overhead.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  keywords: ['influencer collaboration', 'brand creator platform', 'direct influencer marketing', 'UGC video ads', 'brand influencer platform', 'brand creator network'],
  openGraph: {
    title: 'Zerify — Direct Brand & Creator Collaboration',
    description: 'Connect directly with top-performing creators & manage video campaigns seamlessly.',
    url: 'https://zerify.in',
    siteName: 'Zerify',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Zerify Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zerify — Direct Brand & Creator Collaboration',
    description: 'Connect directly with top-performing creators & manage video campaigns seamlessly.',
    images: ['/logo.png'],
  },
};

import { ToastProvider } from '@/components/ui/Toast';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`light ${syne.variable}`}>
      <body className="bg-[#07090E] light:bg-[#F1F3F7] text-slate-100 light:text-slate-900 antialiased selection:bg-purple-500 selection:text-white">
        <ThemeProvider>
          <CurrencyProvider>
            <ToastProvider>{children}</ToastProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

