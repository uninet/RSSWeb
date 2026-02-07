'use client'

import { SubscriptionForm } from '@/components/SubscriptionForm'
import { SubscriptionList } from '@/components/SubscriptionList'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="/">
                <ArrowLeft className="h-4 w-4" />
              </a>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">订阅管理</h1>
              <p className="text-sm text-zinc-500">
                管理你的 RSS 订阅源，按分类浏览和添加新订阅
              </p>
            </div>
            <Button variant="ghost" size="icon" title="设置">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <SubscriptionList />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm dark:bg-zinc-950/80 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-zinc-500">
          <p>
            © 2026 RSSWeb. 使用 Next.js、shadcn/ui 和 Tailwind CSS 构建
          </p>
        </div>
      </footer>
    </div>
  )
}
