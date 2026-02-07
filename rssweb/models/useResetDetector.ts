// 重置时间探测 Hook

import { useState, useEffect, useCallback } from 'react'
import {
  detectResetTime,
  saveResetRecord,
  getLatestResetTime,
  calculateNextCheckTime,
  shouldDetectNewReset,
  saveNextCheckTime,
} from './reset-time-detector'

export function useResetDetector() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [latestResetTime, setLatestResetTime] = useState<string | null>(null)
  const [detectionCount, setDetectionCount] = useState(0)
  const [lastDetectionTime, setLastDetectionTime] = useState<Date | null>(null)

  // 初始化：从 localStorage 读取最新的重置时间
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resetTime = getLatestResetTime()
      if (resetTime) {
        setLatestResetTime(resetTime)
        console.log('初始化重置时间:', resetTime)
      }
    }
  }, [])

  // 自动探测循环
  useEffect(() => {
    if (isDetecting) {
      console.log('正在探测中，跳过自动探测')
      return
    }

    const now = Date.now()
    const nextCheckTimeStr = localStorage.getItem('next_check_time')

    if (!nextCheckTimeStr) {
      console.log('没有下次检查时间，开始探测')
      performDetection()
      return
    }

    const nextCheckTime = parseInt(nextCheckTimeStr, 10)

    // 如果到了检查时间，开始探测
    if (now >= nextCheckTime) {
      console.log('到了检查时间，开始探测')
      performDetection()
    } else {
      console.log('未到检查时间，等待...')
      const remaining = nextCheckTime - now
      console.log(`距离下次检查还有 ${Math.round(remaining / 60000)} 分钟`)
    }
  }, [isDetecting])

  // 执行探测
  const performDetection = useCallback(async () => {
    console.log('开始探测 Big Model 重置时间...')
    setIsDetecting(true)

    try {
      // 探测重置时间
      const resetTime = await detectResetTime()

      if (resetTime) {
        // 保存重置时间记录
        const record = {
          resetTime: resetTime,
          provider: 'big-model',
          detectedAt: new Date().toISOString(),
        }
        saveResetRecord(record)

        // 保存下次检查时间（重置时间 + 5 小时）
        const nextCheckTime = calculateNextCheckTime(resetTime)
        saveNextCheckTime(nextCheckTime)

        setLatestResetTime(resetTime)
        setLastDetectionTime(new Date())
        setDetectionCount(prev => prev + 1)

        console.log(`✅ 探测到重置时间: ${resetTime}`)
        console.log(`下次检查时间: ${new Date(nextCheckTime).toLocaleString('zh-CN')}`)
      } else {
        console.log('⚠️ 未能探测到重置时间')
      }
    } catch (error) {
      console.error('探测重置时间失败:', error)
    } finally {
      setIsDetecting(false)
    }
  }, [])

  // 手动触发探测
  const manualDetect = useCallback(async () => {
    console.log('手动触发探测...')
    await performDetection()
  }, [performDetection])

  // 检查是否应该探测新的重置时间
  const shouldDetect = useCallback(() => {
    return shouldDetectNewReset()
  }, [])

  return {
    isDetecting,
    latestResetTime,
    detectionCount,
    lastDetectionTime,
    manualDetect,
    shouldDetect,
  }
}
