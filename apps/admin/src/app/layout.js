import React from 'react';
export const metadata = {
    title: 'Zerify Admin Portal',
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body>{children}</body>
    </html>);
}
