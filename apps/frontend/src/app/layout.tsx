import React from 'react';
import { Syne } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
});

export const metadata = {
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
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${syne.variable}`}>
      <body className="bg-[#07090E] text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

