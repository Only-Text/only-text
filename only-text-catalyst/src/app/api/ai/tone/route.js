import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const TONE_PROMPTS = {
  professional: 'Convert this text to a professional, business-appropriate tone. Keep the meaning but make it suitable for formal business communication.',
  casual: 'Convert this text to a casual, friendly tone. Make it conversational and relaxed while keeping the core message.',
  friendly: 'Convert this text to a warm, friendly tone. Make it approachable and personable.',
  formal: 'Convert this text to a formal, academic tone. Use sophisticated language and proper structure.',
  confident: 'Convert this text to a confident, assertive tone. Make it strong and self-assured.',
  empathetic: 'Convert this text to an empathetic, understanding tone. Show compassion and care.'
}

export async function POST(request) {
  try {
    const { text, tone } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!tone || !TONE_PROMPTS[tone]) {
      return NextResponse.json(
        { error: 'Valid tone is required (professional, casual, friendly, formal, confident, empathetic)' },
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
          content: `${TONE_PROMPTS[tone]} Return ONLY the converted text, no explanations.

Text to convert:
${text}`
        }
      ]
    })

    const convertedText = message.content[0].text

    return NextResponse.json({
      original: text,
      converted: convertedText,
      tone: tone,
      model: 'claude-haiku-4.5',
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    })

  } catch (error) {
    console.error('AI Tone Error:', error)
    return NextResponse.json(
      { error: 'Failed to convert tone. Please try again.' },
      { status: 500 }
    )
  }
}
