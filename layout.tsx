import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CliniSys Prior Auth Justification',
  description: 'Generate payer-ready medical necessity in under 3 minutes',
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
