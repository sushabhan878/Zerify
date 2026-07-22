import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Zerify — The #1 AI Creator Marketplace for Brands & Influencers',
  description: 'Zerify connects top eCommerce brands with high-converting video creators & influencers. Join the VIP waitlist today.',
  keywords: ['influencer marketing', 'creator marketplace', 'billo alternative', 'UGC video ads', 'brand influencer platform', 'AI creator matching'],
  openGraph: {
    title: 'Zerify — The #1 AI Creator Marketplace',
    description: 'Connect with top-performing creators & generate high-converting video ads in minutes.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090E] text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
