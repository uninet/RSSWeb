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
  const [systemState, setSystemState] = useState({
    latestResetTime: null as string | null,
    nextCheckTime: 0,
    isDetecting: false,
    lastDetectionTime: 0,
  })

  // 初始化：检查是否有记录的重置时间
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resetTime = getLatestResetTime()
      if (resetTime) {
        const nextCheckTime = calculateNextCheckTime(resetTime)
        setSystemState(prev => ({
          ...prev,
          latestResetTime: resetTime,
          nextCheckTime: nextCheckTime,
        }))
      }
    }
  }, [])

  // 自动探测循环（每分钟检查一次是否需要探测）
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()

      // 检查是否应该探测新的重置时间
      if (shouldDetectNewReset()) {
        console.log('应该探测新的重置时间，开始探测...')
        performDetection()
      }

      // 检查是否到达下次检查时间
      if (systemState.nextCheckTime && now >= systemState.nextCheckTime) {
        console.log('到达下次检查时间，开始探测...')
        performDetection()
      }
    }, 60000) // 每分钟检查一次

    return () => clearInterval(interval)
  }, [systemState.nextCheckTime])

  // 执行探测
  const performDetection = useCallback(async () => {
    setSystemState(prev => ({ ...prev, isDetecting: true }))

    try {
      // 调用最小化 API 探测重置时间
      const resetTime = await detectResetTime()

      if (resetTime) {
        // 保存重置时间记录
        const record = {
          resetTime: resetTime,
          provider: 'big-model',
          detectedAt: new Date().toISOString(),
        }
        saveResetRecord(record)

        // 计算下次检查时间（重置时间 + 5 小时）
        const nextCheckTime = calculateNextCheckTime(resetTime)

        setSystemState(prev => ({
          ...prev,
          latestResetTime: resetTime,
          nextCheckTime: nextCheckTime,
          lastDetectionTime: Date.now(),
        }))

        console.log(`✅ 重置时间已探测并锚定: ${resetTime}`)
        console.log(`下次检查时间: ${new Date(nextCheckTime).toLocaleString('zh-CN')}`)
      } else {
        console.log('⚠️ 未能探测到重置时间')
      }
    } catch (error) {
      console.error('探测重置时间失败:', error)
    } finally {
      setSystemState(prev => ({ ...prev, isDetecting: false }))
    }
  }, [])

  // 手动触发探测
  const manualDetect = useCallback(async () => {
    console.log('手动触发重置时间探测...')
    await performDetection()
  }, [performDetection])

  // 检查是否在探测后的等待期（5 小时内）
  const isInWaitPeriod = useCallback(() => {
    if (!systemState.latestResetTime) return false

    const now = Date.now()
    const lastDetectionTime = systemState.lastDetectionTime || 0
    const waitPeriod = 5 * 60 * 60 * 1000 // 5 小时

    return (now - lastDetectionTime) < waitPeriod
  }, [systemState.latestResetTime, systemState.lastDetectionTime])

  // 获取等待期剩余时间
  const getWaitPeriodRemaining = useCallback(() => {
    if (!systemState.lastDetectionTime) return null

    const now = Date.now()
    const waitPeriod = 5 * 60 * 60 * 1000 // 5 小时
    const remaining = systemState.lastDetectionTime + waitPeriod - now

    if (remaining <= 0) return null

    return {
      minutes: Math.round(remaining / 60000),
      hours: Math.round(remaining / 3600000),
    }
  }, [systemState.lastDetectionTime])

  return {
    systemState,
    performDetection,
    manualDetect,
    isInWaitPeriod,
    getWaitPeriodRemaining,
  }
}
