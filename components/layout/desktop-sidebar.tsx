'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FileText,
  MessageCircle,
  MapPin,
  Calendar,
  Clock,
  Settings,
  HelpCircle,
  Pill,
  Heart,
  Activity,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useSidebarStore } from '@/stores/sidebar-store'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: string | number
}

const mainNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/records', label: 'Health Records', icon: FileText },
  { href: '/ask', label: 'Ask Dokita', icon: MessageCircle },
  { href: '/facilities', label: 'Find Hospital', icon: MapPin },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
]

const healthNavItems: NavItem[] = [
  { href: '/vitals', label: 'Vitals Tracker', icon: Activity },
  { href: '/medications', label: 'Medications', icon: Pill },
  { href: '/programs', label: 'Health Programs', icon: Heart },
]

const secondaryNavItems: NavItem[] = [
  { href: '/emergency-history', label: 'Emergency History', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebarStore()

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    close()
  }, [pathname, close])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, close])

  return (
    <>
      {/* Mobile/Tablet Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={close}
            aria-hidden="true"
          />
          {/* Sidebar Panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border flex flex-col shadow-xl">
            {/* Header with close button */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
              <Link href="/" onClick={close} className="flex items-center gap-2 font-bold text-lg text-primary">
                <Heart className="h-6 w-6 fill-primary text-primary-foreground" />
                <span>Dokita</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={close} className="h-8 w-8">
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <SidebarContent pathname={pathname} onLinkClick={close} />
            </ScrollArea>
            <SidebarFooter />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar - Always visible on large screens */}
      <aside className="hidden lg:flex fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-border bg-background">
        <ScrollArea className="flex-1">
          <SidebarContent pathname={pathname} />
        </ScrollArea>
        <SidebarFooter />
      </aside>
    </>
  )
}

function SidebarContent({ pathname, onLinkClick }: { pathname: string; onLinkClick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {/* Main Navigation */}
      <div className="mb-2">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Main
        </p>
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={onLinkClick} />
        ))}
      </div>

      <Separator className="my-3" />

      {/* Health Management */}
      <div className="mb-2">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Health Management
        </p>
        {healthNavItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={onLinkClick} />
        ))}
      </div>

      <Separator className="my-3" />

      {/* Secondary Navigation */}
      <div>
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          More
        </p>
        {secondaryNavItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} onClick={onLinkClick} />
        ))}
      </div>
    </nav>
  )
}

function SidebarFooter() {
  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Heart className="h-4 w-4 text-primary" />
        <span>Dokita Health</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Your health companion
      </p>
    </div>
  )
}

function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  const Icon = item.icon

  return (
    <Button
      asChild
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 h-10',
        isActive && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
      )}
    >
      <Link href={item.href} onClick={onClick}>
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {item.badge}
          </span>
        )}
      </Link>
    </Button>
  )
}
