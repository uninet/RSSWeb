'use client'

import { ArrowLeft, Share2, Bookmark, ExternalLink, Clock, User } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { formatDate, stripHtml } from '@/lib/utils'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ArticlePage() {
  const { articles, subscriptions, toggleArticleFavorite, activeArticle, setActiveArticle } = useApp()
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setActiveArticle(null)
  }, [])

  const article = articles.find(a => a.id === params.id)
  const subscription = article ? subscriptions.find(s => s.id === article.subscriptionId) : null

  if (!mounted) {
    return null
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            文章不存在
          </h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const handleToggleFavorite = () => {
    toggleArticleFavorite(article.id)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: article.link
        })
      } catch (err) {
        // 用户取消分享
      }
    } else {
      // 复制链接
      navigator.clipboard.writeText(article.link)
      alert('链接已复制到剪贴板！')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                article.isFavorite
                  ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
              title={article.isFavorite ? '取消收藏' : '收藏'}
            >
              <Bookmark className="h-5 w-5" fill={article.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              title="分享"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              title="在浏览器中打开"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm overflow-hidden">
          {/* Article Header */}
          <div className="p-8 border-b border-zinc-200 dark:border-zinc-800">
            {/* Category/Source */}
            {subscription && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full">
                  {subscription.title}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              {article.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <time dateTime={new Date(article.pubDate).toISOString()}>
                  {new Date(article.pubDate).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
              <div className="text-zinc-500 dark:text-zinc-500">
                {formatDate(article.pubDate)}
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-8">
            {article.content ? (
              <div
                className="prose prose-zinc dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {article.description}
                </p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
                >
                  阅读原文
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            相关文章
          </h2>
          <div className="space-y-4">
            {articles
              .filter(a =>
                a.subscriptionId === article.subscriptionId &&
                a.id !== article.id
              )
              .slice(0, 3)
              .map(related => (
                <button
                  key={related.id}
                  onClick={() => router.push(`/article/${related.id}`)}
                  className="w-full text-left p-4 bg-white dark:bg-zinc-950 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {related.description}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
