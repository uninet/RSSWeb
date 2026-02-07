import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import { Navigation } from '@/components/Navigation'
import { Toaster } from '@/components/ui/toaster'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RSSWeb - 现代化 RSS 阅读器',
  description: '一个简洁、快速的 RSS 阅读器，支持订阅管理、文章收藏、全文阅读等功能。',
  keywords: 'RSS, 阅读器, 订阅, 文章, 新闻',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <div className="flex min-h-screen">
            {/* Navigation Sidebar */}
            <aside className="hidden w-64 flex-shrink-0 flex-col border-r bg-white/50 dark:bg-zinc-950/50 lg:flex">
              <Navigation />
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen overflow-y-auto">
              {children}
            </main>

            {/* Toast Notifications */}
            <Toaster />
          </div>
        </AppProvider>
      </body>
    </html>
  )
}
