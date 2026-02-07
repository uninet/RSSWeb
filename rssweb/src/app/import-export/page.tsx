'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/AppContext'
import {
  FileText,
  Upload,
  Download,
  CheckCircle2,
  X,
  FolderOpen,
  RefreshCw,
} from 'lucide-react'

export default function ImportExportPage() {
  const { subscriptions, addSubscription, subscriptions: subs } = useApp()

  const [opmlContent, setOPMLContent] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 生成 OPML 内容
  const generateOPML = () => {
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>我的订阅导出</title>
  </head>
  <body>
    <outline title="我的订阅">
${subs.map((sub) => `      <outline text="${sub.title}" title="${sub.description || ''}" htmlUrl="${sub.url}" xmlUrl="${sub.url}" type="rss" />`).join('\n')}
    </outline>
  </body>
</opml>`

    return content
  }

  // 处理文件导入
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/xml')

        const outlines = doc.querySelectorAll('outline')
        const newSubscriptions: any[] = []

        outlines.forEach((outline) => {
          const textAttr = outline.getAttribute('text')
          const htmlUrlAttr = outline.getAttribute('htmlUrl')
          const xmlUrlAttr = outline.getAttribute('xmlUrl')
          const typeAttr = outline.getAttribute('type')

          if (textAttr && htmlUrlAttr) {
            const newSubscription = {
              id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: textAttr,
              url: htmlUrlAttr,
              description: outline.getAttribute('title') || undefined,
              category: undefined,
              addedAt: Date.now(),
              unreadCount: 0,
              icon: undefined,
            }
            newSubscriptions.push(newSubscription)
          }
        })

        if (newSubscriptions.length > 0) {
          // 添加导入的订阅
          newSubscriptions.forEach((sub) => addSubscription(sub))
          setSuccess(`✅ 成功导入 ${newSubscriptions.length} 个订阅`)
          setOPMLContent(text)
        } else {
          setError('未找到有效的 OPML 文件或订阅信息')
        }
      } catch (err) {
        console.error('Failed to parse OPML:', err)
        setError('解析 OPML 文件失败，请确保文件格式正确')
      }
    }

    reader.readAsText(file)
  }

  // 处理 OPML 导出
  const handleExport = () => {
    if (subs.length === 0) {
      setError('没有可导出的订阅')
      return
    }

    setIsExporting(true)
    setError('')

    try {
      const content = generateOPML()
      const blob = new Blob([content], { type: 'text/xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'subscriptions.opml'
      a.click()
      URL.revokeObjectURL(url)

      setSuccess('✅ OPML 文件已下载')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to export OPML:', err)
      setError('导出失败')
    } finally {
      setIsExporting(false)
    }
  }

  // 粘贴 OPML
  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setOPMLContent(text)
      setError('已粘贴 OPML 内容，点击"导入"按钮导入')
    }).catch(() => {
      setError('无法读取剪贴板')
    })
  }

  // 手动编辑 OPML
  const handleImport = () => {
    if (!opmlContent.trim()) {
      setError('请先输入或粘贴 OPML 内容')
      return
    }

    setIsImporting(true)
    setError('')

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(opmlContent, 'text/xml')

      const outlines = doc.querySelectorAll('outline')
      const newSubscriptions: any[] = []

      outlines.forEach((outline) => {
        const textAttr = outline.getAttribute('text')
        const htmlUrlAttr = outline.getAttribute('htmlUrl')
        const xmlUrlAttr = outline.getAttribute('xmlUrl')
        const typeAttr = outline.getAttribute('type')

        if (textAttr && htmlUrlAttr) {
          const newSubscription = {
            id: `sub-${Date.now()}-${Math.random().toString(36).subs(2, 9)}`,
            title: textAttr,
            url: htmlUrlAttr,
            description: outline.getAttribute('title') || undefined,
            category: undefined,
            addedAt: Date.now(),
            unreadCount: 0,
            icon: undefined,
          }
          newSubscriptions.push(newSubscription)
        }
      })

      if (newSubscriptions.length > 0) {
        newSubscriptions.forEach((sub) => addSubscription(sub))
        setSuccess(`✅ 成功导入 ${newSubscriptions.length} 个订阅`)
        setOPMLContent('')
      } else {
        setError('未找到有效的订阅信息')
      }
    } catch (err) {
      console.error('Failed to import OPML:', err)
      setError('导入失败，请检查 OPML 格式')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <X className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">导入/导出</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>OPML 管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                OPML (Outline Processor Markup Language) 是 RSS 阅读器通用的订阅导出/导入格式。
                支持主流 RSS 阅读器（如 Feedly, Inoreader, NetNewsWire 等）。
              </p>
              <div className="flex items-center gap-4 text-sm">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>
                  当前有 <strong className="text-zinc-900 dark:text-zinc-50">{subs.length}</strong> 个订阅源
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Export Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  导出订阅 (OPML)
                </CardTitle>
                <CardDescription>将你的所有订阅导出为 OPML 文件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <FileText className="h-8 w-8 text-zinc-400" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">subscriptions.opml</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      标准的 OPML 格式，包含所有订阅源信息
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={isExporting || subs.length === 0}
                  className="w-full"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      导出中...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      下载 OPML 文件
                    </>
                  )}
                </Button>

                {subs.length === 0 && (
                  <p className="text-sm text-zinc-500 text-center">
                    没有订阅源可导出，请先添加订阅
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Import Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  导入订阅 (OPML)
                </CardTitle>
                <CardDescription>从 OPML 文件或粘贴内容导入订阅</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div>
                  <Label htmlFor="opml-file">选择 OPML 文件</Label>
                  <Input
                    id="opml-file"
                    type="file"
                    accept=".opml,.xml"
                    onChange={handleFileImport}
                    disabled={isImporting}
                    className="cursor-pointer"
                  />
                </div>

                {/* Text Input */}
                <div>
                  <Label htmlFor="opml-text">或粘贴 OPML 内容</Label>
                  <textarea
                    id="opml-text"
                    value={opmlContent}
                    onChange={(e) => {
                      setOPMLContent(e.target.value)
                      setError('')
                      setSuccess('')
                    }}
                    disabled={isImporting}
                    placeholder="粘贴 OPML XML 内容..."
                    className="min-h-[200px] w-full rounded-md border-zinc-300 bg-white px-3 py-2 text-sm ring-offset-2 focus-visible:ring-2 focus-visible:ring-zinc-950 focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-zinc-800 dark:focus-visible:ring-zinc-800"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePaste}
                    disabled={isImporting || !opmlContent.trim()}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    粘贴
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setOPMLContent('')}
                    disabled={isImporting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    清除
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={isImporting || !opmlContent.trim()}
                    className="flex-1"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        导入中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        导入
                      </>
                    )}
                  </Button>
                </div>

                {/* Error/Success Messages */}
                {error && !error.startsWith('✅') && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-900 dark:bg-red-900/20">
                    <X className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && !success.startsWith('✅ 已粘贴') && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-900 dark:bg-green-900/20">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                {success && success.startsWith('✅ 已粘贴') && (
                  <Button
                    variant="outline"
                    onClick={handleImport}
                    className="w-full"
                    disabled={isImporting}
                  >
                    点击导入
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle>使用帮助</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">支持的 OPML 格式</h3>
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p><strong>标准 OPML 1.0</strong> - 大多数 RSS 阅读器支持的标准格式</p>
                <p><strong>扩展属性</strong> - 可以包含 title, description 等自定义属性</p>
              </div>

              <h3 className="text-lg font-semibold mb-4">兼容的阅读器</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <strong className="block mb-1">Feedly</strong>
                  <span className="text-zinc-600 dark:text-zinc-400">✅ 完全支持</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <strong className="block mb-1">Inoreader</strong>
                  <span className="text-zinc-600 dark:text-zinc-400">✅ 完全支持</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <strong className="block mb-1">NetNewsWire</strong>
                  <span className="text-zinc-600 dark:text-zinc-400">✅ 完全支持</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <strong className="block mb-1">NewsBlur</strong>
                  <span className="text-zinc-600 dark:text-zinc-400">✅ 完全支持</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">常见问题</h3>
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p><strong>导入失败？</strong> - 请确保 OPML 文件格式正确，包含有效的 outline 元素</p>
                <p><strong>导出失败？</strong> - 确保浏览器允许文件下载</p>
                <p><strong>找不到订阅？</strong> - 检查 OPML 文件中的 url 属性是否正确</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
