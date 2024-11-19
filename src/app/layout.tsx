// src/app/layout.tsx
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 min-h-screen text-white">
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