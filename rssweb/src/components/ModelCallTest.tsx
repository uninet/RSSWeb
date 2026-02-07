// 模型调用测试页面

'use client'

import { useState } from 'react'
import { useModelCall } from '@/models/useModelCall'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  AlertTriangle,
} from 'lucide-react'

export function ModelCallTest() {
  const {
    currentProvider,
    lastSwitchTime,
    quotaStatus,
    callModel,
    switchToBigModel,
    switchToGemini,
    checkBigModelRecovery,
  } = useModelCall()

  const [prompt, setPrompt] = useState('你好，请介绍一下你自己')
  const [loading, setLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!prompt.trim()) {
      setError('请输入提示词')
      return
    }

    setLoading(true)
    setError(null)
    setLastResponse(null)

    try {
      const response = await callModel(prompt)
      setLastResponse(response)

      if (!response.success) {
        setError(response.error || '调用失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckRecovery = async () => {
    try {
      const recovered = await checkBigModelRecovery()
      console.log('Big Model recovery check:', recovered)

      if (recovered) {
        alert('Big Model 额度已恢复，已切换回 Big Model')
      } else {
        alert('Big Model 额度还未恢复，继续使用 Gemini')
      }
    } catch (err) {
      console.error('Check recovery error:', err)
      setError(err instanceof Error ? err.message : '检查失败')
    }
  }

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '未知'
    return new Date(isoString).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-6">
      {/* Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            当前模型状态
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                当前提供商
              </div>
              <div className="text-lg font-semibold flex items-center gap-2">
                {currentProvider === 'big-model' ? (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-600" />
                    <span>Big Model</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>Gemini</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                上次切换时间
              </div>
              <div className="text-lg font-semibold">
                {lastSwitchTime ? formatTime(lastSwitchTime.toISOString()) : '从未切换'}
              </div>
            </div>
          </div>

          {quotaStatus && quotaStatus.isExhausted && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Big Model 额度已用完
                  </div>
                  <div className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                    重置时间: {formatTime(quotaStatus.resetTime || '')}
                    <br />
                    下次检查: {quotaStatus.nextCheckTime ? formatTime(new Date(quotaStatus.nextCheckTime).toISOString()) : '未知'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={switchToBigModel}
              variant="outline"
              disabled={currentProvider === 'big-model'}
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              切换到 Big Model
            </Button>

            <Button
              onClick={switchToGemini}
              variant="outline"
              disabled={currentProvider === 'gemini'}
              className="w-full"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              切换到 Gemini
            </Button>
          </div>

          <Button
            onClick={handleCheckRecovery}
            variant="outline"
            disabled={!quotaStatus?.isExhausted}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            检查 Big Model 额度恢复
          </Button>
        </CardContent>
      </Card>

      {/* Test Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            模型调用测试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">提示词</label>
            <Input
              type="text"
              placeholder="输入你想要问的问题..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSend}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  发送请求
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setPrompt('你好，请介绍一下你自己')
                setError(null)
                setLastResponse(null)
              }}
              disabled={loading}
            >
              重置
            </Button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-red-900 dark:text-red-100">
                  调用失败
                </div>
                <div className="text-xs text-red-800 dark:text-red-200 mt-1">
                  {error}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Area */}
      {lastResponse && (
        <Card>
          <CardHeader>
            <CardTitle>最近响应</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span>提供商:</span>
                <span className="font-semibold">{lastResponse.provider}</span>
                <span className={lastResponse.success ? 'text-green-600' : 'text-red-600'}>
                  {lastResponse.success ? '✅ 成功' : '❌ 失败'}
                </span>
              </div>

              {lastResponse.success && lastResponse.data && (
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    响应内容:
                  </div>
                  <div className="text-base text-zinc-900 dark:text-zinc-50">
                    {lastResponse.data.content || '无内容'}
                  </div>

                  {lastResponse.data.usage && (
                    <div className="mt-4 pt-4 border-t text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="font-semibold">Prompt</div>
                          <div>{lastResponse.data.usage.promptTokens || 0} tokens</div>
                        </div>
                        <div>
                          <div className="font-semibold">Completion</div>
                          <div>{lastResponse.data.usage.completionTokens || 0} tokens</div>
                        </div>
                        <div>
                          <div className="font-semibold">Total</div>
                          <div>{lastResponse.data.usage.totalTokens || 0} tokens</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {lastResponse.error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="text-sm font-semibold text-red-900 dark:text-red-100">
                    错误信息:
                  </div>
                  <div className="text-base text-red-800 dark:text-red-200">
                    {lastResponse.error}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
