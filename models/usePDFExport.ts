// PDF 導出 Hook

import jsPDF from 'jspdf'

/**
 * 導出單篇文章為 PDF
 */
export async function exportArticleToPDF(article: any) {
  try {
    const doc = new jsPDF()
    const content = article.content || article.description || 'No content available'

    // 設置標題
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(article.title, 10, 20)

    // 設置日期和作者
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Published: ${new Date(article.pubDate).toLocaleDateString('zh-CN')}`, 10, 30)
    doc.text(`Author: ${article.author || 'Unknown'}`, 10, 35)

    // 設置分隔線
    doc.setLineWidth(0.5)
    doc.line(10, 40, 200, 40)

    // 設置內容
    doc.setFontSize(10)
    const splitContent = doc.splitTextToSize(content, 180)
    let y = 50
    splitContent.forEach((line: string) => {
      if (y > 280) {
        doc.addPage()
        y = 10
      }
      doc.text(line, 10, y)
      y += 5
    })

    // 下載 PDF
    doc.save(`${article.title || 'article'}.pdf`)

    return {
      success: true,
      filename: `${article.title || 'article'}.pdf`,
    }
  } catch (error) {
    console.error('導出 PDF 失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 導出多篇文章為 PDF
 */
export async function exportArticlesToPDF(articles: any[]) {
  try {
    const doc = new jsPDF()

    articles.forEach((article, index) => {
      if (index > 0) {
        doc.addPage()
      }

      // 設置標題
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(article.title, 10, 20)

      // 設置日期和作者
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Published: ${new Date(article.pubDate).toLocaleDateString('zh-CN')}`, 10, 30)
      doc.text(`Author: ${article.author || 'Unknown'}`, 10, 35)

      // 設置分隔線
      doc.setLineWidth(0.5)
      doc.line(10, 40, 200, 40)

      // 設置內容（只顯示前 500 字）
      const content = article.content || article.description || 'No content available'
      const previewContent = content.length > 500 ? content.substring(0, 500) + '...' : content

      doc.setFontSize(9)
      const splitContent = doc.splitTextToSize(previewContent, 180)
      let y = 50
      splitContent.forEach((line: string) => {
        if (y > 280) {
          doc.addPage()
          y = 10
        }
        doc.text(line, 10, y)
        y += 4
      })
    })

    // 下載 PDF
    doc.save('articles.pdf')

    return {
      success: true,
      filename: 'articles.pdf',
      count: articles.length,
    }
  } catch (error) {
    console.error('導出 PDF 失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
