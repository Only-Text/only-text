import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 10,000 characters.' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a professional text improvement assistant. Improve the following text to make it clearer, more professional, and better written. Keep the same meaning and tone, but enhance clarity, grammar, and flow. Return ONLY the improved text, no explanations.

Text to improve:
${text}`
        }
      ]
    })

    const improvedText = message.content[0].text

    return NextResponse.json({
      original: text,
      improved: improvedText,
      model: 'claude-haiku-4.5',
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    })

  } catch (error) {
    console.error('AI Improve Error:', error)
    return NextResponse.json(
      { error: 'Failed to improve text. Please try again.' },
      { status: 500 }
    )
  }
}
