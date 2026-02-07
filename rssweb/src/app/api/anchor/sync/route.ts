// 锚点同步 API

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, anchorTime } = body

    if (action === 'sync') {
      console.log('Manual anchor sync:', anchorTime)
      
      // 这里可以添加实际的锚点同步逻辑
      // 暂时返回成功
      return NextResponse.json({
        success: true,
        message: '锚点同步成功',
        timestamp: new Date().toISOString(),
      })
    }

    if (action === 'sync-first') {
      console.log('Syncing first anchor: 13:00')
      
      // 同步第一个特殊锚点
      return NextResponse.json({
        success: true,
        message: '第一个锚点已同步',
        anchorTime: '13:00',
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Anchor sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
