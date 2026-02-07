'use client'

import { ResetDetectorTest } from '@/components/ResetDetectorTest'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function ResetTestPage() {
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
              <h1 className="text-2xl font-bold">重置时间探测测试</h1>
              <p className="text-sm text-zinc-500">
                验证 Big Model 额度重置时间探测系统
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ResetDetectorTest />
        </div>
      </main>
    </div>
  )
}
