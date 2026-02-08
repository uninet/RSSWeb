'use client'

import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { ArticleList } from '@/components/ArticleList'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <ArticleList />
      </div>
    </div>
  )
}
