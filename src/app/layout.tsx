// src/app/layout.tsx
import { Metadata } from 'next';
import { Viewport } from 'next';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1F2937',
};

export const metadata: Metadata = {
  title: 'MyFrog.me - Task Management Made Simple',
  description: 'Organize your tasks efficiently with MyFrog.me',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KS2H84HC');
            `,
          }}
        />
      </head>
      <body className="bg-gray-900 min-h-screen text-white">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KS2H84HC"
            height="0"
            width="0"
            style={{
              display: 'none',
              visibility: 'hidden',
            }}
            title="Google Tag Manager"
            aria-hidden="true"
          />
        </noscript>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <main id="main-content" className="flex-grow">
              {children}
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#374151',
                  color: '#fff',
                },
                className: 'toast-message',
                duration: 4000,
              }}
              containerStyle={{
                top: 64,
              }}
            />
          </div>
        </Providers>
      </body>
    </html>
  );
}