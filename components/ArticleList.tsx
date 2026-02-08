'use client'

import { ExternalLink, Star, Clock, CheckCircle2, FileText, Download } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import { formatDate, truncateText } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { articleToData } from '@/lib/pdf-export'

export function ArticleList() {
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
    // 跳转到文章详情页
    router.push(`/article/${id}`)
  }

  const handleExportPDF = (e: React.MouseEvent, article: any) => {
    e.stopPropagation()
    try {
      const articleData = articleToData(article, subscriptions)
      // 动态导入 jsPDF
      import('jspdf').then(({ default: jsPDF }) => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 20
        const contentWidth = pageWidth - margin * 2
        const lineHeight = 7

        let y = margin

        // 标题
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        const titleLines = doc.splitTextToSize(articleData.title, contentWidth)
        titleLines.forEach((line: string) => {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin, y)
          y += lineHeight
        })
        y += 10

        // 元数据
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)

        doc.text(`来源：${articleData.source}`, margin, y)
        y += lineHeight

        if (articleData.author) {
          doc.text(`作者：${articleData.author}`, margin, y)
          y += lineHeight
        }

        const date = new Date(articleData.pubDate).toLocaleString('zh-CN')
        doc.text(`发布：${date}`, margin, y)
        y += lineHeight

        doc.text(`链接：${articleData.link}`, margin, y)
        y += 10

        // 分隔线
        doc.setDrawColor(200, 200, 200)
        doc.line(margin, y, pageWidth - margin, y)
        y += 10

        // 内容
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)

        const content = articleData.content || articleData.description
        const plainText = content.replace(/<[^>]*>/g, ' ')

        const contentLines = doc.splitTextToSize(plainText, contentWidth)
        contentLines.forEach((line: string) => {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin, y)
          y += lineHeight
        })

        // 页脚
        const totalPages = doc.internal.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i)
          doc.setFontSize(9)
          doc.setTextColor(150, 150, 150)
          doc.text(
            `第 ${i} 页 / 共 ${totalPages} 页`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          )
        }

        // 保存
        const safeTitle = articleData.title.replace(/[<>:"/\\|?*]/g, '').substring(0, 50)
        const filename = `${safeTitle}.pdf`
        doc.save(filename)
      })
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  const handleMarkAllRead = () => {
    markAllAsRead(activeSubscription ?? undefined)
  }

  const activeSub = activeSubscription
    ? subscriptions.find(s => s.id === activeSubscription)
    : null

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-zinc-950">
      {/* 统计栏 */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
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
                <Star className="h-4 w-4" fill="currentColor" />
                仅显示收藏
              </div>
            )}
          </div>
          {articles.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              全部标记为已读
            </button>
          )}
        </div>
      </div>

      {/* 文章列表 */}
      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {articles.map(article => (
              <ArticleItem
                key={article.id}
                article={article}
                subscription={subscriptions.find(s => s.id === article.subscriptionId)}
                onClick={() => handleArticleClick(article.id)}
                onToggleFavorite={() => toggleArticleFavorite(article.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ArticleItemProps {
  article: {
    id: string
    title: string
    description: string
    link: string
    pubDate: number
    isRead: boolean
    isFavorite: boolean
  }
  subscription?: {
    title: string
  }
  onClick: () => void
  onToggleFavorite: () => void
}

function ArticleItem({ article, subscription, onClick, onToggleFavorite }: ArticleItemProps) {
  return (
    <article
      className={cn(
        "p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group",
        !article.isRead && "bg-blue-50/30 dark:bg-blue-950/20"
      )}
    >
      <div className="flex gap-4">
        {/* 主要内容 */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-start gap-3 mb-2">
            <h3
              className={cn(
                "font-semibold text-base leading-snug",
                article.isRead
                  ? "text-zinc-600 dark:text-zinc-400"
                  : "text-zinc-900 dark:text-zinc-50"
              )}
            >
              {article.title}
            </h3>
            {article.isFavorite && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-1" />
            )}
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
            {truncateText(article.description, 200)}
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
            {subscription && (
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                {subscription.title}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(article.pubDate)}
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-start gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className={cn(
              "p-2 rounded-lg transition-colors",
              article.isFavorite
                ? "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            )}
          >
            <Star
              className="h-4 w-4"
              fill={article.isFavorite ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // 暂时禁用 PDF 导出功能
              alert('PDF 导出功能即将上线！')
            }}
            className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            title="导出 PDF"
          >
            <FileText className="h-4 w-4" />
          </button>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
        没有找到文章
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
        尝试调整搜索条件或选择其他订阅源
      </p>
    </div>
  )
}
