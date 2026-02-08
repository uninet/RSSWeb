'use client'

import { ExternalLink, Star, Clock, CheckCircle2, FileText } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { formatDate, truncateText } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function ArticleList() {
  const router = useRouter()
  const {
    getFilteredArticles,
    setActiveArticle,
    markArticleRead,
    toggleArticleFavorite,
    filterUnreadOnly,
    filterFavoriteOnly,
    activeSubscription,
    markAllAsRead,
    subscriptions
  } = useApp()

  const articles = getFilteredArticles()

  const handleArticleClick = (id: string) => {
    setActiveArticle(id)
    markArticleRead(id)
    router.push(`/article/${id}`)
  }

  const activeSub = activeSubscription
    ? subscriptions.find(s => s.id === activeSubscription)
    : null

  const handleMarkAllRead = () => {
    markAllAsRead(activeSubscription ?? undefined)
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6 text-sm">
            <div className="text-zinc-900 dark:text-zinc-50">
              <span className="font-semibold">{articles.length}</span> 篇文章
            </div>
            {filterUnreadOnly && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="h-4 w-4" />
                仅显示未读
              </div>
            )}
            {filterFavoriteOnly && (
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <Star className="h-4 w-4" />
                仅显示收藏
              </div>
            )}
          </div>
          {articles.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              全部标记为已读
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {articles.map(article => {
              const subscription = subscriptions.find(s => s.id === article.subscriptionId)
              return (
                <article
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className={`p-4 md:p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer ${!article.isRead ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}
                >
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className={`font-semibold text-base md:text-lg leading-snug ${article.isRead ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-50'}`}>
                          {article.title}
                        </h3>
                        {article.isFavorite && (
                          <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-0.5 md:mt-1" />
                        )}
                      </div>

                      <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                        {truncateText(article.description, 150)}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-zinc-400 dark:text-zinc-500">
                        {subscription && (
                          <span className="font-medium text-zinc-600 dark:text-zinc-300">
                            {subscription.title}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" />
                          {formatDate(article.pubDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleArticleFavorite(article.id)
                        }}
                        className={`p-2 md:p-2.5 rounded-lg transition-colors ${article.isFavorite ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                      >
                        <Star className="h-4 w-4 md:h-5 md:w-5" fill={article.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 md:p-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors hidden md:block"
                      >
                        <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
                      </a>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 md:p-8 text-center">
      <div className="w-14 h-14 md:w-16 md:h-16 mb-4 md:mb-6 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-zinc-400" />
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
        没有找到文章
      </h3>
      <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-md">
        尝试调整搜索条件或选择其他订阅源
      </p>
    </div>
  )
}
