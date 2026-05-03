import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { TopNavbar } from '@/components/layout/top-navbar'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { EmergencyButton } from '@/components/emergency/emergency-button'
import { EmergencyModal } from '@/components/emergency/emergency-modal'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: 'Akili Health | Dokita AI',
  description: 'Nigeria\'s Unified Healthcare Delivery & AI Platform. Your personal AI health assistant for symptom checking, medication reminders, and facility finding.',
  generator: 'Akili Health',
  keywords: ['healthcare', 'Nigeria', 'AI', 'symptom checker', 'health records', 'medication reminders'],
  authors: [{ name: 'Akili Health' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          {/* Top Navigation */}
          <TopNavbar />
          
          <div className="flex flex-1">
            {/* Desktop Sidebar */}
            <DesktopSidebar />
            
            {/* Main Content */}
            <main className="flex-1 pb-20 lg:pb-0">
              {children}
            </main>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
          
          {/* Emergency Button (always visible) */}
          <EmergencyButton />
          
          {/* Emergency Modal */}
          <EmergencyModal />
        </div>
        
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
