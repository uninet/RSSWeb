import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ExternalLink, Check } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useState } from 'react'
import { validateRSSURL, parseRSS, convertToArticle } from '@/lib/rss-parser'

export function SubscriptionForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const { addSubscription } = useApp()

  const categories = [
    { id: 'tech', name: '技术' },
    { id: 'news', name: '新闻' },
    { id: 'blog', name: '博客' },
    { id: 'other', name: '其他' },
  ]

  const handleVerify = async () => {
    if (!url) {
      setError('请输入 RSS URL')
      return
    }

    const validation = validateRSSURL(url)
    if (!validation.valid) {
      setError(validation.error || '无效的 RSS URL')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      // 通过 Next.js API 代理获取 RSS feed
      const response = await fetch(`/api/rss/${encodeURIComponent(url)}`)

      if (!response.ok) {
        setError(`无法访问 RSS 源: ${response.status}`)
        return
      }

      const xmlContent = await response.text()
      const feed = await parseRSS(xmlContent)

      // 成功解析 RSS
      setIsVerifying(false)

      // 显示 RSS 信息
      setError(`✅ RSS 验证成功: "${feed.title}"`)
      
      // 自动填充标题（如果用户没有输入）
      if (!title) {
        setTitle(feed.title)
      }
      
      console.log('RSS Feed verified:', feed)
    } catch (err) {
      console.error('Failed to verify RSS:', err)
      setIsVerifying(false)
      setError('RSS 验证失败，请检查 URL 是否正确')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url || !title) {
      setError('请填写 RSS URL 和标题')
      return
    }

    const validation = validateRSSURL(url)
    if (!validation.valid) {
      setError(validation.error || '无效的 RSS URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 获取 RSS feed 内容
      const response = await fetch(`/api/rss/${encodeURIComponent(url)}`)

      if (!response.ok) {
        throw new Error(`获取 RSS 失败: ${response.status}`)
      }

      const xmlContent = await response.text()
      const feed = await parseRSS(xmlContent)

      // 转换文章
      const articles = feed.items.map((item) =>
        convertToArticle(item, `sub-${Date.now()}`)
      )

      // 更新订阅源的最后获取时间
      const lastFetchAt = Date.now()

      const newSubscription = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        addedAt: Date.now(),
        lastFetchAt,
        unreadCount: articles.length,
        icon: feed.icon || undefined,
      }

      // 添加订阅
      addSubscription(newSubscription)

      // 添加文章
      const { addSubscription: addSubscriptionToContext } = useApp()
      articles.forEach((article) => {
        addSubscriptionToContext(article)
      })

      // 重置表单
      setUrl('')
      setTitle('')
      setDescription('')
      setCategory('')

      // 显示成功消息
      setError(`✅ 成功添加订阅 "${newSubscription.title}"，共获取 ${articles.length} 篇文章`)

      console.log('Subscription added:', newSubscription)
      console.log('Articles fetched:', articles)
    } catch (err) {
      console.error('Failed to add subscription:', err)
      setError('添加订阅失败，请稍后重试')
    } finally {
      setIsLoading(false)
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              RSS URL *
            </label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/feed.xml"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError('')
                }}
                disabled={isLoading || isVerifying}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVerify}
                disabled={isLoading || isVerifying || !url}
                title="验证 RSS"
              >
                {isVerifying ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && error.startsWith('✅') && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}
            {error && !error.startsWith('✅') && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              标题 *
            </label>
            <Input
              id="title"
              type="text"
              placeholder="订阅源名称"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading || isVerifying}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              描述
            </label>
            <Input
              id="description"
              type="text"
              placeholder="简短描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading || isVerifying}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              分类
            </label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm ring-offset-2 focus-visible:ring-2 focus-visible:ring-zinc-950 focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-zinc-800 dark:focus-visible:ring-zinc-800"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading || isVerifying}
            >
              <option value="">选择分类（可选）</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={isLoading || isVerifying}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent mr-2" />
                  添加中...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  添加订阅
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
