import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, formatResetTime } from '@/lib/rate-limiter'
import { validateTextInput } from '@/lib/input-validator'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    // Rate limiting check
    const ip = getClientIP(request)
    const rateLimit = checkRateLimit(ip)
    
    if (!rateLimit.allowed) {
      const resetTime = formatResetTime(rateLimit.resetIn)
      return NextResponse.json(
        { 
          error: `Rate limit exceeded. You've reached your ${rateLimit.reason.replace('_', ' ')} (${rateLimit.limit} requests). Try again in ${resetTime}.`,
          rateLimitExceeded: true,
          resetIn: rateLimit.resetIn,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + rateLimit.resetIn).toISOString(),
          }
        }
      )
    }

    const { text } = await request.json()

    // Input validation
    const validation = validateTextInput(text, 'improve')
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      )
    }

    const sanitizedText = validation.sanitized

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a professional text improvement assistant. Improve the following text to make it clearer, more professional, and better written. Keep the same meaning and tone, but enhance clarity, grammar, and flow. Return ONLY the improved text, no explanations.

Text to improve:
${sanitizedText}`
        }
      ]
    })

    const improvedText = message.content[0].text

    return NextResponse.json({
      original: text,
      improved: improvedText,
      model: 'claude-haiku-4.5',
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    }, {
      headers: {
        'X-RateLimit-Limit-Daily': '50',
        'X-RateLimit-Remaining-Daily': rateLimit.remaining.daily.toString(),
        'X-RateLimit-Limit-Hourly': '10',
        'X-RateLimit-Remaining-Hourly': rateLimit.remaining.hourly.toString(),
      }
    })

  } catch (error) {
    console.error('AI Improve Error:', error)
    return NextResponse.json(
      { error: 'Failed to improve text. Please try again.' },
      { status: 500 }
    )
  }
}
