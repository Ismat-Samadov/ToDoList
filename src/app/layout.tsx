// src/app/layout.tsx
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css';

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
   <html lang="en">
     <head>
       <Script id="gtm-script">
         {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
         new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
         j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
         'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
         })(window,document,'script','dataLayer','GTM-KS2H84HC');`}
       </Script>
     </head>
     <body className="bg-gray-900 min-h-screen text-white">
       <noscript>
         <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KS2H84HC"
           height="0" width="0" style="display:none;visibility:hidden">
         </iframe>
       </noscript>
       <Providers>
         <Toaster
           position="top-right"
           toastOptions={{
             style: {
               background: '#374151',
               color: '#fff',
             },
           }}
         />
         {children}
       </Providers>
     </body>
   </html>
 );
}