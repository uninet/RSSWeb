// 锚点管理 - 支持第一个特殊锚点

import { useEffect, useState, ReactNode } from 'react'
import { ANCHOR_TIMES, FIRST_ANCHOR, shouldRecordFirstAnchor, saveFirstAnchorRecord, getRecordedAnchors } from './anchors'

export interface AnchorRecord {
  anchorTime: string
  provider: 'big-model'
  recordedAt: number
  isFirstAnchor?: boolean  // 标记是否为第一个锚点
}

export interface AnchorStorage {
  currentAnchor: string | null
  lastSyncTime: number
  recordedAnchors: AnchorRecord[]
}

export function useAnchors() {
  const [anchorStorage, setAnchorStorage] = useState<AnchorStorage>({
    currentAnchor: null,
    lastSyncTime: 0,
    recordedAnchors: [],
  })

  // 记录第一个锚点（特殊标记）
  const recordFirstAnchor = () => {
    if (shouldRecordFirstAnchor()) {
      saveFirstAnchorRecord()
      
      // 更新已记录的锚点列表
      const allAnchors = getRecordedAnchors()
      const newAnchor: AnchorRecord = {
        anchorTime: FIRST_ANCHOR,
        provider: 'big-model',
        recordedAt: Date.now(),
        isFirstAnchor: true,
      }
      
      // 合并并去重
      const existingTime = allAnchors.find(a => a.anchorTime === FIRST_ANCHOR)
      if (!existingTime) {
        allAnchors.push(newAnchor)
        localStorage.setItem('anchor_records', JSON.stringify(allAnchors))
      }
      
      // 更新当前锚点为第一个锚点
      setAnchorStorage(prev => ({
        ...prev,
        currentAnchor: FIRST_ANCHOR,
      }))
      
      console.log('第一个特殊锚点已记录:', FIRST_ANCHOR)
    }
  }

  // 正常的锚点同步（每5分钟）
  const syncNormalAnchors = () => {
    const now = new Date()
    const nextAnchor = getNextAnchorTime(now)
    const [anchorHour] = nextAnchor.split(':').map(Number)

    // 避免重复记录同一个锚点
    const allAnchors = getRecordedAnchors()
    const existingAnchor = allAnchors.find(a => a.anchorTime === nextAnchor)
    
    if (existingAnchor) {
      console.log(`锚点 ${nextAnchor} 已存在，跳过记录`)
    } else {
      const newAnchor: AnchorRecord = {
        anchorTime: nextAnchor,
        provider: 'big-model',
        recordedAt: now.getTime(),
      }

      const updatedAnchors = [...allAnchors, newAnchor]
      localStorage.setItem('anchor_records', JSON.stringify(updatedAnchors))
      
      setAnchorStorage(prev => ({
        ...prev,
        currentAnchor: nextAnchor,
        lastSyncTime: now.getTime(),
      }))
      
      console.log('锚点已同步:', nextAnchor)
    }
  }

  // 自动锚点同步（每5分钟）
  useEffect(() => {
    const interval = setInterval(() => {
      syncNormalAnchors()
    }, 300000) // 每5分钟

    return () => clearInterval(interval)
  }, [])

  // 手动同步
  const syncNow = () => {
    recordFirstAnchor()
    syncNormalAnchors()
  }

  // 获取下一个锚点
  const getNextAnchor = () => {
    const now = new Date()
    const next = getNextAnchorTime(now)
    return next
  }

  // 检查是否应该记录第一个锚点
  const checkShouldRecordFirst = () => {
    const allAnchors = getRecordedAnchors()
    const hasFirstAnchor = allAnchors.some(a => a.isFirstAnchor)
    
    // 如果没有记录过第一个锚点，立即记录
    if (!hasFirstAnchor) {
      console.log('检测到未记录第一个锚点，准备记录')
      return true
    }
    
    return false
  }

  // 页面加载时检查是否需要记录第一个锚点
  useEffect(() => {
    if (checkShouldRecordFirst()) {
      setTimeout(() => {
        recordFirstAnchor()
      }, 1000) // 延迟 1 秒执行，确保页面完全加载
    }
  }, [])

  // 统计信息
  const getStats = () => {
    const allAnchors = getRecordedAnchors()
    const firstAnchor = allAnchors.find(a => a.isFirstAnchor)
    const normalAnchors = allAnchors.filter(a => !a.isFirstAnchor)
    
    return {
      total: allAnchors.length,
      firstAnchor: firstAnchor ? firstAnchor.anchorTime : '未记录',
      normalAnchors: normalAnchors.length,
    }
  }

  return {
    anchorStorage,
    syncNormalAnchors,
    recordFirstAnchor,
    syncNow,
    getNextAnchor,
    getStats,
    checkShouldRecordFirst,
  }
}
