/**
 * OPML 导出/导入工具函数
 */

import { Subscription, Category } from '@/types'

/**
 * 将订阅源导出为 OPML 格式
 */
export function exportToOPML(subscriptions: Subscription[]): string {
  // 按 URL 分组，避免重复
  const uniqueFeeds = new Map<string, Subscription>()
  subscriptions.forEach(sub => {
    if (!uniqueFeeds.has(sub.url)) {
      uniqueFeeds.set(sub.url, sub)
    }
  })

  const feeds = Array.from(uniqueFeeds.values())

  const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>RSSWeb 订阅导出</title>
    <dateCreated>${new Date().toISOString()}</dateCreated>
    <ownerName>RSSWeb User</ownerName>
  </head>
  <body>
${feeds.map(feed => `    <outline text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" type="rss" xmlUrl="${escapeXml(feed.url)}" htmlUrl="${escapeXml(feed.url)}"${feed.description ? ` description="${escapeXml(feed.description)}"` : ''}${feed.category ? ` category="${escapeXml(feed.category)}"` : ''} />`).join('\n')}
  </body>
</opml>`

  return opml
}

/**
 * 从 OPML 导入订阅源
 */
export function importFromOPML(opmlContent: string): {
  subscriptions: Array<{ title: string; url: string; description?: string; category?: string }>
  errors: string[]
} {
  const parser = new DOMParser()
  const doc = parser.parseFromString(opmlContent, 'text/xml')

  // 检查解析错误
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('OPML 解析失败：' + parseError.textContent)
  }

  const body = doc.querySelector('body')
  if (!body) {
    throw new Error('无效的 OPML 文件：缺少 body 元素')
  }

  const subscriptions: Array<{ title: string; url: string; description?: string; category?: string }> = []
  const errors: string[] = []

  /**
   * 递归解析 outline 元素
   */
  function parseOutlines(outlines: NodeListOf<Element>, category?: string, index = 0) {
    Array.from(outlines).forEach((outline) => {
      const title = outline.getAttribute('text') || outline.getAttribute('title')
      const url = outline.getAttribute('xmlUrl') || outline.getAttribute('htmlUrl')
      const description = outline.getAttribute('description') || undefined
      const categoryName = outline.getAttribute('category') || category

      // 检查是否有子 outline（分组）
      const childOutlines = outline.querySelectorAll(':scope > outline')

      if (childOutlines.length > 0) {
        // 这是一个分组，递归处理子元素
        parseOutlines(childOutlines, title || categoryName)
      } else if (url) {
        // 这是一个订阅源
        if (!title) {
          errors.push(`第 ${index + 1} 项：缺少标题`)
          return
        }

        // 验证 URL 格式
        try {
          new URL(url)
        } catch {
          errors.push(`第 ${index + 1} 项：URL 格式无效 (${url})`)
          return
        }

        subscriptions.push({
          title,
          url,
          description,
          category: categoryName
        })
      }
    })
  }

  parseOutlines(body.querySelectorAll('outline'))

  return { subscriptions, errors }
}

/**
 * XML 转义
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * 下载 OPML 文件
 */
export function downloadOPML(opmlContent: string, filename: string = 'rssweb-subscriptions.opml'): void {
  const blob = new Blob([opmlContent], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 读取 OPML 文件
 */
export function readOPMLFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        resolve(content)
      } else {
        reject(new Error('文件内容为空'))
      }
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsText(file, 'UTF-8')
  })
}
