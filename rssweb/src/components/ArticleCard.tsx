// 文章卡片组件

import { Article } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Star, Clock, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ArticleCardProps {
  article: Article
  onRead?: (id: string) => void
  onFavorite?: (id: string) => void
  onVisit?: (link: string) => void
  compact?: boolean
}

export function ArticleCard({
  article,
  onRead,
  onFavorite,
  onVisit,
  compact = false,
}: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(article.pubDate, {
    addSuffix: true,
    locale: zhCN,
  })

  const handleVisit = () => {
    onVisit?.(article.link)
    // 访问时自动标记为已读
    if (!article.isRead) {
      onRead?.(article.id)
    }
  }

  const handleFavorite = () => {
    onFavorite?.(article.id)
  }

  if (compact) {
    return (
      <Card className={`transition-colors ${article.isRead ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium line-clamp-2 ${article.isRead ? 'text-zinc-500' : ''}`}>
                {article.title}
              </h3>
              <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo}
                </div>
                {article.author && (
                  <span className="truncate">{article.author}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavorite}
                title={article.isFavorite ? '取消收藏' : '收藏'}
              >
                <Star
                  className={`h-4 w-4 ${article.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
                />
              </Button>
              {article.isRead && (
                <div className="flex items-center justify-center text-zinc-400">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`transition-all hover:shadow-md ${article.isRead ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-3">
        <h3
          className={`text-lg font-semibold line-clamp-2 ${article.isRead ? 'text-zinc-500' : ''}`}
        >
          {article.title}
        </h3>
        <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo}
          </div>
          {article.author && <span>·</span>}
          {article.author && <span className="truncate">{article.author}</span>}
          {article.tags && article.tags.length > 0 && <span>·</span>}
          {article.tags && article.tags.length > 0 && (
            <span className="truncate">{article.tags.join(', ')}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="line-clamp-3 text-zinc-600 dark:text-zinc-400">
          {article.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <Button variant="ghost" size="sm" onClick={handleFavorite}>
          <Star
            className={`mr-2 h-4 w-4 ${article.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
          />
          {article.isFavorite ? '已收藏' : '收藏'}
        </Button>
        <Button size="sm" onClick={handleVisit}>
          <ExternalLink className="mr-2 h-4 w-4" />
          阅读原文
        </Button>
      </CardFooter>
    </Card>
  )
}
