'use client'

import Image from 'next/image'
import { Download } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex gap-6 items-center">
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('PDF 导出功能即将上线！')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              导出 PDF
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            RSSWeb - 现代化 RSS 阅读器
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            完整的 RSS 订阅管理、文章阅读、高级搜索、双模型支持和 PDF 导出功能
          </p>
          <div className="flex gap-4 items-center flex-wrap">
            <a
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                className="dark:invert"
                width={20}
                height={20}
              />
              立即部署
            </a>
            <a
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-solid border-black/[.08] px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] dark:border-white/[.145]"
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              查看文档
            </a>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838]"
          >
            <Image
              src="/window.svg"
              alt="Window logo"
              className="dark:invert"
              width={16}
              height={16}
            />
            模板
          </a>
          <a
            href="https://github.com/uninet/RSSWeb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838]"
          >
            <Image
              src="/file.svg"
              alt="File icon"
              className="dark:invert"
              width={16}
              height={16}
            />
            GitHub
          </a>
        </div>
      </main>
    </div>
  )
}
