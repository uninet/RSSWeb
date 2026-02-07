// 重置时间探测系统

export interface ResetTimeRecord {
  resetTime: string         // 实际的重置时间（ISO 格式）
  provider: 'big-model'
  detectedAt: string        // 探测到的时间
}

export interface QuotaSystem {
  currentResetTime: string | null
  nextCheckTime: number
  lastDetectionTime: number
}

// 探测重置时间（通过最小化 API 调用）
export async function detectResetTime(): Promise<string | null> {
  console.log('开始探测 Big Model 重置时间...')
  
  try {
    // 这里应该调用一个最小化的 API 来探测重置时间
    // 暂时返回一个示例时间（从用户反馈中获取的 13:01）
    // 实际实现中，应该从 API 响应中获取实际的 resetTime
    
    // 模拟：如果 Big Model 返回 resetTime
    const mockResponse = {
      resetTime: new Date().toISOString(), // 临时：使用当前时间作为示例
      message: '这是示例响应，实际应该从 Big Model API 获取',
    }
    
    const resetTime = mockResponse.resetTime
    console.log('探测到重置时间:', resetTime)
    
    return resetTime
  } catch (error) {
    console.error('探测重置时间失败:', error)
    return null
  }
}

// 保存重置时间记录
export function saveResetRecord(record: ResetTimeRecord) {
  if (typeof window === 'undefined') return
  
  try {
    const existingRecords = JSON.parse(localStorage.getItem('reset_time_records') || '[]')
    existingRecords.push(record)
    localStorage.setItem('reset_time_records', JSON.stringify(existingRecords))
    console.log('重置时间记录已保存:', record)
  } catch (error) {
    console.error('保存重置时间记录失败:', error)
  }
}

// 获取最新的重置时间
export function getLatestResetTime(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const records = JSON.parse(localStorage.getItem('reset_time_records') || '[]')
    if (records.length === 0) return null
    
    // 找到最新的记录
    const latest = records[records.length - 1]
    return latest.resetTime
  } catch (error) {
    console.error('读取重置时间记录失败:', error)
    return null
  }
}

// 计算下次探测时间（重置时间 + 5 小时）
export function calculateNextCheckTime(resetTime: string): number {
  const resetTimeObj = new Date(resetTime)
  const nextCheckTime = resetTimeObj.getTime() + (5 * 60 * 60 * 1000) // 5 小时
  
  return nextCheckTime
}

// 检查是否应该探测新的重置时间
export function shouldDetectNewReset(): boolean {
  const now = Date.now()
  const nextCheckTimeStr = localStorage.getItem('next_check_time')
  
  if (!nextCheckTimeStr) return true
  
  const nextCheckTime = parseInt(nextCheckTimeStr, 10)
  
  // 如果当前时间 >= 下次检查时间，应该探测
  if (now >= nextCheckTime) {
    return true
  }
  
  return false
}

// 保存下次检查时间
export function saveNextCheckTime(time: number) {
  localStorage.setItem('next_check_time', time.toString())
  console.log('下次检查时间已保存:', new Date(time).toISOString())
}
