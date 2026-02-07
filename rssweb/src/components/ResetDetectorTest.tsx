// 重置时间探测测试组件

'use client'

import { useResetDetector } from '@/models/useResetDetector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, AlertCircle, CheckCircle2, RefreshCw, Hourglass, Info } from 'lucide-react'

export function ResetDetectorTest() {
  const { systemState, performDetection, manualDetect, isInWaitPeriod, getWaitPeriodRemaining } = useResetDetector()

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '未探测'
    return new Date(isoString).toLocaleTimeString('zh-CN')
  }

  const waitPeriod = getWaitPeriodRemaining()

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>重置时间探测系统测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 系统状态 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm font-medium">系统状态</span>
              <div className="flex items-center gap-2">
                {systemState.isDetecting ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">探测中...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">就绪</span>
                  </div>
                )}
              </div>
            </div>

            {/* 重置时间 */}
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    最新探测的重置时间
                  </div>
                  <div className="text-lg font-semibold">
                    {formatTime(systemState.latestResetTime)}
                  </div>
                </div>
                <Clock className="h-5 w-5 text-zinc-400" />
              </div>
            </div>

            {/* 下次检查时间 */}
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    下次探测时间
                  </div>
                  <div className="text-lg font-semibold">
                    {systemState.nextCheckTime
                      ? new Date(systemState.nextCheckTime).toLocaleTimeString('zh-CN')
                      : '未设置'}
                  </div>
                </div>
                <Hourglass className="h-5 w-5 text-zinc-400" />
              </div>
            </div>

            {/* 等待期状态 */}
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    等待期状态
                  </div>
                  <div className="text-lg font-semibold">
                    {isInWaitPeriod()
                      ? waitPeriod
                        ? `${waitPeriod.hours}小时${waitPeriod.minutes}分钟`
                        : '等待中...'
                      : '不在等待期'
                    }
                  </div>
                </div>
                {isInWaitPeriod() ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Info className="h-5 w-5" />
                  </div>
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button onClick={manualDetect} disabled={systemState.isDetecting}>
              <RefreshCw className="h-4 w-4 mr-2" />
              手动探测
            </Button>
            <Button variant="outline" onClick={performDetection} disabled={systemState.isDetecting}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              执行探测
            </Button>
          </div>

          {/* 信息提示 */}
          {isInWaitPeriod() && waitPeriod && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm text-amber-900 dark:text-amber-100">
                <strong>等待期中：</strong>当前处于 5 小时等待期，剩余{waitPeriod.hours}小时{waitPeriod.minutes}分钟。
                等待期结束后，将再次探测 Big Model 的重置时间。
              </div>
            </div>
          )}

          {systemState.latestResetTime && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <strong>已锚定重置时间：</strong>
                {formatTime(systemState.latestResetTime)}。
                系统将基于这个时间锚定计算 Big Model 的额度重置周期，
                防止重置时间随实际调用时间漂移。
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 技术说明 */}
      <Card>
        <CardHeader>
          <CardTitle>技术说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <h3 className="font-semibold">工作原理</h3>
          <ol className="space-y-2 list-decimal list-inside text-zinc-600 dark:text-zinc-400">
            <li><strong>实时探测：</strong>通过最小化 API 调用探测 Big Model 的实际重置时间</li>
            <li><strong>时间锚定：</strong>将探测到的重置时间固定下来，防止随实际调用时间漂移</li>
            <li><strong>周期性检查：</strong>每分钟检查一次是否需要探测新的重置时间</li>
            <li><strong>等待期管理：</strong>探测后进入 5 小时等待期，避免频繁调用</li>
            <li><strong>智能触发：</strong>等待期结束后，自动开始下一次探测</li>
          </ol>

          <h3 className="font-semibold mt-4">解决的问题</h3>
          <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
            <li>✅ Big Model 额度在 13:01 重置，但实际调用时间是 13:16 - 系统能正确锚定 13:01</li>
            <li>✅ 重置时间不会因为多次调用而不断后延</li>
            <li>✅ 自动化探测，无需手动干预</li>
            <li>✅ 最小化 API 调用，节省 Token</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
