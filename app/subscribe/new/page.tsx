'use client'

import { useState } from 'react'
import { X, Loader2, CheckCircle2, AlertCircle, Rss, ExternalLink, ArrowLeft } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { validateRSSUrl } from '@/lib/rss-parser'
import { cn } from '@/lib/utils'

export default function AddSubscriptionPage() {
  const router = useRouter()
  const { addSubscription, categories } = useApp()

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '' as string | undefined,
    category: '' as string | undefined
  })

  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validation, setValidation] = useState<any>({
    valid: false,
    error: undefined
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // 重置验证状态
    setValidation({ valid: false, error: null, feed: null })
  }

  const handleValidate = async () => {
    if (!formData.url) {
      setValidation({ valid: false, error: '请输入 RSS URL', feed: null })
      return
    }

    try {
      new URL(formData.url)
    } catch {
      setValidation({ valid: false, error: 'URL 格式不正确', feed: null })
      return
    }

    setIsValidating(true)
    setValidation({ valid: false, error: null, feed: null })

    try {
      const result = await validateRSSUrl(formData.url)
      setValidation(result)

      // 如果验证成功，自动填充标题和描述
      if (result.valid && result.feed != null) {
        const { title, description } = result.feed
        setFormData(prev => ({
          ...prev,
          title: prev.title || (title || ''),
          description: prev.description || (description || '')
        }))
      }
    } catch (error) {
      setValidation({
        valid: false,
        error: error instanceof Error ? error.message : '验证失败',
        feed: null
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validation?.valid) {
      alert('请先验证 RSS URL')
      return
    }

    if (!formData.title || !formData.url) {
      alert('请填写必填字段')
      return
    }

    setIsSubmitting(true)

    try {
      await addSubscription({
        title: formData.title,
        url: formData.url,
        description: formData.description,
        category: formData.category || undefined
      })
      alert('订阅源添加成功！')
      router.push('/')
    } catch (error) {
      alert('添加失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsSubmitting(false)
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
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            添加订阅源
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
              RSS URL <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Rss className="h-4 w-4" />
                </div>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com/feed.xml"
                  className={cn(
                    "w-full pl-10 pr-4 py-3 text-sm",
                    "bg-zinc-100 dark:bg-zinc-900",
                    "border-2 rounded-lg outline-none transition-all",
                    validation
                      ? validation.valid
                        ? "border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900"
                        : "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
                      : "border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900",
                    "text-zinc-900 dark:text-zinc-50",
                    "placeholder:text-zinc-400"
                  )}
                />
              </div>
              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating || !formData.url}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    验证中...
                  </>
                ) : (
                  '验证'
                )}
              </button>
            </div>

            {/* Validation Status */}
            {validation && (
              <div className={cn(
                "mt-4 p-4 rounded-lg flex items-start gap-3",
                validation.valid
                  ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                  : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
              )}>
                {validation.valid ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  {validation.valid ? (
                    <div>
                      <p className="font-medium mb-1">RSS 验证成功！</p>
                      {validation.feed && (
                        <div className="text-sm mt-2 space-y-1">
                          <p>
                            <strong>标题：</strong>{validation.feed.title}
                          </p>
                          {validation.feed.description && (
                            <p>
                              <strong>描述：</strong>{validation.feed.description}
                            </p>
                          )}
                          <p>
                            <strong>文章数：</strong>{validation.feed.items.length}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{validation.error}</p>
                  )}
                </div>
              </div>
            )}
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
              placeholder="订阅源名称"
              className="w-full px-4 py-3 text-sm bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 rounded-lg outline-none transition-all text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
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

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !validation?.valid}
              className="flex-1 px-6 py-4 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  添加中...
                </>
              ) : (
                '添加订阅源'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-4 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-base font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              取消
            </button>
          </div>
        </form>

        {/* Popular RSS Feeds */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            热门订阅源推荐
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                name: 'TechCrunch',
                url: 'https://techcrunch.com/feed/',
                desc: '科技新闻和创业资讯'
              },
              {
                name: 'Hacker News',
                url: 'https://news.ycombinator.com/rss',
                desc: '技术社区讨论'
              },
              {
                name: 'BBC News',
                url: 'https://feeds.bbci.co.uk/news/rss.xml',
                desc: '全球新闻资讯'
              },
              {
                name: 'The Verge',
                url: 'https://www.theverge.com/rss/index.xml',
                desc: '科技、艺术和文化'
              }
            ].map((feed, index) => (
              <button
                key={index}
                onClick={() => setFormData(prev => ({ ...prev, url: feed.url }))}
                className="p-4 bg-white dark:bg-zinc-950 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                      {feed.name}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                      {feed.desc}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
