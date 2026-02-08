'use client'

import { useState, useRef } from 'react'
import { Download, Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, FolderDown } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { exportToOPML, importFromOPML, downloadOPML, readOPMLFile } from '@/lib/opml'
import { cn } from '@/lib/utils'

export default function ImportExportPage() {
  const router = useRouter()
  const { subscriptions, addSubscription } = useApp()

  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    success: number
    errors: string[]
    details: Array<{ title: string; url: string; error?: string }>
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const opmlContent = exportToOPML(subscriptions)
      const filename = `rssweb-subscriptions-${new Date().toISOString().split('T')[0]}.opml`
      downloadOPML(opmlContent, filename)
    } catch (error) {
      alert('导出失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  const handleImport = async (file: File) => {
    setImporting(true)
    setImportResults(null)

    try {
      const opmlContent = await readOPMLFile(file)
      const { subscriptions: importedSubs, errors } = importFromOPML(opmlContent)

      // 导入订阅源
      const success: string[] = []
      const details: Array<{ title: string; url: string; error?: string }> = []

      for (const sub of importedSubs) {
        try {
          await addSubscription(sub)
          success.push(sub.title)
          details.push({ title: sub.title, url: sub.url })
        } catch (error) {
          details.push({
            title: sub.title,
            url: sub.url,
            error: error instanceof Error ? error.message : '添加失败'
          })
        }
      }

      setImportResults({
        success: success.length,
        errors: errors,
        details
      })
    } catch (error) {
      alert('导入失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setImporting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImport(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImport(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            ← 返回
          </button>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            OPML 导入/导出
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* 导出部分 */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              导出订阅
            </h2>
            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
                  <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    导出所有订阅源
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    将您的所有订阅源导出为 OPML 文件，可用于备份或在其他 RSS 阅读器中导入。
                  </p>
                  <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>OPML 格式</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FolderDown className="h-4 w-4" />
                      <span>UTF-8 编码</span>
                    </div>
                    <div>
                      <strong>{subscriptions.length}</strong> 个订阅源
                    </div>
                  </div>
                  <button
                    onClick={handleExport}
                    disabled={subscriptions.length === 0}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white text-base font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    导出 OPML 文件
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 导入部分 */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              导入订阅
            </h2>
            <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-sm p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    从 OPML 文件导入
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    上传 OPML 文件以导入订阅源。支持从其他 RSS 阅读器（如 Feedly, Inoreader 等）导出的 OPML 文件。
                  </p>

                  {/* 拖放区域 */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-all",
                      "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950",
                      "border-zinc-300 dark:border-zinc-700",
                      importing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".opml,.xml"
                      onChange={handleFileSelect}
                      disabled={importing}
                      className="hidden"
                    />
                    <Upload className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
                    <p className="text-zinc-900 dark:text-zinc-50 mb-2">
                      拖放 OPML 文件到这里
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      或者
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={importing}
                      className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      {importing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          导入中...
                        </>
                      ) : (
                        <>
                          <FolderDown className="h-4 w-4" />
                          选择文件
                        </>
                      )}
                    </button>
                  </div>

                  {/* 导入结果 */}
                  {importResults && (
                    <div className="mt-6 space-y-4">
                      {/* 总体结果 */}
                      <div className={cn(
                        "p-4 rounded-lg flex items-start gap-3",
                        importResults.success > 0
                          ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                          : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                      )}>
                        {importResults.success > 0 ? (
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">
                            导入完成！成功导入 <strong>{importResults.success}</strong> 个订阅源
                          </p>
                          {importResults.errors.length > 0 && (
                            <p className="text-sm mt-1">
                              有 <strong>{importResults.errors.length}</strong> 个错误
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 详细列表 */}
                      {importResults.details.length > 0 && (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                          <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                              导入详情
                            </span>
                            <button
                              onClick={() => router.push('/')}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              查看订阅
                            </button>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {importResults.details.map((item, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-start gap-2",
                                  item.error && "bg-red-50 dark:bg-red-950/20"
                                )}
                              >
                                {item.error ? (
                                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate font-mono">
                                    {item.url}
                                  </p>
                                  {item.error && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                      {item.error}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 说明 */}
          <section className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              关于 OPML
            </h3>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                OPML (Outline Processor Markup Language) 是用于存储和交换 RSS 订阅源列表的标准格式。
              </p>
              <p>
                您可以从以下阅读器导出 OPML 文件：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Feedly → Settings → OPML</li>
                <li>Inoreader → Preferences → Export OPML</li>
                <li>The Old Reader → Account → Export</li>
                <li>NetNewsWire → File → Export Subscriptions</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
