'use client'

import { useState } from 'react'
import { resetAllData } from '@/lib/storage'
import { useRouter } from 'next/navigation'

export default function ResetDataPage() {
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleReset = () => {
    try {
      resetAllData()
      setMessage('数据已重置！正在跳转首页...')
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error) {
      setMessage('重置失败：' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          重置数据
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          这将清除所有订阅源、文章和分类，然后重新加载示例数据。
        </p>
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('失败')
              ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
              : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
          }`}>
            {message}
          </div>
        )}
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重置数据
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
