import React from 'react';
export const metadata = {
    title: 'Zerify Documentation',
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body>{children}</body>
    </html>);
}
