// RSS 解析器

import { RSSFeed, RSSItem, Article, Subscription } from '@/types'

/**
 * 解析 RSS/Atom feed 内容
 */
export async function parseRSS(xmlString: string): Promise<RSSFeed> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  // 检查解析错误
  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    throw new Error(`XML 解析错误: ${errorNode.textContent}`)
  }

  // 判断是 RSS 还是 Atom
  const rssNode = doc.querySelector('rss')
  const atomNode = doc.querySelector('feed')

  if (rssNode) {
    return parseRSSFeed(doc)
  } else if (atomNode) {
    return parseAtomFeed(doc)
  } else {
    throw new Error('未知的 feed 格式（既不是 RSS 也不是 Atom）')
  }
}

/**
 * 解析 RSS 格式（RSS 2.0, 1.0）
 */
function parseRSSFeed(doc: Document): RSSFeed {
  const channel = doc.querySelector('channel')
  if (!channel) {
    throw new Error('无效的 RSS feed：缺少 channel 元素')
  }

  const title = getElementText(channel, 'title') || '无标题'
  const description = getElementText(channel, 'description')
  const link = getElementText(channel, 'link')
  const icon = getRSSIcon(doc)

  const items: RSSItem[] = []
  const itemNodes = channel.querySelectorAll('item')

  itemNodes.forEach((item) => {
    items.push({
      title: getElementText(item, 'title') || '无标题',
      link: getElementText(item, 'link'),
      description: getElementText(item, 'description') || getElementText(item, 'summary'),
      content: getElementText(item, 'content:encoded') || getElementText(item, 'content'),
      pubDate: getElementText(item, 'pubDate'),
      author: getElementText(item, 'author') || getElementText(item, 'dc:creator'),
      category: getElementText(item, 'category'),
    })
  })

  return {
    title,
    description,
    link,
    icon,
    items,
  }
}

/**
 * 解析 Atom 格式
 */
function parseAtomFeed(doc: Document): RSSFeed {
  const feed = doc.querySelector('feed')
  if (!feed) {
    throw new Error('无效的 Atom feed：缺少 feed 元素')
  }

  const title = getElementText(feed, 'title') || '无标题'
  const description = getElementText(feed, 'subtitle') || getElementText(feed, 'description')
  const link = getAtomLink(feed, 'alternate')
  const icon = getAtomIcon(feed)

  const items: RSSItem[] = []
  const entryNodes = feed.querySelectorAll('entry')

  entryNodes.forEach((entry) => {
    items.push({
      title: getElementText(entry, 'title') || '无标题',
      link: getAtomLink(entry, 'alternate'),
      description: getElementText(entry, 'summary') || getElementText(entry, 'description'),
      content: getAtomContent(entry),
      pubDate: getElementText(entry, 'published') || getElementText(entry, 'updated'),
      author: getElementText(entry, 'author name') || getElementText(entry, 'author'),
      category: getElementText(entry, 'category term'),
    })
  })

  return {
    title,
    description,
    link,
    icon,
    items,
  }
}

/**
 * 获取元素的文本内容
 */
function getElementText(parent: Element, selector: string): string | undefined {
  const element = parent.querySelector(selector)
  if (!element) return undefined

  // 处理 CDATA
  const cdata = element.querySelector('[data-cdata]')
  if (cdata) {
    return cdata.textContent || undefined
  }

  return element.textContent?.trim() || undefined
}

/**
 * 获取 Atom link（指定 rel 属性）
 */
function getAtomLink(parent: Element, rel: string): string | undefined {
  const link = parent.querySelector(`link[rel="${rel}"]`)
  return link?.getAttribute('href') || undefined
}

/**
 * 获取 RSS 图标
 */
function getRSSIcon(doc: Document): string | undefined {
  // 尝试从 image 元素获取
  const image = doc.querySelector('image > url')
  if (image) {
    return image.textContent?.trim() || undefined
  }

  // 尝试从 iTunes 命名空间获取
  const itunesImage = doc.querySelector('itunes\\:image')
  if (itunesImage) {
    return itunesImage.getAttribute('href') || undefined
  }

  // 尝试从 favicon 获取（使用 favicon 服务）
  const link = doc.querySelector('channel > link')
  if (link) {
    const url = link.textContent?.trim()
    if (url) {
      try {
        const urlObj = new URL(url)
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`
      } catch {
        return undefined
      }
    }
  }

  return undefined
}

/**
 * 获取 Atom 图标
 */
function getAtomIcon(feed: Element): string | undefined {
  // icon 元素
  const icon = feed.querySelector('icon')
  if (icon) {
    return icon.textContent?.trim() || undefined
  }

  // logo 元素
  const logo = feed.querySelector('logo')
  if (logo) {
    return logo.textContent?.trim() || undefined
  }

  // 从 link 获取
  const url = getAtomLink(feed, 'alternate')
  if (url) {
    try {
      const urlObj = new URL(url)
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`
    } catch {
      return undefined
    }
  }

  return undefined
}

/**
 * 获取 Atom 内容
 */
function getAtomContent(entry: Element): string | undefined {
  // content 元素
  const content = entry.querySelector('content')
  if (content) {
    return content.textContent?.trim() || undefined
  }

  // summary 元素
  const summary = entry.querySelector('summary')
  if (summary) {
    return summary.textContent?.trim() || undefined
  }

  return undefined
}

/**
 * 获取 RSS feed URL
 */
export function getFeedURL(subscription: Subscription): string {
  // 使用 Next.js API 代理
  return `/api/rss/${encodeURIComponent(subscription.url)}`
}

/**
 * 将 RSSItem 转换为 Article
 */
export function convertToArticle(
  item: RSSItem,
  subscriptionId: string
): Article {
  return {
    id: generateId(item.link),
    subscriptionId,
    title: item.title,
    link: item.link,
    description: item.description || '',
    content: item.content,
    pubDate: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
    author: item.author,
    isRead: false,
    isFavorite: false,
    tags: item.category ? [item.category] : [],
  }
}

/**
 * 从 URL 生成唯一 ID
 */
function generateId(url: string): string {
  if (!url) return `id-${Date.now()}-${Math.random()}`
  const hash = simpleHash(url)
  return `art-${hash}`
}

/**
 * 简单的字符串哈希函数
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0 i < str.length i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * 获取 feed URL（直接 URL）
 */
export function getDirectFeedURL(subscription: Subscription): string {
  return subscription.url
}

/**
 * 验证 RSS URL
 */
export function validateRSSURL(url: string): { valid: boolean, error?: string } {
  try {
    const urlObj = new URL(url)

    if (!urlObj.protocol.match(/^https?:/)) {
      return { valid: false, error: '只支持 HTTP/HTTPS 协议' }
    }

    if (urlObj.hostname === '') {
      return { valid: false, error: '无效的主机名' }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: '无效的 URL 格式' }
  }
}

/**
 * 提取网页中的 RSS feed URL
 */
export async function discoverFeeds(url: string): Promise<string[]> {
  try {
    const response = await fetch(url)
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const feeds: string[] = []

    // 查找 link 元素
    const linkElements = doc.querySelectorAll(
      'link[type="application/rss+xml"], ' +
      'link[type="application/atom+xml"], ' +
      'link[type="application/rdf+xml"]'
    )

    linkElements.forEach((link) => {
      const href = link.getAttribute('href')
      if (href) {
        // 转换相对 URL 为绝对 URL
        const absoluteURL = new URL(href, url).toString()
        feeds.push(absoluteURL)
      }
    })

    return [...new Set(feeds)] // 去重
  } catch {
    return []
  }
}
