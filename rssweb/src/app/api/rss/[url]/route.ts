// RSS 代理 API 路由 - 增强版（支持锚点同步）

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const url = await params
    const decodedUrl = decodeURIComponent(url)

    // 检查是否是锚点同步请求
    if (request.headers.get('x-anchor-sync') === 'true') {
      console.log('Anchor sync request detected')
      
      // 调用锚点同步逻辑
      const anchorResponse = await syncAnchor(url)
      
      return NextResponse.json({
        success: true,
        provider: 'anchor-sync',
        data: anchorResponse,
      })
    }

    // 正常的 RSS fetch
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; RSSWeb/1.0; +https://rssweb.example.com)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `获取 RSS feed 失败: ${response.status} ${response.statusText}`,
          url: decodedUrl,
        },
        { status: response.status }
      )
    }

    const content = await response.text()

    // 返回 RSS 内容
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('RSS fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

// 锚点同步逻辑（占位符，实际逻辑在客户端实现）
async function syncAnchor(url: string): Promise<any> {
  // 这里可以添加实际的锚点同步逻辑
  // 暂时返回模拟数据
  return {
    action: 'anchor-sync',
    url: url,
    timestamp: new Date().toISOString(),
    status: 'success',
  }
}
