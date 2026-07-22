import React from 'react';

export const metadata = {
  title: 'Zerify — Brand & Influencer Platform',
  description: 'Global SaaS platform connecting brands and influencers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
