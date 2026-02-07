'use client'

import { ModelCallTest } from '@/components/ModelCallTest'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Zap } from 'lucide-react'

export default function ModelTestPage() {
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
              <h1 className="text-2xl font-bold">模型调用测试</h1>
              <p className="text-sm text-zinc-500">
                测试 Big Model 和 Gemini API 集成
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <a href="/reset-test">
                <Zap className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <ModelCallTest />
        </div>
      </main>
    </div>
  )
}
