'use client'

import { useState } from 'react'
import { Pencil, Trash2, ExternalLink, RefreshCw, Loader2, AlertCircle, Search } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

export default function SubscriptionsPage() {
  const router = useRouter()
  const { subscriptions, categories, deleteSubscription, refreshSubscription } = useApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleRefresh = async (id: string) => {
    setRefreshingId(id)
    try {
      await refreshSubscription(id)
    } finally {
      setRefreshingId(null)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除订阅源 "${title}" 吗？\n\n这将同时删除该订阅源的所有文章。`)) {
      return
    }

    setDeletingId(id)
    try {
      deleteSubscription(id)
    } finally {
      setDeletingId(null)
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
            ← 返回
          </button>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            订阅管理
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/import-export')}
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              导入/导出
            </button>
            <button
              onClick={() => router.push('/subscribe/new')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 添加订阅源
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="搜索订阅源..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 text-zinc-900 dark:text-zinc-50"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 text-zinc-900 dark:text-zinc-50 cursor-pointer"
          >
            <option value="all">所有分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              共 <span className="font-bold">{subscriptions.length}</span> 个订阅源，
              <span className="font-bold">{subscriptions.reduce((sum, s) => sum + s.unreadCount, 0)}</span> 篇未读文章
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              显示 <span className="font-bold">{filteredSubscriptions.length}</span> 个结果
            </div>
          </div>
        </div>

        {/* Subscription List */}
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">
              {searchQuery || selectedCategory !== 'all'
                ? '没有找到匹配的订阅源'
                : '还没有添加订阅源'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map(sub => (
              <div
                key={sub.id}
                className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Category */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {sub.title}
                        </h3>
                        {sub.category && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full">
                            {sub.category}
                          </span>
                        )}
                        {sub.fetchError && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full">
                            错误
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {sub.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                          {sub.description}
                        </p>
                      )}

                      {/* URL and Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <a
                          href={sub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          查看源
                        </a>
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {sub.unreadCount} 篇未读
                        </span>
                        {sub.lastFetchAt && (
                          <span className="text-zinc-500 dark:text-zinc-500">
                            上次更新: {formatDate(sub.lastFetchAt)}
                          </span>
                        )}
                      </div>

                      {/* Error Message */}
                      {sub.fetchError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {sub.fetchError}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-start gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRefresh(sub.id)}
                        disabled={refreshingId === sub.id}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="刷新"
                      >
                        {refreshingId === sub.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => router.push(`/subscribe/edit/${sub.id}`)}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id, sub.title)}
                        disabled={deletingId === sub.id}
                        className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="删除"
                      >
                        {deletingId === sub.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
