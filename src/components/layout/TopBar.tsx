'use client'

interface TopBarProps {
  title: string
  subtitle?: string
  user?: { email?: string } | null
}

export default function TopBar({ title, subtitle, user }: TopBarProps) {
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div>
        <h2 className="text-white font-semibold text-lg leading-tight">{title}</h2>
        {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted hover:text-white hover:border-primary/50 transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-xs font-medium leading-tight">{user?.email?.split('@')[0] ?? 'User'}</p>
            <p className="text-muted text-xs">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
