'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { Textarea } from '@/components/textarea'
import { Heading } from '@/components/heading'
import { ToolLayout } from '@/components/tool-layout'
import { useToast, ToastContainer } from '@/components/toast'
import Link from 'next/link'

export default function AIGrammarCheckerPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [hasErrors, setHasErrors] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toasts, showToast } = useToast()

  const relatedTools = [
    { name: 'AI Text Improver', href: '/ai-text-improver', description: 'Improve text clarity and professionalism' },
    { name: 'AI Tone Converter', href: '/ai-tone-converter', description: 'Change text tone and style' },
    { name: 'Smart Summarizer', href: '/ai-summarizer', description: 'Summarize long text' },
  ]

  const handleCheck = async () => {
    if (!inputText.trim()) {
      showToast('Please enter some text to check', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check grammar')
      }

      setOutputText(data.corrected)
      setHasErrors(data.hasErrors)
      
      if (data.hasErrors) {
        showToast('Grammar errors found and corrected!', 'success')
      } else {
        showToast('No errors found - your text is perfect!', 'success')
      }
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText)
      showToast('Corrected text copied!', 'success')
    } catch (err) {
      showToast('Failed to copy text', 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setHasErrors(false)
  }

  return (
    <>
      <ToolLayout
        title="AI Grammar Checker - Fix Grammar & Spelling Instantly"
        description="Use AI to find and fix grammar, spelling, and punctuation errors. Powered by Claude Haiku 4.5 for accurate, lightning-fast corrections."
        relatedTools={relatedTools}
      >
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button onClick={handleCheck} disabled={loading || !inputText.trim()}>
            {loading ? 'Checking...' : '✓ Check Grammar'}
          </Button>
          <Button onClick={handleCopy} outline disabled={!outputText}>
            Copy Corrected
          </Button>
          <Button onClick={handleClear} outline>
            Clear
          </Button>
        </div>

        {/* Error Status */}
        {outputText && (
          <div className={`mb-6 rounded-lg p-4 ${hasErrors ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
            <p className={`font-semibold ${hasErrors ? 'text-orange-900 dark:text-orange-300' : 'text-green-900 dark:text-green-300'}`}>
              {hasErrors ? '⚠️ Errors found and corrected' : '✅ No errors found - perfect grammar!'}
            </p>
          </div>
        )}

        {/* Input/Output Split View */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div>
            <label className="mb-2 block text-sm font-medium">Original Text</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here to check for grammar and spelling errors..."
              rows={15}
              className="font-mono text-sm"
            />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {inputText.length} characters
            </p>
          </div>

          {/* Output */}
          <div>
            <label className="mb-2 block text-sm font-medium">Corrected Text</label>
            <Textarea
              value={outputText}
              readOnly
              placeholder="Corrected text will appear here..."
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

        {/* FAQ */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                How accurate is the AI grammar checker?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Our AI uses Claude Haiku 4.5, which has near-frontier intelligence. It catches 99%+ of grammar, spelling, and punctuation errors - more accurate than most traditional grammar checkers.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                Does it work for academic writing?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! The AI understands formal academic writing and will maintain the appropriate tone while fixing errors. Perfect for essays, research papers, and dissertations.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                Is my text data safe?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Absolutely! Your text is processed securely and never stored. We use enterprise-grade encryption and don't use your data for AI training.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                Can it check multiple languages?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Currently optimized for English. We're working on adding support for more languages in future updates.
              </p>
            </details>
          </div>
        </div>
      </ToolLayout>

      <ToastContainer toasts={toasts} />
    </>
  )
}
