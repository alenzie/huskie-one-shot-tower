import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aurelia Tower — Procedural R3F Skyscraper',
  description: 'A procedurally constructed luxury Gulf skyscraper in React Three Fiber.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
