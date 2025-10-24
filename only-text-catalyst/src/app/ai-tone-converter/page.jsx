'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { Textarea } from '@/components/textarea'
import { Heading } from '@/components/heading'
import { ToolLayout } from '@/components/tool-layout'
import { useToast, ToastContainer } from '@/components/toast'
import Link from 'next/link'

export default function AIToneConverterPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [selectedTone, setSelectedTone] = useState('professional')
  const [loading, setLoading] = useState(false)
  const { toasts, showToast } = useToast()

  const tones = [
    { id: 'professional', name: 'Professional', emoji: '💼', description: 'Business-appropriate and formal' },
    { id: 'casual', name: 'Casual', emoji: '😊', description: 'Relaxed and conversational' },
    { id: 'friendly', name: 'Friendly', emoji: '🤝', description: 'Warm and approachable' },
    { id: 'formal', name: 'Formal', emoji: '🎩', description: 'Academic and sophisticated' },
    { id: 'confident', name: 'Confident', emoji: '💪', description: 'Assertive and strong' },
    { id: 'empathetic', name: 'Empathetic', emoji: '❤️', description: 'Understanding and compassionate' },
  ]

  const relatedTools = [
    { name: 'AI Text Improver', href: '/ai-text-improver', description: 'Improve text clarity and professionalism' },
    { name: 'AI Grammar Checker', href: '/ai-grammar-checker', description: 'Fix grammar and spelling errors' },
    { name: 'Smart Summarizer', href: '/ai-summarizer', description: 'Summarize long text' },
  ]

  const handleConvert = async () => {
    if (!inputText.trim()) {
      showToast('Please enter some text to convert', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, tone: selectedTone })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert tone')
      }

      setOutputText(data.converted)
      showToast(`Converted to ${selectedTone} tone!`, 'success')
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText)
      showToast('Converted text copied!', 'success')
    } catch (err) {
      showToast('Failed to copy text', 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
  }

  return (
    <>
      <ToolLayout
        title="AI Tone Converter - Change Text Tone & Style"
        description="Use AI to convert text between different tones and styles. Professional, casual, friendly, formal, and more. Powered by Claude Haiku 4.5."
        relatedTools={relatedTools}
      >
        {/* Tone Selection */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium">Select Tone</label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tones.map((tone) => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedTone === tone.id
                    ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-zinc-200 bg-white hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-500'
                }`}
              >
                <div className="mb-2 text-2xl">{tone.emoji}</div>
                <div className="font-semibold">{tone.name}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{tone.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button onClick={handleConvert} disabled={loading || !inputText.trim()}>
            {loading ? 'Converting...' : '🎭 Convert Tone'}
          </Button>
          <Button onClick={handleCopy} outline disabled={!outputText}>
            Copy Converted
          </Button>
          <Button onClick={handleClear} outline>
            Clear
          </Button>
        </div>

        {/* Input/Output Split View */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div>
            <label className="mb-2 block text-sm font-medium">Original Text</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here to convert its tone..."
              rows={15}
              className="font-mono text-sm"
            />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {inputText.length} characters
            </p>
          </div>

          {/* Output */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Converted Text ({tones.find(t => t.id === selectedTone)?.name})
            </label>
            <Textarea
              value={outputText}
              readOnly
              placeholder="Converted text will appear here..."
              rows={15}
              className="font-mono text-sm bg-zinc-50 dark:bg-zinc-900"
            />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {outputText.length} characters
            </p>
          </div>
        </div>

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

        {/* FAQ */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                Does it change the meaning of my text?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                No! The AI preserves your core message and meaning. It only adjusts the tone, word choice, and style to match your selected tone.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                Can I convert the same text to multiple tones?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! Simply select a different tone and click "Convert Tone" again. You can try all 6 tones to see which works best for your needs.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                How long does the conversion take?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Thanks to Claude Haiku 4.5, conversions are lightning-fast - typically 1-3 seconds regardless of text length (up to 10,000 characters).
              </p>
            </details>
          </div>
        </div>
      </ToolLayout>

      <ToastContainer toasts={toasts} />
    </>
  )
}
