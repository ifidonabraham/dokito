import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { TopNavbar } from '@/components/layout/top-navbar'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { EmergencyButton } from '@/components/emergency/emergency-button'
import { EmergencyModal } from '@/components/emergency/emergency-modal'

// Use system fonts as fallback - Google Fonts will load dynamically in the CSS if available
const inter = { variable: '' };
const jakarta = { variable: '' };

export const metadata: Metadata = {
  title: 'DOKITO | AI Health Support for Nigeria',
  description: 'DOKITO helps Nigerians keep health records, ask Dokito AI for health guidance, find nearby care, and access emergency support.',
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
      <body className="overflow-x-hidden bg-background font-sans antialiased">
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
          {/* Top Navigation */}
          <TopNavbar />
          
          <div className="flex flex-1">
            {/* Desktop Sidebar */}
            <DesktopSidebar />
            
            {/* Main Content */}
            <main className="min-w-0 flex-1 overflow-x-hidden pb-20 lg:ml-64 lg:pb-0">
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
