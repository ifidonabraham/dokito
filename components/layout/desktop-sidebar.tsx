'use client'

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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

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

  return (
    <aside className="hidden md:flex fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 flex-col border-r border-border bg-sidebar">
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {/* Main Navigation */}
          <div className="mb-2">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Main
            </p>
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>

          <Separator className="my-3" />

          {/* Health Management */}
          <div className="mb-2">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Health Management
            </p>
            {healthNavItems.map((item) => (
              <NavLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>

          <Separator className="my-3" />

          {/* Secondary Navigation */}
          <div>
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              More
            </p>
            {secondaryNavItems.map((item) => (
              <NavLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Heart className="h-4 w-4 text-primary" />
          <span>Dokita Health</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Your health companion
        </p>
      </div>
    </aside>
  )
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
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
      <Link href={item.href}>
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
