// 时间锚点配置

export const ANCHOR_TIMES = [
  '13:00',  // 第一个锚点（特殊）
  '00:01',  // 凌晨
  '05:01',  // 早晨
  '10:01',  // 上午
  '15:01',  // 下午
  '20:01',  // 晚上
  '01:01',  // 凌晨
  '06:01',  // 早晨
  '11:01',  // 上午
  '16:01',  // 下午
  '21:01',  // 晚上
] as const

// 特殊标记：第一个锚点
export const FIRST_ANCHOR = '13:00'

// 获取下一个锚点时间（考虑第一个锚点）
export function getNextAnchorTime(currentTime: Date): string {
  const hour = currentTime.getHours() + currentTime.getMinutes() / 60
  
  // 特殊处理：如果还没有记录过任何锚点，返回第一个
  const recordedAnchors = getRecordedAnchors()
  if (recordedAnchors.length === 0) {
    console.log('没有记录过锚点，返回第一个锚点 13:00')
    return FIRST_ANCHOR
  }

  // 正常的循环逻辑（5 小时周期）
  const [anchorHour] = hour % 12 === 1 ? 0 : (Math.floor(hour / 5) + 1) * 5 + 1
  
  // 检查是否匹配第一个锚点
  if (anchorHour === 13 && currentTime.getMinutes() < 1) {
    console.log('匹配第一个锚点 13:00')
    return FIRST_ANCHOR
  }
  
  return ANCHOR_TIMES.find((time) => {
    const [h, m] = time.split(':').map(Number)
    return h === anchorHour && m === 1
  }) || ANCHOR_TIMES[0]
}

// 获取已记录的锚点
function getRecordedAnchors(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem('anchor_records')
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.map((record: any) => record.anchorTime)
    }
  } catch (error) {
    console.error('读取锚点记录失败:', error)
    return []
  }
}

// 检查是否需要记录第一个锚点
export function shouldRecordFirstAnchor(): boolean {
  const recordedAnchors = getRecordedAnchors()
  return !recordedAnchors.includes(FIRST_ANCHOR)
}

// 保存第一个锚点记录
export function saveFirstAnchorRecord() {
  const record = {
    anchorTime: FIRST_ANCHOR,
    provider: 'big-model',
    recordedAt: new Date().toISOString(),
    isFirstAnchor: true,  // 标记为第一个锚点
  }

  try {
    const existingData = localStorage.getItem('anchor_records')
    const parsed = existingData ? JSON.parse(existingData) : []
    parsed.push(record)
    localStorage.setItem('anchor_records', JSON.stringify(parsed))
    console.log('第一个锚点已记录:', FIRST_ANCHOR)
  } catch (error) {
    console.error('保存第一个锚点失败:', error)
  }
}
