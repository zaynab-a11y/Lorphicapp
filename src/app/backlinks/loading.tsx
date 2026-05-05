export default function Loading() {
  return (
    <div className="flex min-h-dvh bg-background">
      <div className="hidden md:block w-64 flex-shrink-0" />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b border-border bg-background/80" />
        <div className="flex-1 p-4 md:p-6 space-y-4 animate-pulse">
          <div className="h-48 bg-border rounded-2xl" />
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-border rounded-xl" />)}</div>
        </div>
      </div>
    </div>
  )
}
