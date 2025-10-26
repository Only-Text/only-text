'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { AITransformTemplate } from '@/components/tool-templates'
import { useToast, ToastContainer } from '@/components/toast'
import { Heading } from '@/components/heading'

export default function AISummarizerPage() {
  const [selectedLength, setSelectedLength] = useState('medium')
  const { toasts, showToast } = useToast()

  const lengths = [
    { id: 'short', name: 'Short', emoji: '📄', description: '1-2 sentences' },
    { id: 'medium', name: 'Medium', emoji: '📃', description: '3-5 sentences' },
    { id: 'long', name: 'Long', emoji: '📋', description: '1-2 paragraphs' },
  ]

  const handleSummarize = async (text) => {
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, length: selectedLength })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to summarize text')
    }

    return data.summary
  }

  const lengthSelector = (
    <div>
      <label className="mb-3 block text-sm font-medium">Summary Length</label>
      <div className="grid gap-3 sm:grid-cols-3">
        {lengths.map((length) => (
          <button
            key={length.id}
            onClick={() => setSelectedLength(length.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedLength === length.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                : 'border-zinc-200 hover:border-purple-300 dark:border-zinc-700'
            }`}
          >
            <div className="mb-2 text-2xl">{length.emoji}</div>
            <div className="font-semibold">{length.name}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{length.description}</div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <ToolLayout
        title="AI Summarizer - Summarize Long Text Instantly"
        description="Use AI to summarize long articles and documents. Choose your preferred summary length. Powered by Claude Haiku 4.5 for accurate, concise summaries."
        currentPath="/ai-summarizer"
      >
        {/* Main Tool Interface */}
        <AITransformTemplate
          title="AI Summarizer"
          placeholder="Paste your long text here to summarize it... (up to 50,000 characters)"
          actionLabel="Summarize"
          onTransform={handleSummarize}
          showToast={showToast}
          loadingText="Summarizing your text..."
          options={lengthSelector}
          demoText="Artificial intelligence has revolutionized many industries in recent years. From healthcare to finance, AI systems are being deployed to automate tasks, analyze data, and make predictions. Machine learning algorithms can now recognize patterns in vast datasets that would be impossible for humans to process manually. Natural language processing enables computers to understand and generate human language, powering applications like chatbots and translation services. Computer vision allows machines to interpret visual information, enabling self-driving cars and facial recognition systems. As AI technology continues to advance, it raises important questions about ethics, privacy, and the future of work. While AI offers tremendous potential benefits, it also presents challenges that society must address thoughtfully and proactively."
        />

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

        {/* FAQ - Always Expanded for SEO */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">How long can the input text be?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                You can summarize up to 50,000 characters (approximately 10,000 words or 20 pages). This is much longer than most other summarizers!
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Does it work for technical content?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! Claude Haiku 4.5 understands technical content, academic papers, and specialized topics. It preserves important technical details while creating concise summaries.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Can I adjust the summary length after generating it?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! Simply select a different length (short, medium, or long) and click "Summarize" again. The AI will create a new summary at your chosen length.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">Is the summary accurate?</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Yes! Our AI is trained to capture key points accurately without adding information or changing meaning. It identifies the most important ideas and presents them clearly.
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>

      <ToastContainer toasts={toasts} />
    </>
  )
}
