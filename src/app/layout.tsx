import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lorphic Dashboard — SEO Client Portal',
  description: 'Track your SEO performance, rankings, and growth with Lorphic Dashboard.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background min-h-screen">
        {children}
      </body>
    </html>
  )
}
