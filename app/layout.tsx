import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '서울 팝업 상점 대시보드',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
