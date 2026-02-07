// 统一的模型调用 Hook

import { useState, useCallback } from 'react'

export interface ModelResponse {
  provider: 'big-model' | 'gemini'
  success: boolean
  data?: {
    content?: string
    usage?: {
      promptTokens?: number
      completionTokens?: number
      totalTokens?: number
    }
    resetTime?: string
    error?: string
  }
  error?: string
}

export function useModelCall() {
  const [currentProvider, setCurrentProvider] = useState<'big-model' | 'gemini'>('big-model')
  const [lastSwitchTime, setLastSwitchTime] = useState<Date | null>(null)
  const [quotaStatus, setQuotaStatus] = useState<{
    provider: 'big-model' | 'gemini'
    isExhausted: boolean
    resetTime?: string
    nextCheckTime?: number
  } | null>(null)

  // 调用 Big Model
  const callBigModel = useCallback(async (prompt: string, messages?: any[], model?: string): Promise<ModelResponse> => {
    console.log('Calling Big Model API...')
    
    try {
      const response = await fetch('/api/model/big-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt,
          messages,
          model,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // 检查是否是 429 错误（使用限额已用完）
        if (response.status === 429 || data.error?.includes('Usage limit')) {
          const now = Date.now()
          const fiveHoursLater = new Date(now + 5 * 60 * 60 * 1000).toISOString()

          setQuotaStatus({
            provider: 'big-model',
            isExhausted: true,
            resetTime: data.resetTime || fiveHoursLater,
            nextCheckTime: now + 5 * 60 * 60 * 1000,
          })

          // 自动切换到 Gemini
          console.log('Big Model quota exhausted, switching to Gemini')
          setCurrentProvider('gemini')
          setLastSwitchTime(new Date())
        }

        return {
          provider: 'big-model',
          success: false,
          error: data.error || 'Big Model API 调用失败',
        }
      }

      return {
        provider: 'big-model',
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error('Big Model API error:', error)
      return {
        provider: 'big-model',
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      }
    }
  }, [])

  // 调用 Gemini
  const callGemini = useCallback(async (prompt: string, messages?: any[], model?: string): Promise<ModelResponse> => {
    console.log('Calling Gemini API...')
    
    try {
      const response = await fetch('/api/model/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt,
          messages,
          model,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          provider: 'gemini',
          success: false,
          error: data.error || 'Gemini API 调用失败',
        }
      }

      return {
        provider: 'gemini',
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      return {
        provider: 'gemini',
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      }
    }
  }, [])

  // 统一调用接口（根据当前提供商选择）
  const callModel = useCallback(async (prompt: string, messages?: any[], model?: string): Promise<ModelResponse> => {
    // 检查是否应该切换提供商
    if (quotaStatus?.isExhausted && currentProvider === 'big-model') {
      console.log('Big Model quota exhausted, using Gemini')
      setCurrentProvider('gemini')
      setLastSwitchTime(new Date())
      
      return await callGemini(prompt, messages, model)
    }

    // 根据当前提供商选择
    if (currentProvider === 'big-model') {
      return await callBigModel(prompt, messages, model)
    } else {
      return await callGemini(prompt, messages, model)
    }
  }, [currentProvider, quotaStatus, callBigModel, callGemini])

  // 手动切换到 Big Model
  const switchToBigModel = useCallback(() => {
    console.log('Switching to Big Model')
    setCurrentProvider('big-model')
    setLastSwitchTime(new Date())
    setQuotaStatus(null) // 清除额度状态
  }, [])

  // 手动切换到 Gemini
  const switchToGemini = useCallback(() => {
    console.log('Switching to Gemini')
    setCurrentProvider('gemini')
    setLastSwitchTime(new Date())
  }, [])

  // 检查 Big Model 额度是否已恢复
  const checkBigModelRecovery = useCallback(async (): Promise<boolean> => {
    if (!quotaStatus?.isExhausted) {
      return true // 额度未用完，可以使用
    }

    const now = Date.now()
    const nextCheckTime = quotaStatus?.nextCheckTime || 0

    // 如果未到下次检查时间，不检查
    if (now < nextCheckTime) {
      console.log('Not yet time to check Big Model recovery')
      return false
    }

    console.log('Checking Big Model quota recovery...')

    try {
      // 调用最小化的 API 检查额度
      const response = await fetch('/api/model/big-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quota-check',
        }),
      })

      const data = await response.json()

      // 检查是否还有 429 错误
      if (response.status === 429) {
        console.log('Big Model quota still exhausted, resetting next check time')
        
        const nextCheckTime = now + 5 * 60 * 60 * 1000
        setQuotaStatus(prev => prev ? {
          ...prev,
          nextCheckTime: nextCheckTime,
        } : null)

        return false
      }

      // 额度已恢复
      console.log('Big Model quota recovered, switching back')
      
      setQuotaStatus(null)
      setCurrentProvider('big-model')
      setLastSwitchTime(new Date())
      
      return true
    } catch (error) {
      console.error('Check Big Model recovery error:', error)
      return false
    }
  }, [quotaStatus])

  return {
    currentProvider,
    lastSwitchTime,
    quotaStatus,
    callModel,
    callBigModel,
    callGemini,
    switchToBigModel,
    switchToGemini,
    checkBigModelRecovery,
  }
}
