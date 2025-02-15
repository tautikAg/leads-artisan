import { useEffect, Fragment } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface SheetContentProps {
  children: React.ReactNode
  className?: string
}

interface SheetHeaderProps {
  children: React.ReactNode
}

interface SheetTitleProps {
  children: React.ReactNode
  className?: string
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <Fragment>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </Fragment>,
    document.body
  )
}

export function SheetContent({ children, className = "" }: SheetContentProps) {
  return (
    <div 
      className={`fixed right-0 top-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${className}`}
    >
      <button
        onClick={() => document.dispatchEvent(new Event('closeSheet'))}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
      >
        <span className="sr-only">Close</span>
      </button>
      {children}
    </div>
  )
}

export function SheetHeader({ children }: SheetHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      {children}
    </div>
  )
}

export function SheetTitle({ children, className = "" }: SheetTitleProps) {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  )
} 