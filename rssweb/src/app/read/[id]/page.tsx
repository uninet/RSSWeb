import Link from 'next/link'
import { ArticleReader } from '@/components/ArticleReader'
import { ArrowLeft, Settings, Share2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" title="返回首页">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">文章阅读</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" title="收藏">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="分享">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="设置">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <ArticleReader articleId={await params.id} />
      </main>
    </div>
  )
}
