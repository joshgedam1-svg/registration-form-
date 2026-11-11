import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaServiceWorkerRegister from '@/components/PwaServiceWorkerRegister';

export const viewport: Viewport = {
  themeColor: '#176B45',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  title: 'Cricket Auction League | Player Registration & Tournament Portal',
  description: 'Official player registration and management portal for the Cricket Auction League tournament.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CAL 2026'
  },
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-brand-dark antialiased">
        {children}
        <PwaServiceWorkerRegister />
      </body>
    </html>
  );
}
