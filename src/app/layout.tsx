import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cricket Auction League | Player Registration & Tournament Portal',
  description: 'Official player registration and management portal for the Cricket Auction League tournament.',
  icons: {
    icon: '/logo.svg',
  },
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
      </body>
    </html>
  );
}
