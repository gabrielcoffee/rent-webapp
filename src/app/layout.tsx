import type { Metadata } from 'next'
import { Calistoga } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const calistoga = Calistoga({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-calistoga',
})

export const metadata: Metadata = {
  title: 'Rent - Sistema de Aluguel C2C',
  description: 'Plataforma de aluguel de itens entre pessoas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
