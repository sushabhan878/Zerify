import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zerify — Direct Collaboration Platform for Brands & Influencers',
  description:
    'Zerify is the direct collaboration platform connecting top brands with high-converting creators & influencers. No agency overhead.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  keywords: [
    'influencer collaboration',
    'brand creator platform',
    'direct influencer marketing',
    'UGC video ads',
    'brand influencer platform',
    'brand creator network',
  ],
  openGraph: {
    title: 'Zerify — Direct Brand & Creator Collaboration',
    description:
      'Connect directly with top-performing creators & manage video campaigns seamlessly.',
    type: 'website',
    url: 'https://zerify.in',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090E] text-slate-100 antialiased selection:bg-purple-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
