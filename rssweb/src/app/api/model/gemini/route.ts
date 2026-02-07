// Gemini API 集成

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, prompt, messages, model } = body

    // Gemini API 配置
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

    // 检查 API Key 是否配置
    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        provider: 'gemini',
        error: 'Gemini API Key 未配置',
      }, { status: 500 })
    }

    // 处理不同类型的请求
    if (action === 'quota-check' || action === 'generate' || action === 'chat') {
      console.log(`Gemini ${action} request`)

      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: messages || [{ role: 'user', parts: [{ text: prompt || '' }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Gemini API error:', errorData)

        return NextResponse.json({
          success: false,
          provider: 'gemini',
          action,
          error: errorData.error?.message || errorData.message || 'API 调用失败',
          status: response.status,
        })
      }

      const data = await response.json()

      return NextResponse.json({
        success: true,
        provider: 'gemini',
        action,
        data: {
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
          usage: {
            promptTokens: data.usageMetadata?.promptTokenCount || 0,
            completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata?.totalTokenCount || 0,
          },
          model: 'gemini-pro',
        },
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: quota-check, generate, or chat',
    }, { status: 400 })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({
      success: false,
      provider: 'gemini',
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 })
  }
}
