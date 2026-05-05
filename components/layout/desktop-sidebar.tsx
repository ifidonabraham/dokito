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
  User,
  AlertTriangle,
  Pill,
  Activity,
  Heart,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useSidebarStore } from '@/stores/sidebar-store'
import { EmergencyButton } from '@/components/emergency/emergency-button'

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
  { href: '/facilities', label: 'Facility Finder', icon: MapPin },
  { href: '/profile', label: 'Profile', icon: User },
]

const futureNavItems: NavItem[] = [
  { href: '#chronic-tracking', label: 'Chronic Tracking', icon: Activity },
]

const careNavItems: NavItem[] = [
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/medications', label: 'Prescription Tracker', icon: Pill },
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
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
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
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border flex flex-col shadow-xl overflow-hidden">
            {/* Header with close button */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
              <Link href="/" onClick={close} className="flex items-center gap-2 font-bold text-lg text-primary">
                <Heart className="h-6 w-6 fill-primary text-primary-foreground" />
                <span>AKILI Health</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={close} className="h-8 w-8">
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <SidebarContent pathname={pathname} onLinkClick={close} />
            </div>
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
      <EmergencyButton
        variant="inline"
        className="mb-4 w-full justify-center rounded-md bg-red-600 text-white hover:bg-red-700"
      />

      <div className="mb-2">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Main navigation
        </p>
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)}
            onClick={onLinkClick}
          />
        ))}
      </div>

      <Separator className="my-3" />

      <div className="mb-2">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Care tracking
        </p>
        {careNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname.startsWith(item.href)}
            onClick={onLinkClick}
          />
        ))}
      </div>

      <Separator className="my-3" />

      <div className="mb-2">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coming later
        </p>
        {futureNavItems.map((item) => (
          <DisabledNavItem key={item.label} item={item} />
        ))}
      </div>

      <Separator className="my-3" />

      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-950 dark:border-red-950 dark:bg-red-950/30 dark:text-red-50">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-5">
            Emergency help stays available on every screen.
          </p>
        </div>
      </div>
    </nav>
  )
}

function DisabledNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon

  return (
    <div
      className="flex h-10 w-full items-center justify-start gap-3 rounded-md px-3 text-sm text-muted-foreground opacity-70"
      aria-disabled="true"
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
      <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
        Soon
      </span>
    </div>
  )
}

function SidebarFooter() {
  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Heart className="h-4 w-4 text-primary" />
        <span>AKILI Health</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Health support for Nigeria
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
      <Link href={item.href} onClick={onClick} aria-current={isActive ? 'page' : undefined}>
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
