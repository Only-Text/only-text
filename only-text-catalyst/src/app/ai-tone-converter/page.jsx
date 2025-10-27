'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { AITransformTemplate } from '@/components/tool-templates'
import { useToast, ToastContainer } from '@/components/toast'
import { Heading } from '@/components/heading'
import { Text } from '@/components/text'
import { Badge } from '@/components/badge'
import { RelatedTools } from '@/components/related-tools'
import { CheckCircleIcon, SparklesIcon, BoltIcon, ShieldCheckIcon, DocumentTextIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, UserGroupIcon, PencilSquareIcon, LanguageIcon } from '@heroicons/react/20/solid'

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

        {/* Introduction Hero with Gradient */}
        <div className="relative isolate mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 px-6 py-16 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center gap-3">
              <Badge color="orange">Free AI</Badge>
              <Badge color="red">6 Tones</Badge>
              <Badge color="pink">Save Time</Badge>
            </div>
            
            <Heading level={2} className="mb-6 text-3xl font-bold">
              Introduction to AI Tone Conversion
            </Heading>
            
            <Text className="mb-6 text-lg text-zinc-700 dark:text-zinc-300">
              Discover the power of AI tone conversion for effortless text transformation - rewriting paragraphs and articles with ease. AI tone converters can be used in different contexts, such as academic, business, or creative writing, to adjust tone accordingly. Learn how to adjust the tone of your writing to suit various purposes, from formal to informal, and persuasive language.
            </Text>
            
            <Text className="mb-8 text-lg text-zinc-700 dark:text-zinc-300">
              Users can ensure their writing matches their intended tone for each context. Explore the benefits of using AI tone converters for content creation, including saving time and enhancing readability. Transform your message for different target audiences with just one click.
            </Text>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <SparklesIcon className="h-6 w-6 flex-none text-orange-600 dark:text-orange-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">AI Powered</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">6 tones available</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <BoltIcon className="h-6 w-6 flex-none text-red-600 dark:text-red-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Instant Results</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">1-3 seconds</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <PencilSquareIcon className="h-6 w-6 flex-none text-pink-600 dark:text-pink-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Rewrite Text</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Own words</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/80 p-4 dark:bg-zinc-800/80">
                <CheckCircleIcon className="h-6 w-6 flex-none text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">Error Free</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">High quality</div>
                </div>
              </div>
            </div>
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

        {/* Benefits Section */}
        <div className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} className="mb-4 text-3xl font-bold">Benefits of AI Tone Converters</Heading>
            <Text className="mb-10 text-lg text-zinc-600 dark:text-zinc-400">
              AI tone converters can help users save time by automating the process of rewriting paragraphs and articles. They enhance clarity and readability of text, making it more engaging for readers. Adjust the tone of your messages for various purposes and target audiences.
            </Text>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-red-50 p-6 transition-all hover:shadow-lg dark:from-orange-900/20 dark:to-red-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-orange-100 p-3 dark:bg-orange-900/50">
                <BoltIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Save Time</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Automate the process of rewriting paragraphs and articles. Transform your text with just one click instead of manually rewriting for different audiences.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-pink-50 p-6 transition-all hover:shadow-lg dark:from-red-900/20 dark:to-pink-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-red-100 p-3 dark:bg-red-900/50">
                <DocumentTextIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Enhance Readability</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Improve clarity and readability of text, making it more engaging for readers. Adjust tone to match your intended message and audience.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 p-6 transition-all hover:shadow-lg dark:from-pink-900/20 dark:to-purple-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-pink-100 p-3 dark:bg-pink-900/50">
                <UserGroupIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Multiple Audiences</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Create content optimized for various platforms, including social media posts and research papers. Maintain consistent voice across different contexts.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 p-6 transition-all hover:shadow-lg dark:from-purple-900/20 dark:to-indigo-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3 dark:bg-purple-900/50">
                <PencilSquareIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Rephrase Text</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Rephrase sentences and paragraphs in your own words. Create rewritten text that sounds natural and engaging while preserving meaning.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 p-6 transition-all hover:shadow-lg dark:from-indigo-900/20 dark:to-blue-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/50">
                <AcademicCapIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Academic & Business</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Perfect for academic papers, business documents, and professional writing. Adjust tone for formal, informal, or persuasive language.
              </Text>
            </div>
            
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 transition-all hover:shadow-lg dark:from-blue-900/20 dark:to-cyan-900/20">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50">
                <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">Error Free Writing</h3>
              <Text className="text-zinc-600 dark:text-zinc-400">
                Ensure error-free writing with grammar and readability improvements. Create professional content that engages your target audience effectively.
              </Text>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-16">
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
