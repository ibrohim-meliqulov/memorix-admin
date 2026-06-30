import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Memorix Admin',
  description: 'Memorix boshqaruv paneli',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  )
}
