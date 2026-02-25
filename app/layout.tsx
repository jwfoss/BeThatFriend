import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Be That Friend',
  description: 'Never forget the important dates of people you care about',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer className="w-full py-6 flex flex-col items-center text-xs text-gray-500 mt-12">
          <div>
            <a href="/privacy" className="underline hover:text-indigo-600 mr-4">Privacy Policy</a>
            <a href="/terms" className="underline hover:text-indigo-600">Terms of Service</a>
          </div>
        </footer>
      </body>
    </html>
  )
}
