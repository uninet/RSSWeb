'use client'

import { useState } from 'react'
import { FileText, Download, CheckCircle2, ArrowLeft, FolderDown, Loader2, ChevronDown } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { exportArticleToPDF, exportArticlesToPDF, articleToData } from '@/lib/pdf-export'
import { cn } from '@/lib/utils'

export default function PDFExportPage() {
  const router = useRouter()
  const { articles, subscriptions, activeSubscription } = useApp()

  const [exportScope, setExportScope] = useState<'single' | 'unread' | 'favorite' | 'subscription' | 'all'>('unread')
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const getArticlesByScope = (scope: 'single' | 'unread' | 'favorite' | 'subscription' | 'all') => {
    switch (scope) {
      case 'single':
        return selectedArticleId ? articles.filter(a => a.id === selectedArticleId) : []
      case 'unread':
        return articles.filter(a => !a.isRead)
      case 'favorite':
        return articles.filter(a => a.isFavorite)
      case 'subscription':
        return activeSubscription
          ? articles.filter(a => a.subscriptionId === activeSubscription)
          : articles
      case 'all':
        return articles
      default:
        return []
    }
  }

  const exportArticles = getArticlesByScope(exportScope)
  const selectedArticle = exportArticles.find(a => a.id === selectedArticleId)

  const handleExport = async () => {
    const articlesToExport = exportArticles.map(a => articleToData(a, subscriptions))

    if (articlesToExport.length === 0) {
      alert('没有可导出的文章')
      return
    }

    setIsExporting(true)

    try {
      if (exportScope === 'single' && selectedArticle) {
        exportArticleToPDF(articlesToExport[0])
      } else {
        const scopeTitles: Record<typeof exportScope, string> = {
          single: '单篇文章',
          unread: '未读文章',
          favorite: '收藏文章',
          subscription: activeSubscription
            ? subscriptions.find(s => s.id === activeSubscription)?.title || '当前订阅源'
            : '所有文章',
          all: '所有文章'
        }

        exportArticlesToPDF(articlesToExport, {
          title: scopeTitles[exportScope],
          includeIndex: true
        })
      }
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsExporting(false)
    }
  }

  const scopeOptions = [
    { value: 'single', label: '单篇文章', icon: FileText, count: selectedArticleId ? 1 : 0 },
    { value: 'unread', label: '未读文章', icon: FolderDown, count: articles.filter(a => !a.isRead).length },
    { value: 'favorite', label: '收藏文章', icon: CheckCircle2, count: articles.filter(a => a.isFavorite).length },
    { value: 'subscription', label: activeSubscription ? '当前订阅源' : '所有文章', icon: FolderDown, count: activeSubscription ? articles.filter(a => a.subscriptionId === activeSubscription).length : articles.length },
    { value: 'all', label: '全部文章', icon: FileText, count: articles.length }
  ]

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
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            PDF 导出
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* 选择导出范围 */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              选择导出范围
            </h2>

            <div className="space-y-3">
              {scopeOptions.map(option => {
                const Icon = option.icon
                const isSelected = exportScope === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setExportScope(option.value as 'single' | 'unread' | 'favorite' | 'subscription' | 'all')
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg transition-all",
                      isSelected
                        ? "bg-blue-50 border-2 border-blue-500 dark:bg-blue-950 dark:border-blue-400"
                        : "bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                          {option.label}
                        </span>
                        {option.count > 0 && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            isSelected
                              ? "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          )}>
                            {option.count} 篇
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-1 bg-white dark:bg-zinc-950 rounded-full">
                        <ChevronDown className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 选择单篇文章 */}
          {exportScope === 'single' && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                选择文章
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {articles.length === 0 ? (
                  <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                    没有文章可选
                  </p>
                ) : (
                  articles.map(article => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticleId(article.id)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
                        selectedArticleId === article.id
                          ? "bg-blue-50 border-2 border-blue-500 dark:bg-blue-950 dark:border-blue-400"
                          : "bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                          {article.title}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                          {new Date(article.pubDate).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      {selectedArticleId === article.id && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 导出预览 */}
          {exportArticles.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                导出预览
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">文章数量</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{exportArticles.length} 篇</span>
                </div>
                {exportScope === 'favorite' && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">收藏文章</span>
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">{articles.filter(a => a.isFavorite).length} 篇</span>
                  </div>
                )}
                {exportScope === 'unread' && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm text-blue-700 dark:text-blue-300">未读文章</span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">{articles.filter(a => !a.isRead).length} 篇</span>
                  </div>
                )}
              </div>

              {/* 预览前 5 篇文章 */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  预览（前 5 篇）
                </h3>
                <div className="space-y-2">
                  {exportArticles.slice(0, 5).map(article => {
                    const subscription = subscriptions.find(s => s.id === article.subscriptionId)
                    return (
                      <div key={article.id} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                          {article.title}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                          {subscription?.title || '未知来源'} · {new Date(article.pubDate).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 导出按钮 */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-6">
            <button
              onClick={handleExport}
              disabled={isExporting || exportArticles.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  导出 PDF ({exportArticles.length} 篇文章)
                </>
              )}
            </button>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-3">
              文章较多时导出可能需要几秒钟，请耐心等待
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
