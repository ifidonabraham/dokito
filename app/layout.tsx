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
  title: 'DOKITO | AI Health Support for Nigeria',
  description: 'DOKITO helps Nigerians keep health records, ask Dokita for health guidance, find nearby care, and access emergency support.',
  generator: 'DOKITO',
  keywords: ['healthcare', 'Nigeria', 'AI', 'symptom checker', 'health records', 'medication reminders'],
  authors: [{ name: 'DOKITO' }],
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.svg',
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
            <main className="flex-1 pb-20 lg:ml-64 lg:pb-0">
              {children}
            </main>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
        
        {/* Emergency Button (always visible, outside main container for proper z-index) */}
        <EmergencyButton />
        
        {/* Emergency Modal */}
        <EmergencyModal />
        
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
