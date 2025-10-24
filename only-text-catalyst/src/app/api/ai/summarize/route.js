import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { text, length = 'medium' } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (text.length > 50000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 50,000 characters.' },
        { status: 400 }
      )
    }

    const lengthInstructions = {
      short: 'Create a very brief summary in 1-2 sentences.',
      medium: 'Create a concise summary in 3-5 sentences.',
      long: 'Create a detailed summary in 1-2 paragraphs.'
    }

    const instruction = lengthInstructions[length] || lengthInstructions.medium

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `${instruction} Capture the key points and main ideas. Return ONLY the summary, no preamble.

Text to summarize:
${text}`
        }
      ]
    })

    const summary = message.content[0].text

    return NextResponse.json({
      original: text,
      summary: summary,
      length: length,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: Math.round((1 - summary.length / text.length) * 100),
      model: 'claude-haiku-4.5',
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    })

  } catch (error) {
    console.error('AI Summarize Error:', error)
    return NextResponse.json(
      { error: 'Failed to summarize text. Please try again.' },
      { status: 500 }
    )
  }
}
