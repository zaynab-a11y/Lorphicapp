'use client'

interface TopBarProps {
  title: string
  subtitle?: string
  user?: { email?: string; name?: string } | null
  onMenuClick?: () => void
}

export default function TopBar({ title, subtitle, user, onMenuClick }: TopBarProps) {
  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-white sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-gray-100 border border-border transition-all"
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div className="min-w-0">
          <h2 className="text-foreground font-bold text-base md:text-lg leading-tight truncate">{title}</h2>
          {subtitle && <p className="text-muted text-xs mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-primary/50 transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-foreground text-xs font-semibold leading-tight">{displayName}</p>
            <p className="text-muted text-xs">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
