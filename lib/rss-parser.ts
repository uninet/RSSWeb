import { RSSFeed, RSSItem } from '@/types'

/**
 * 解析 RSS XML 字符串
 */
export function parseRSS(xml: string): RSSFeed | null {
  try {
    // 使用 DOMParser 解析 XML
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')

    // 检查解析错误
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      console.error('RSS 解析错误:', parseError.textContent)
      return null
    }

    const channel = doc.querySelector('channel')
    if (!channel) {
      console.error('未找到 RSS channel')
      return null
    }

    // 解析基本信息
    const title = channel.querySelector('title')?.textContent || ''
    const description = channel.querySelector('description')?.textContent || ''
    const link = channel.querySelector('link')?.textContent || ''

    // 解析文章列表
    const items: RSSItem[] = []
    const itemElements = doc.querySelectorAll('item')

    itemElements.forEach((item) => {
      const title = item.querySelector('title')?.textContent || ''
      const link = item.querySelector('link')?.textContent || item.querySelector('guid')?.textContent || ''
      const description = item.querySelector('description')?.textContent || ''
      const content = item.querySelector('content\\:encoded')?.textContent ||
                      item.querySelector('content')?.textContent || ''
      const pubDate = item.querySelector('pubDate')?.textContent
      const author = item.querySelector('author')?.textContent ||
                      item.querySelector('dc\\:creator')?.textContent || ''
      const guid = item.querySelector('guid')?.textContent || ''

      // 解析分类
      const categories: string[] = []
      item.querySelectorAll('category').forEach((cat) => {
        const text = cat.textContent?.trim()
        if (text) categories.push(text)
      })

      if (title && link) {
        items.push({
          title,
          link,
          description,
          content: content || undefined,
          pubDate,
          author,
          category: categories.length > 0 ? categories : undefined,
          guid
        })
      }
    })

    return {
      title,
      description,
      link,
      items
    }
  } catch (error) {
    console.error('RSS 解析失败:', error)
    return null
  }
}

/**
 * 获取 RSS Feed 内容
 */
export async function fetchRSS(url: string): Promise<RSSFeed | null> {
  try {
    // 使用代理 API 获取 RSS 内容
    const response = await fetch(`/api/rss/fetch?url=${encodeURIComponent(url)}`, {
      next: { revalidate: 300 } // 缓存 5 分钟
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const text = await response.text()
    return parseRSS(text)
  } catch (error) {
    console.error('获取 RSS 失败:', error)
    return null
  }
}

/**
 * 验证 RSS URL 是否有效
 */
export async function validateRSSUrl(url: string): Promise<{ valid: boolean; feed: RSSFeed | null; error: string | null }> {
  try {
    const feed = await fetchRSS(url)
    if (!feed) {
      return { valid: false, feed: null, error: '无法解析 RSS 内容' }
    }
    return { valid: true, feed, error: null }
  } catch (error) {
    return {
      valid: false,
      feed: null,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}
