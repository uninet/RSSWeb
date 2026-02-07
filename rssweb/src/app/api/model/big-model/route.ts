// Big Model API 集成

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, prompt, messages, model } = body

    // Big Model API 配置
    const BIG_MODEL_API_KEY = process.env.BIG_MODEL_API_KEY
    const BIG_MODEL_ENDPOINT = process.env.BIG_MODEL_ENDPOINT || 'https://api.bigmodel.com'

    // 检查 API Key 是否配置
    if (!BIG_MODEL_API_KEY) {
      return NextResponse.json({
        success: false,
        provider: 'big-model',
        error: 'Big Model API Key 未配置',
      }, { status: 500 })
    }

    // 处理不同类型的请求
    if (action === 'quota-check') {
      // 查询额度状态（最小化 API 调用）
      console.log('Quota check request')

      const response = await fetch(`${BIG_MODEL_ENDPOINT}/quota`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BIG_MODEL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Quota check error:', errorData)

        return NextResponse.json({
          success: false,
          provider: 'big-model',
          action: 'quota-check',
          error: errorData.message || '查询额度失败',
          status: response.status,
        })
      }

      const data = await response.json()

      // 检查是否是 429 错误（使用限额已用完）
      if (response.status === 429) {
        console.log('429 Usage limit reached')

        // 从响应头或响应体中获取重置时间
        const resetTime = response.headers.get('x-reset-time') ||
                          data.resetTime ||
                          new Date(Date.now() + 5 * 3600 * 1000).toISOString()

        return NextResponse.json({
          success: false,
          provider: 'big-model',
          action: 'quota-check',
          error: '使用限额已用完',
          resetTime: resetTime,
          message: '429 Usage limit reached',
        }, { status: 429 })
      }

      return NextResponse.json({
        success: true,
        provider: 'big-model',
        action: 'quota-check',
        data: {
          quotaUsed: data.quotaUsed || 'unknown',
          quotaLimit: data.quotaLimit || 'unknown',
        },
      })
    }

    if (action === 'generate' || action === 'chat') {
      // 生成/聊天请求
      console.log('Big Model generate request')

      const response = await fetch(BIG_MODEL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BIG_MODEL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'default-model',
          messages: messages || [{ role: 'user', content: prompt || '' }],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Big Model API error:', errorData)

        return NextResponse.json({
          success: false,
          provider: 'big-model',
          action: action,
          error: errorData.message || 'API 调用失败',
          status: response.status,
        })
      }

      const data = await response.json()

      return NextResponse.json({
        success: true,
        provider: 'big-model',
        action: action,
        data: {
          content: data.choices?.[0]?.message?.content || data.content || '',
          usage: data.usage,
          model: data.model,
        },
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: quota-check, generate, or chat',
    }, { status: 400 })
  } catch (error) {
    console.error('Big Model API error:', error)
    return NextResponse.json({
      success: false,
      provider: 'big-model',
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 })
  }
}
