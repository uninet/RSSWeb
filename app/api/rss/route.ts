import { NextResponse } from 'next/server'

export async function GET() {
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:foaf="http://xmlns.com/foaf/0.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>RSSWeb - 现代化 RSS 阅读器</title>
    <link>https://github.com/uninet/RSSWeb</link>
    <description>现代化 RSS 阅读器，支持双模型、自动刷新和 PDF 导出</description>
    <language>zh-CN</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>uninet@126.com (uninet)</managingEditor>
    <generator>RSSWeb - Next.js 16</generator>
    <atom:link href="https://github.com/uninet/RSSWeb/api/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://github.com/uninet/RSSWeb/vercel.svg</url>
      <title>RSSWeb Logo</title>
      <link>https://github.com/uninet/RSSWeb</link>
    </image>
    <item>
      <title>欢迎使用 RSSWeb</title>
      <link>https://github.com/uninet/RSSWeb</link>
      <description>RSSWeb 是一个现代化的 RSS 阅读器，支持双模型（Big Model + Gemini）、自动刷新、重置时间探测和 PDF 导出功能。</description>
      <author>uninet</author>
      <category>技术</category>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="true">https://github.com/uninet/RSSWeb#welcome</guid>
    </item>
    <item>
      <title>功能介绍：PDF 导出</title>
      <link>https://github.com/uninet/RSSWeb#pdf-export</link>
      <description>支持单篇和批量导出文章为 PDF 文件，方便离线阅读。</description>
      <category>功能</category>
      <pubDate>${new Date(Date.now() - 3600000).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://github.com/uninet/RSSWeb#pdf-export</guid>
    </item>
    <item>
      <title>功能介绍：双模型支持</title>
      <link>https://github.com/uninet/RSSWeb#dual-model</link>
      <description>支持 Big Model 和 Gemini 两个模型，自动切换和重置时间探测。</description>
      <category>功能</category>
      <pubDate>${new Date(Date.now() - 7200000).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://github.com/uninet/RSSWeb#dual-model</guid>
    </item>
    <item>
      <title>功能介绍：高级搜索</title>
      <link>https://github.com/uninet/RSSWeb#advanced-search</link>
      <description>支持时间范围、标签过滤和多种排序方式。</description>
      <category>功能</category>
      <pubDate>${new Date(Date.now() - 10800000).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://github.com/uninet/RSSWeb#advanced-search</guid>
    </item>
    <item>
      <title>功能介绍：OPML 导入/导出</title>
      <link>https://github.com/uninet/RSSWeb#opml</link>
      <description>支持主流阅读器的 OPML 导入/导出功能。</description>
      <category>功能</category>
      <pubDate>${new Date(Date.now() - 14400000).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://github.com/uninet/RSSWeb#opml</guid>
    </item>
    <item>
      <title>功能介绍：自动刷新</title>
      <link>https://github.com/uninet/RSSWeb#auto-refresh</link>
      <description>支持自动刷新所有订阅源，可以配置刷新间隔和暂停/恢复。</description>
      <category>功能</category>
      <pubDate>${new Date(Date.now() - 18000000).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://github.com/uninet/RSSWeb#auto-refresh</guid>
    </item>
    <item>
      <title>功能介绍：重置时间探测</title>
      <link>https://github.com/uninet/RSSWeb#reset-detect</link>
      <description>支持 Big Model 的重置时间探测，自动记录和下次检查时间计算。</description>
      <category>功能</category>
      <pubDate>${new Date(Date.now() - 21600000).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://github.com/uninet/RSSWeb#reset-detect</guid>
    </item>
    <item>
      <title>技术栈</title>
      <link>https://github.com/uninet/RSSWeb#tech-stack</link>
      <description>Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui</description>
      <category>技术</category>
      <pubDate>${new Date(Date.now() - 25200000).toUTCString()}</pubDate>
      <guid isPermaLink="true">https://github.com/uninet/RSSWeb#tech-stack</guid>
    </item>
  </channel>
</rss>`

  return new NextResponse(feed, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
