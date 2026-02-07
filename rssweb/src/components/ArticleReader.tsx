'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, ArrowLeft, Star, Share2, Clock, Maximize2, Check } from 'lucide-react'
import { Article } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ArticleReaderProps {
  articleId: string
}

export function ArticleReader({ articleId }: ArticleReaderProps) {
  const { articles, markAsRead, toggleFavorite } = useApp()
  const article = articles.find((a) => a.id === articleId)

  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  if (!article) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center">
        <CardContent>
          <p className="text-zinc-500">未找到文章</p>
        </CardContent>
      </Card>
    )
  }

  const timeAgo = formatDistanceToNow(article.pubDate, {
    addSuffix: true,
    locale: zhCN,
  })

  const handleMarkAsRead = () => {
    markAsRead(article.id)
  }

  const handleToggleFavorite = () => {
    toggleFavorite(article.id)
  }

  const handleVisit = () => {
    window.open(article.link, '_blank', 'noopener,noreferrer')
  }

  const fetchFullContent = async () => {
    setLoading(true)
    try {
      // 在实际应用中，这里应该调用 API 获取全文
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setContent(
        <div className="prose prose max-w-none dark:prose-invert">
          <h1 className="text-2xl font-bold mb-4">{article.title}</h1>

          <div className="flex items-center gap-4 text-sm text-zinc-500 mb-6">
            <Clock className="h-4 w-4" />
            <span>发布于 {timeAgo}</span>
            {article.author && (
              <>
                <span>·</span>
                <span>{article.author}</span>
              </>
            )}
            <span>·</span>
            <span className="flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                原文链接
              </a>
            </span>
          </div>

          {article.description && (
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-6 text-sm text-zinc-600 dark:text-zinc-400">
              {article.description}
            </div>
          )}

          <div className="text-zinc-700 dark:text-zinc-300 leading-7">
            {article.content || article.description}
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={handleMarkAsRead} disabled={article.isRead}>
              <Check className="h-4 w-4 mr-2" />
              {article.isRead ? '已读' : '标记为已读'}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleToggleFavorite}>
              <Star className={`h-4 w-4 mr-2 ${article.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              {article.isFavorite ? '已收藏' : '收藏'}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleVisit}>
              <ExternalLink className="h-4 w-4 mr-2" />
              打开原文
            </Button>

            <Button variant="ghost" size="sm" onClick={() => window.close()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Button>
          </div>
        </div>
      )

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch full content:', error)
      alert('获取全文失败')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">文章阅读</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                <Star className={`h-4 w-4 ${article.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-200 border-t-transparent"></div>
                <p className="mt-4 text-zinc-500">加载中...</p>
              </div>
            ) : (
              <div className="flex">
                {/* Article Content */}
                <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-8rem)]">
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <div className="text-center py-20 text-zinc-500">
                      <Button onClick={fetchFullContent} variant="outline">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        加载全文内容
                      </Button>
                    </div>
                  )}
                </div>

                {/* Sidebar - Metadata */}
                <aside className="w-80 flex-shrink-0 border-l bg-zinc-50 dark:bg-zinc-900 p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">{article.title}</h2>
                  </div>

                  <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>发布于 {timeAgo}</span>
                    </div>
                    {article.author && (
                      <div className="flex items-center gap-2">
                        <span>作者</span>
                        <span>{article.author}</span>
                      </div>
                    )}
                    {article.category && (
                      <div className="flex items-center gap-2">
                        <span>分类</span>
                        <span>{article.category}</span>
                      </div>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span>标签</span>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Button variant="outline" className="w-full" onClick={handleMarkAsRead} disabled={article.isRead}>
                      <Check className="h-4 w-4 mr-2" />
                      {article.isRead ? '已读' : '标记为已读'}
                    </Button>

                    <Button variant="outline" className="w-full" onClick={handleToggleFavorite}>
                      <Star className={`h-4 w-4 mr-2 ${article.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      {article.isFavorite ? '取消收藏' : '添加到收藏'}
                    </Button>

                    <Button className="w-full" onClick={handleVisit}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      访问原文
                    </Button>
                  </div>
                </aside>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
