import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: '缺少 URL 参数' },
      { status: 400 }
    )
  }

  try {
    // 验证 URL 格式
    new URL(url)

    // 获取 RSS 内容
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSSWeb/1.0; +https://github.com/uninet/RSSWeb)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const text = await response.text()

    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('RSS 代理错误:', error)
    return NextResponse.json(
      {
        error: '获取 RSS 失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
