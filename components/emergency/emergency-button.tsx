'use client'

import { Phone, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEmergencyStore } from '@/stores/emergency-store'

interface EmergencyButtonProps {
  className?: string
  variant?: 'floating' | 'inline'
  children?: React.ReactNode
}

export function EmergencyButton({ className, variant = 'floating', children }: EmergencyButtonProps) {
  const { isEmergencyMode, activateEmergency } = useEmergencyStore()

  const handleEmergencyClick = () => {
    activateEmergency()
  }

  // Emergency mode has its own full-screen call controls.
  if (isEmergencyMode && variant === 'floating') {
    return null
  }

  if (variant === 'inline') {
    return (
      <Button
        onClick={handleEmergencyClick}
        variant="destructive"
        size="lg"
        className={cn(
          'gap-2 font-bold',
          className
        )}
      >
        {children || (
          <>
            <Phone className="h-5 w-5" />
            Emergency
          </>
        )}
      </Button>
    )
  }

  return (
    <button
      onClick={handleEmergencyClick}
      className={cn(
        'fixed z-[90] flex items-center gap-2 rounded-2xl px-4 py-3',
        'bg-destructive text-destructive-foreground',
        'text-sm font-bold',
        'shadow-lg shadow-destructive/30',
        'transition-all duration-300 ease-in-out',
        'hover:scale-105 hover:shadow-xl hover:shadow-destructive/40',
        'active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2',
        'emergency-pulse',
        // Mobile: keep emergency visible without covering chat/forms or bottom navigation.
        'right-3 top-16 lg:hidden',
        className
      )}
      aria-label="Emergency - Get immediate help"
    >
      <AlertTriangle className="h-5 w-5 animate-pulse" />
      <span>Emergency</span>
    </button>
  )
}
