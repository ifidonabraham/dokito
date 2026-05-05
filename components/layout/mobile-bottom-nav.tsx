'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, MessageCircle, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEmergencyStore } from '@/stores/emergency-store'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/records', label: 'Records', icon: FileText },
  { href: '/ask', label: 'Dokita', icon: MessageCircle },
  { href: '/facilities', label: 'Facilities', icon: MapPin },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { isActive: isEmergencyActive } = useEmergencyStore()

  // Hide bottom nav during emergency mode
  if (isEmergencyActive) {
    return null
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform',
                  isActive && 'scale-110'
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
