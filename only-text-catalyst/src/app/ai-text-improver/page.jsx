'use client'

import { ToolLayout } from '@/components/tool-layout'
import { AITransformTemplate } from '@/components/tool-templates'
import { useToast, ToastContainer } from '@/components/toast'
import { Heading } from '@/components/heading'

export default function AITextImproverPage() {
  const { toasts, showToast } = useToast()

  const handleImprove = async (text) => {
    const response = await fetch('/api/ai/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to improve text')
    }

    return data.improved
  }

  return (
    <>
      <ToolLayout
        title="AI Text Improver - Make Your Text Better"
        description="Use AI to improve your text clarity, professionalism, and readability. Powered by Claude Haiku 4.5 for lightning-fast results."
        currentPath="/ai-text-improver"
      >
        {/* Main Tool Interface */}
        <AITransformTemplate
          title="AI Text Improver"
          placeholder="Paste your text here to improve it..."
          actionLabel="Improve Text"
          onTransform={handleImprove}
          showToast={showToast}
          loadingText="Improving your text..."
          demoText="i think that we should maybe consider doing the project differently because the current way isnt working good"
        />

        {/* How It Works */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">How It Works</Heading>
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-6 dark:from-zinc-800 dark:to-zinc-900">
            <p className="mb-4 text-zinc-700 dark:text-zinc-300">
              Our AI Text Improver uses Claude Haiku 4.5, one of the fastest and most intelligent AI models, to enhance your text:
            </p>
            <ul className="list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
              <li><strong>Clarity:</strong> Makes your message clearer and easier to understand</li>
              <li><strong>Grammar:</strong> Fixes grammar and punctuation errors</li>
              <li><strong>Flow:</strong> Improves sentence structure and readability</li>
              <li><strong>Professionalism:</strong> Enhances tone while keeping your voice</li>
              <li><strong>Speed:</strong> 2x faster than other AI models</li>
            </ul>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Before & After Examples</Heading>
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold text-red-600 dark:text-red-400">❌ Before</h3>
              <p className="mb-4 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "i think that we should maybe consider doing the project differently because the current way isnt working good"
              </p>
              <h3 className="mb-2 font-semibold text-green-600 dark:text-green-400">✅ After</h3>
              <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "I believe we should reconsider our approach to this project, as the current method isn't yielding optimal results."
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold text-red-600 dark:text-red-400">❌ Before</h3>
              <p className="mb-4 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "Thanks for your email I will get back to you soon about this"
              </p>
              <h3 className="mb-2 font-semibold text-green-600 dark:text-green-400">✅ After</h3>
              <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "Thank you for your email. I will respond to your inquiry shortly."
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Perfect For</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📧 Emails</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Make professional emails clear and polished
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📝 Reports</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Enhance business reports and documents
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">💬 Messages</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Improve clarity in chat and messages
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📄 Content</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Polish blog posts and articles
              </p>
            </div>
          </div>
        </div>

        {/* FAQ - Always Expanded for SEO */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Is my text data safe?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! Your text is processed securely through our API and is not stored or used for training. We use enterprise-grade encryption.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">How fast is the AI processing?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                We use Claude Haiku 4.5, which is 2x faster than other AI models. Most texts are improved in 1-3 seconds.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Will it change the meaning of my text?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                No! The AI preserves your original meaning and message. It only improves clarity, grammar, and flow.
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>

      <ToastContainer toasts={toasts} />
    </>
  )
}
