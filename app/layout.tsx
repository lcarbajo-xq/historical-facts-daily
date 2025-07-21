import type { Metadata } from 'next'
import './globals.css'
import { Footer } from '@/components/ui/footer'

export const metadata: Metadata = {
  title: 'Historical Facts Daily',
  description:
    'Descubre hechos históricos interesantes que ocurrieron en cada día del año',
  generator: 'v0.dev'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es'>
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
