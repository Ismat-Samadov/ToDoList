import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import Providers from '@/components/Providers'
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Providers>
  <div className="min-h-screen bg-gray-50">
    <Toaster position="top-right" />
    {children}
  </div>
</Providers>
      </body>
    </html>
  )
}