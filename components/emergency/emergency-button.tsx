'use client'

import { useState } from 'react'
import { Phone, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEmergencyStore } from '@/stores/emergency-store'
import { EmergencyModal } from './emergency-modal'

interface EmergencyButtonProps {
  className?: string
  variant?: 'floating' | 'inline'
}

export function EmergencyButton({ className, variant = 'floating' }: EmergencyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isActive, startEmergency } = useEmergencyStore()

  const handleEmergencyClick = () => {
    setIsModalOpen(true)
    startEmergency()
  }

  // Don't show the button if already in emergency mode
  if (isActive && variant === 'floating') {
    return null
  }

  if (variant === 'inline') {
    return (
      <>
        <Button
          onClick={handleEmergencyClick}
          variant="destructive"
          size="lg"
          className={cn(
            'gap-2 font-bold',
            className
          )}
        >
          <Phone className="h-5 w-5" />
          Emergency
        </Button>
        <EmergencyModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </>
    )
  }

  return (
    <>
      {/* Floating Emergency Button */}
      <button
        onClick={handleEmergencyClick}
        className={cn(
          'fixed z-50 flex items-center gap-2 px-5 py-3 rounded-full',
          'bg-destructive text-destructive-foreground',
          'font-bold text-sm uppercase tracking-wide',
          'shadow-lg shadow-destructive/30',
          'transition-all duration-300 ease-in-out',
          'hover:scale-105 hover:shadow-xl hover:shadow-destructive/40',
          'active:scale-95',
          'emergency-pulse',
          // Mobile: bottom right above bottom nav
          'bottom-20 right-4 md:bottom-auto md:top-20 md:right-6',
          className
        )}
        aria-label="Emergency - Get immediate help"
      >
        <AlertTriangle className="h-5 w-5 animate-pulse" />
        <span className="hidden sm:inline">EMERGENCY</span>
        <span className="sm:hidden">SOS</span>
      </button>

      <EmergencyModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
