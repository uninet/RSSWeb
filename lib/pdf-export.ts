/**
 * PDF 导出工具函数
 */

import { Article, Subscription } from '@/types'
import jsPDF from 'jspdf'

/**
 * 文章数据接口（用于 PDF）
 */
export interface ArticleData {
  title: string
  link: string
  description: string
  content?: string
  author?: string
  pubDate: number
  source: string
}

/**
 * 导出单个文章为 PDF
 */
export function exportArticleToPDF(article: ArticleData): void {
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
  const titleLines = doc.splitTextToSize(article.title, contentWidth)
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
  
  doc.text(`来源：${article.source}`, margin, y)
  y += lineHeight
  
  if (article.author) {
    doc.text(`作者：${article.author}`, margin, y)
    y += lineHeight
  }
  
  const date = new Date(article.pubDate).toLocaleString('zh-CN')
  doc.text(`发布：${date}`, margin, y)
  y += lineHeight
  
  doc.text(`链接：${article.link}`, margin, y)
  y += 10

  // 分隔线
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // 内容
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  
  // 优先使用 content，否则使用 description
  const content = article.content || article.description
  // 移除 HTML 标签
  const plainText = stripHtmlTags(content)
  
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
  const safeTitle = sanitizeFilename(article.title)
  const filename = `${safeTitle}.pdf`
  doc.save(filename)
}

/**
 * 导出多篇文章为 PDF
 */
export function exportArticlesToPDF(
  articles: ArticleData[],
  options?: {
    title?: string
    description?: string
    includeIndex?: boolean
  }
): void {
  if (articles.length === 0) {
    throw new Error('没有要导出的文章')
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  const lineHeight = 7
  const articleMargin = 15

  // 初始化 Y 坐标
  let y = margin

  // 目录
  if (options?.includeIndex && articles.length > 1) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('目录', margin, y)
    y += 15

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    articles.forEach((article, index) => {
      if (y + lineHeight * 3 > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(`${index + 1}. ${article.title}`, margin, y)
      y += lineHeight * 3
    })

    doc.addPage()
    y = margin
  }

  // 文章内容

  articles.forEach((article, index) => {
    // 如果不是第一篇文章，添加分隔
    if (index > 0) {
      doc.addPage()
      y = margin
    }

    // 文章标题
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    const titleLines = doc.splitTextToSize(article.title, contentWidth)
    titleLines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += lineHeight
    })
    y += 8

    // 元数据
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    
    doc.text(`来源：${article.source}`, margin, y)
    y += lineHeight
    
    if (article.author) {
      doc.text(`作者：${article.author}`, margin, y)
      y += lineHeight
    }
    
    const date = new Date(article.pubDate).toLocaleString('zh-CN')
    doc.text(`发布：${date}`, margin, y)
    y += lineHeight

    // 分隔线
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    // 内容
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    const content = article.content || article.description
    const plainText = stripHtmlTags(content)
    
    // 限制每篇文章的长度（避免 PDF 过大）
    const maxLength = 3000
    const truncatedText = plainText.length > maxLength
      ? plainText.substring(0, maxLength) + '\n\n[内容已截断，查看完整文章请访问原文]'
      : plainText
    
    const contentLines = doc.splitTextToSize(truncatedText, contentWidth)
    contentLines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += lineHeight
    })

    y += articleMargin
  })

  // 页脚
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `第 ${i} 页 / 共 ${totalPages} 页 | RSSWeb 导出`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // 保存
  const title = options?.title || '文章合集'
  const safeTitle = sanitizeFilename(title)
  const filename = `${safeTitle}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

/**
 * 移除 HTML 标签
 */
function stripHtmlTags(html: string): string {
  // 移除 HTML 标签
  let text = html.replace(/<[^>]*>/g, ' ')
  
  // 解码 HTML 实体
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  
  // 清理多余空格和换行
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\s+\n/g, '\n')
  
  return text.trim()
}

/**
 * 清理文件名（移除不安全字符）
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
}

/**
 * 将 Article 转换为 ArticleData
 */
export function articleToData(
  article: Article,
  subscriptions: Subscription[]
): ArticleData {
  const subscription = subscriptions.find(s => s.id === article.subscriptionId)
  return {
    title: article.title,
    link: article.link,
    description: article.description,
    content: article.content,
    author: article.author,
    pubDate: article.pubDate,
    source: subscription?.title || '未知来源'
  }
}
