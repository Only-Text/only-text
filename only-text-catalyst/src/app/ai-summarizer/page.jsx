'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { Textarea } from '@/components/textarea'
import { Heading } from '@/components/heading'
import { ToolLayout } from '@/components/tool-layout'
import { useToast, ToastContainer } from '@/components/toast'
import Link from 'next/link'

export default function AISummarizerPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [selectedLength, setSelectedLength] = useState('medium')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toasts, showToast } = useToast()

  const lengths = [
    { id: 'short', name: 'Short', emoji: '📄', description: '1-2 sentences' },
    { id: 'medium', name: 'Medium', emoji: '📃', description: '3-5 sentences' },
    { id: 'long', name: 'Long', emoji: '📋', description: '1-2 paragraphs' },
  ]

  const relatedTools = [
    { name: 'AI Text Improver', href: '/ai-text-improver', description: 'Improve text clarity and professionalism' },
    { name: 'AI Grammar Checker', href: '/ai-grammar-checker', description: 'Fix grammar and spelling errors' },
    { name: 'AI Tone Converter', href: '/ai-tone-converter', description: 'Change text tone and style' },
  ]

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      showToast('Please enter some text to summarize', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, length: selectedLength })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize text')
      }

      setOutputText(data.summary)
      setStats({
        originalLength: data.originalLength,
        summaryLength: data.summaryLength,
        compressionRatio: data.compressionRatio
      })
      showToast(`Summarized to ${selectedLength} length!`, 'success')
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText)
      showToast('Summary copied!', 'success')
    } catch (err) {
      showToast('Failed to copy text', 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setStats(null)
  }

  return (
    <>
      <ToolLayout
        title="AI Summarizer - Summarize Long Text Instantly"
        description="Use AI to summarize long articles, documents, and text into concise summaries. Powered by Claude Haiku 4.5 for accurate, intelligent summaries."
        relatedTools={relatedTools}
      >
        {/* Length Selection */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-medium">Summary Length</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {lengths.map((length) => (
              <button
                key={length.id}
                onClick={() => setSelectedLength(length.id)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedLength === length.id
                    ? 'border-cyan-600 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-900/20'
                    : 'border-zinc-200 bg-white hover:border-cyan-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-cyan-500'
                }`}
              >
                <div className="mb-2 text-2xl">{length.emoji}</div>
                <div className="font-semibold">{length.name}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{length.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button onClick={handleSummarize} disabled={loading || !inputText.trim()}>
            {loading ? 'Summarizing...' : '📝 Summarize'}
          </Button>
          <Button onClick={handleCopy} outline disabled={!outputText}>
            Copy Summary
          </Button>
          <Button onClick={handleClear} outline>
            Clear
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mb-6 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 p-6 dark:from-cyan-900/20 dark:to-blue-900/20">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Original Length</div>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {stats.originalLength.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">characters</div>
              </div>
              <div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Summary Length</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.summaryLength.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">characters</div>
              </div>
              <div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Compression</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.compressionRatio}%
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">reduction</div>
              </div>
            </div>
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
              placeholder="Paste your long text here to summarize it... (up to 50,000 characters)"
              rows={15}
              className="font-mono text-sm"
            />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {inputText.length.toLocaleString()} characters
            </p>
          </div>

          {/* Output */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Summary ({lengths.find(l => l.id === selectedLength)?.name})
            </label>
            <Textarea
              value={outputText}
              readOnly
              placeholder="Summary will appear here..."
              rows={15}
              className="font-mono text-sm bg-zinc-50 dark:bg-zinc-900"
            />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {outputText.length.toLocaleString()} characters
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">How It Works</Heading>
          <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 p-6 dark:from-zinc-800 dark:to-zinc-900">
            <p className="mb-4 text-zinc-700 dark:text-zinc-300">
              Our AI Summarizer uses Claude Haiku 4.5 to create intelligent summaries that capture the key points:
            </p>
            <ul className="list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
              <li><strong>Short:</strong> Ultra-concise 1-2 sentence summary for quick overviews</li>
              <li><strong>Medium:</strong> Balanced 3-5 sentence summary capturing main ideas</li>
              <li><strong>Long:</strong> Detailed 1-2 paragraph summary with context and nuance</li>
              <li><strong>Intelligent:</strong> Identifies key points, main arguments, and important details</li>
              <li><strong>Accurate:</strong> Preserves meaning and doesn't add information</li>
              <li><strong>Fast:</strong> Processes up to 50,000 characters in seconds</li>
            </ul>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Summarization Examples</Heading>
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-3 font-semibold text-zinc-900 dark:text-white">Original Text (500 words):</h3>
              <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
                "Artificial intelligence has transformed the way we interact with technology in the 21st century. 
                From virtual assistants to recommendation systems, AI is now embedded in countless aspects of our 
                daily lives. Machine learning algorithms analyze vast amounts of data to identify patterns and make 
                predictions, enabling applications that were once thought impossible..."
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-cyan-600 dark:text-cyan-400">📄 Short Summary:</h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    "AI has revolutionized technology through machine learning and is now integral to daily life, 
                    from virtual assistants to recommendation systems."
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-blue-600 dark:text-blue-400">📃 Medium Summary:</h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    "Artificial intelligence has fundamentally changed how we interact with technology in the 21st century. 
                    Machine learning algorithms process massive datasets to identify patterns and enable previously impossible 
                    applications. AI is now embedded in everyday tools like virtual assistants and recommendation systems, 
                    transforming multiple industries and aspects of daily life."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Perfect For</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📰 Articles</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Summarize long articles and news stories
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📚 Research Papers</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Extract key findings from academic papers
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📧 Email Threads</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Condense long email conversations
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📄 Documents</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Create executive summaries of reports
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📝 Meeting Notes</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Distill action items from long notes
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📖 Books</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get chapter summaries and overviews
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
                How long can the input text be?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                You can summarize up to 50,000 characters (approximately 10,000 words or 20 pages). This is much longer than most other summarizers!
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                Does it work for technical content?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! Claude Haiku 4.5 understands technical content, academic papers, and specialized topics. It preserves important technical details while creating concise summaries.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                Can I adjust the summary length after generating it?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! Simply select a different length (short, medium, or long) and click "Summarize" again. The AI will create a new summary at your chosen length.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold">
                Is the summary accurate?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! Our AI is trained to capture key points accurately without adding information or changing meaning. It identifies the most important ideas and presents them clearly.
              </p>
            </details>
          </div>
        </div>
      </ToolLayout>

      <ToastContainer toasts={toasts} />
    </>
  )
}
