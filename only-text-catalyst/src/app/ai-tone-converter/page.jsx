'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { AITransformTemplate } from '@/components/tool-templates'
import { useToast, ToastContainer } from '@/components/toast'
import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Badge } from '@/components/badge'
import { RelatedTools } from '@/components/related-tools'
import { CheckCircleIcon, SparklesIcon, BoltIcon, ShieldCheckIcon, DocumentTextIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, UserGroupIcon } from '@heroicons/react/20/solid'

export default function AIToneConverterPage() {
  const [selectedTone, setSelectedTone] = useState('professional')
  const { toasts, showToast } = useToast()

  const tones = [
    { id: 'professional', name: 'Professional', emoji: '💼', description: 'Business-appropriate and formal' },
    { id: 'casual', name: 'Casual', emoji: '😊', description: 'Relaxed and conversational' },
    { id: 'friendly', name: 'Friendly', emoji: '🤝', description: 'Warm and approachable' },
    { id: 'formal', name: 'Formal', emoji: '🎩', description: 'Academic and sophisticated' },
    { id: 'confident', name: 'Confident', emoji: '💪', description: 'Assertive and strong' },
    { id: 'empathetic', name: 'Empathetic', emoji: '❤️', description: 'Understanding and compassionate' },
  ]

  const handleConvert = async (text) => {
    const response = await fetch('/api/ai/tone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tone: selectedTone })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to convert tone')
    }

    return data.converted
  }

  const toneSelector = (
    <div>
      <label className="mb-3 block text-sm font-medium">Select Tone</label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tones.map((tone) => (
          <button
            key={tone.id}
            onClick={() => setSelectedTone(tone.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedTone === tone.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                : 'border-zinc-200 hover:border-purple-300 dark:border-zinc-700'
            }`}
          >
            <div className="mb-2 text-2xl">{tone.emoji}</div>
            <div className="font-semibold">{tone.name}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{tone.description}</div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <ToolLayout
        title="The Best AI Tone Converter for Effortless Text Transformation"
        description="Free AI tone converter for rewriting paragraphs and articles with desired tone. Adjust tone for academic papers, business documents, social media posts. Transform text with persuasive language, enhance readability, save time with AI-powered tool."
        currentPath="/ai-tone-converter"
      >
        {/* Main Tool Interface */}
        <AITransformTemplate
          title="AI Tone Converter"
          placeholder="Paste your text here to convert its tone..."
          actionLabel="Convert Tone"
          onTransform={handleConvert}
          showToast={showToast}
          loadingText="Converting tone..."
          options={toneSelector}
          demoText="Hey! Just wanted to let you know that the meeting got moved to tomorrow. Hope that works for you!"
        />

        {/* How It Works */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">How It Works</Heading>
          <div className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-6 dark:from-zinc-800 dark:to-zinc-900">
            <p className="mb-4 text-zinc-700 dark:text-zinc-300">
              Our AI Tone Converter uses Claude Haiku 4.5 to adapt your text for different audiences and contexts:
            </p>
            <ul className="list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
              <li><strong>Professional:</strong> Perfect for business emails, reports, and formal communication</li>
              <li><strong>Casual:</strong> Great for social media, blogs, and friendly messages</li>
              <li><strong>Friendly:</strong> Warm and approachable for customer service and personal emails</li>
              <li><strong>Formal:</strong> Academic and sophisticated for research papers and official documents</li>
              <li><strong>Confident:</strong> Assertive and strong for leadership communication and presentations</li>
              <li><strong>Empathetic:</strong> Understanding and compassionate for sensitive situations</li>
            </ul>
          </div>
        </div>

        {/* Related Tools - AI Powered & Basic Tools */}
        <RelatedTools currentPath="/ai-tone-converter" />

        {/* Examples */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Tone Conversion Examples</Heading>
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">Original Text:</h3>
              <p className="mb-4 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "Hey, can you send me that report when you get a chance?"
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-blue-600 dark:text-blue-400">💼 Professional:</h4>
                  <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                    "Could you please send me the report at your earliest convenience?"
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-purple-600 dark:text-purple-400">🎩 Formal:</h4>
                  <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                    "I would appreciate it if you could forward the report when time permits."
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-green-600 dark:text-green-400">🤝 Friendly:</h4>
                  <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                    "Hi! Would you mind sending me that report when you have a moment? Thanks!"
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">Original Text:</h3>
              <p className="mb-4 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "I think we should consider a different approach to this problem."
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-orange-600 dark:text-orange-400">💪 Confident:</h4>
                  <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                    "We need to take a different approach to solve this problem effectively."
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-red-600 dark:text-red-400">❤️ Empathetic:</h4>
                  <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                    "I understand this is challenging, and I believe exploring a different approach might help us find a better solution together."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Perfect For</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📧 Email Adaptation</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Adjust email tone for different recipients
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">💬 Customer Service</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Match tone to customer situations
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📱 Social Media</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Adapt content for different platforms
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📝 Marketing Copy</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Test different tones for campaigns
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">🎓 Academic Writing</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Make research more formal or accessible
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">💼 Business Communication</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Professional tone for all situations
              </p>
            </div>
          </div>
        </div>

        {/* FAQ - Always Expanded for SEO */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Does it change the meaning of my text?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                No! The AI preserves your core message and meaning. It only adjusts the tone, word choice, and style to match your selected tone.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Can I convert the same text to multiple tones?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! Simply select a different tone and click "Convert Tone" again. You can try all 6 tones to see which works best for your needs.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">How long does the conversion take?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Thanks to Claude Haiku 4.5, conversions are lightning-fast - typically 1-3 seconds regardless of text length (up to 10,000 characters).
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>

      <ToastContainer toasts={toasts} />
    </>
  )
}
