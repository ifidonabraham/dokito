'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, User, LogOut, FileText, MapPin, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSidebarStore } from '@/stores/sidebar-store'
import { createClient } from '@/lib/supabase/client'
import { DokitoLogo } from '@/components/brand/dokito-logo'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function TopNavbar() {
  const router = useRouter()
  const supabase = createClient()
  const { isOpen, toggle } = useSidebarStore()
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    if (!supabase) {
      return
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    if (!supabase) return

    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || ''
  const userAvatar = user?.user_metadata?.avatar_url || ''

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="flex h-14 items-center gap-3 px-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 h-9 w-9"
            onClick={toggle}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <DokitoLogo className="text-lg" />
          </Link>

          <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            <Button asChild variant="ghost" size="sm">
              <Link href="/records">
                <FileText className="mr-2 h-4 w-4" />
                Records
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/ask">
                <MessageCircle className="mr-2 h-4 w-4" />
                Dokito AI
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/facilities">
                <MapPin className="mr-2 h-4 w-4" />
                Facilities
              </Link>
            </Button>
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/records">
                      <FileText className="mr-2 h-4 w-4" />
                      Health Records
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={async () => {
                  if (!supabase) return

                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

      </header>
    </>
  )
}
