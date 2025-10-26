'use client'

import { ToolLayout } from '@/components/tool-layout'
import { AITransformTemplate } from '@/components/tool-templates'
import { useToast, ToastContainer } from '@/components/toast'
import { Heading } from '@/components/heading'

export default function AIGrammarCheckerPage() {
  const { toasts, showToast } = useToast()

  const handleCheck = async (text) => {
    const response = await fetch('/api/ai/grammar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to check grammar')
    }

    return data.corrected
  }

  return (
    <>
      <ToolLayout
        title="AI Grammar Checker - Fix Grammar & Spelling Instantly"
        description="Use AI to find and fix grammar, spelling, and punctuation errors. Powered by Claude Haiku 4.5 for accurate, lightning-fast corrections."
        currentPath="/ai-grammar-checker"
      >
        {/* Main Tool Interface */}
        <AITransformTemplate
          title="AI Grammar Checker"
          placeholder="Paste your text here to check for grammar and spelling errors..."
          actionLabel="Check Grammar"
          onTransform={handleCheck}
          showToast={showToast}
          loadingText="Checking grammar..."
          demoText="Their going too the store tommorow to by some grocerys. Its important that they dont forget there shopping list."
        />

        {/* How It Works */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">How It Works</Heading>
          <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:from-zinc-800 dark:to-zinc-900">
            <p className="mb-4 text-zinc-700 dark:text-zinc-300">
              Our AI Grammar Checker uses Claude Haiku 4.5 to detect and fix all types of errors:
            </p>
            <ul className="list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
              <li><strong>Grammar:</strong> Subject-verb agreement, tense consistency, sentence structure</li>
              <li><strong>Spelling:</strong> Typos, commonly confused words, proper nouns</li>
              <li><strong>Punctuation:</strong> Commas, periods, apostrophes, quotation marks</li>
              <li><strong>Capitalization:</strong> Proper nouns, sentence starts, titles</li>
              <li><strong>Word Choice:</strong> Better alternatives for unclear words</li>
            </ul>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Before & After Examples</Heading>
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold text-red-600 dark:text-red-400">❌ Before (With Errors)</h3>
              <p className="mb-4 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "Their going to the store to buy some grocerys. Its important that they dont forget the milk."
              </p>
              <h3 className="mb-2 font-semibold text-green-600 dark:text-green-400">✅ After (Corrected)</h3>
              <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "They're going to the store to buy some groceries. It's important that they don't forget the milk."
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold text-red-600 dark:text-red-400">❌ Before (With Errors)</h3>
              <p className="mb-4 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "The team have completed there work and is ready for the presentation"
              </p>
              <h3 className="mb-2 font-semibold text-green-600 dark:text-green-400">✅ After (Corrected)</h3>
              <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                "The team has completed their work and is ready for the presentation."
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
                Ensure professional emails are error-free
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📄 Documents</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Proofread reports and documents
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">🎓 Academic</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Check essays and research papers
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">💬 Social Media</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Polish posts and comments
              </p>
            </div>
          </div>
        </div>

        {/* FAQ - Always Expanded for SEO */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">How accurate is the AI grammar checker?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Our AI uses Claude Haiku 4.5, which has near-frontier intelligence. It catches 99%+ of grammar, spelling, and punctuation errors - more accurate than most traditional grammar checkers.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Does it work for academic writing?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! The AI understands formal academic writing and will maintain the appropriate tone while fixing errors. Perfect for essays, research papers, and dissertations.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Is my text data safe?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Absolutely! Your text is processed securely and never stored. We use enterprise-grade encryption and don't use your data for AI training.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Can it check multiple languages?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Currently optimized for English. We're working on adding support for more languages in future updates.
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>

      <ToastContainer toasts={toasts} />
    </>
  )
}
