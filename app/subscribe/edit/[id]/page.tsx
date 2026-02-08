'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Rss } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useRouter, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function EditSubscriptionPage() {
  const router = useRouter()
  const params = useParams()
  const { updateSubscription, deleteSubscription, subscriptions, categories } = useApp()

  const subscription = subscriptions.find(s => s.id === params.id)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (subscription) {
      setFormData({
        title: subscription.title,
        description: subscription.description || '',
        category: subscription.category || ''
      })
    }
  }, [subscription])

  if (!subscription) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            订阅源不存在
          </h2>
          <button
            onClick={() => router.push('/subscriptions')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回管理页
          </button>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      alert('请填写标题')
      return
    }

    setIsSubmitting(true)

    try {
      updateSubscription(subscription.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category || undefined
      })
      alert('订阅源更新成功！')
      router.push('/subscriptions')
    } catch (error) {
      alert('更新失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (!confirm(`确定要删除订阅源 "${subscription.title}" 吗？\n\n这将同时删除该订阅源的所有文章。`)) {
      return
    }

    setIsDeleting(true)

    try {
      deleteSubscription(subscription.id)
      alert('订阅源删除成功！')
      router.push('/subscriptions')
    } catch (error) {
      alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/subscriptions')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            编辑订阅源
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* RSS Info Card */}
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Rss className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {subscription.title}
                </h3>
                <a
                  href={subscription.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                >
                  {subscription.url}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div>
                <span className="font-medium">未读文章：</span>{subscription.unreadCount} 篇
              </div>
              {subscription.lastFetchAt && (
                <div>
                  <span className="font-medium">上次更新：</span>
                  {new Date(subscription.lastFetchAt).toLocaleString('zh-CN')}
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 rounded-lg outline-none transition-all text-zinc-900 dark:text-zinc-50"
            />
          </div>

          {/* Category Select */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
              分类
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 rounded-lg outline-none transition-all text-zinc-900 dark:text-zinc-50 cursor-pointer"
            >
              <option value="">未分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
              描述
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="订阅源描述（可选）"
              rows={3}
              className="w-full px-4 py-3 text-sm bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 rounded-lg outline-none transition-all text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存修改'
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-4 bg-red-600 text-white text-base font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  删除中...
                </>
              ) : (
                '删除订阅源'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
