'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/button'
import { Textarea } from '@/components/textarea'
import { Heading } from '@/components/heading'
import { ToolLayout } from '@/components/tool-layout'
import { SoftwareApplicationSchema, FAQSchema, BreadcrumbSchema } from '@/components/structured-data'

export default function RemoveBulletPointsPage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [stats, setStats] = useState({ removed: 0, lines: 0 })

  useEffect(() => {
    processText(inputText)
  }, [inputText])

  const processText = (text) => {
    const lines = text.split('\n')
    let removedCount = 0
    
    const processedLines = lines.map(line => {
      const trimmed = line.trim()
      // Check if line starts with bullet point
      if (/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s+/.test(trimmed)) {
        removedCount++
        // Remove bullet point and any following whitespace
        return trimmed.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s+/, '')
      }
      return trimmed
    })
    
    const processed = processedLines.join('\n')
    setOutputText(processed)
    setStats({
      removed: removedCount,
      lines: processedLines.filter(l => l.length > 0).length
    })
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
    } catch (err) {
      alert('Failed to read clipboard')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText)
      alert('Text copied!')
    } catch (err) {
      alert('Failed to copy text')
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
  }

  const relatedTools = [
    {
      name: 'Remove Emojis',
      href: '/remove-emojis',
      icon: '😀',
      description: 'Remove all emojis from text'
    },
    {
      name: 'Word Counter',
      href: '/word-counter',
      icon: '📊',
      description: 'Count words and characters'
    },
    {
      name: 'Case Converter',
      href: '/case-converter',
      icon: 'Aa',
      description: 'Convert text case'
    },
    {
      name: 'All Tools',
      href: '/',
      icon: '🛠️',
      description: 'View all tools'
    }
  ]

  const faqQuestions = [
    {
      question: 'What types of bullet points does this remove?',
      answer: 'This tool removes all common bullet point types including •, -, *, +, numbers with periods (1., 2., etc.), and various Unicode bullet symbols.'
    },
    {
      question: 'Will this preserve my text formatting?',
      answer: 'Yes! The tool only removes the bullet points and list markers at the beginning of lines. All other text formatting and line breaks are preserved.'
    },
    {
      question: 'Can I use this for numbered lists?',
      answer: 'Absolutely! The tool removes both bulleted lists and numbered lists (1., 2., 3., etc.).'
    }
  ]

  return (
    <>
      <SoftwareApplicationSchema
        name="Remove Bullet Points from Text"
        description="Free online tool to remove bullet points and list markers from text instantly."
        url="https://only-text.com/remove-bullet-points"
      />
      <FAQSchema questions={faqQuestions} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://only-text.com' },
          { name: 'Remove Bullet Points', url: 'https://only-text.com/remove-bullet-points' }
        ]}
      />
      
      <ToolLayout
        title="Remove Bullet Points from Text"
        description="Instantly remove bullet points, dashes, and list markers from your text. Perfect for converting lists to plain text."
        relatedTools={relatedTools}
      >
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button onClick={handlePaste}>Paste Text</Button>
          <Button onClick={handleCopy} outline>Copy Result</Button>
          <Button onClick={handleClear} color="red">Clear All</Button>
        </div>

        {/* Text Areas */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Input Text (with bullet points)
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="• Item 1&#10;• Item 2&#10;• Item 3"
              rows={12}
              className="font-mono"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Output Text (bullets removed)
            </label>
            <Textarea
              value={outputText}
              readOnly
              placeholder="Clean text will appear here..."
              rows={12}
              className="font-mono bg-zinc-50 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
          <div className="text-center">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Bullets Removed</div>
            <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{stats.removed}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Lines Processed</div>
            <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.lines}</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">How It Works</Heading>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <ol className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                <span>Paste or type your text with bullet points in the input box</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                <span>The tool automatically detects and removes all bullet point markers</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                <span>Clean text appears instantly in the output box</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                <span>Copy the result or continue editing</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">Examples</Heading>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Input:</div>
              <div className="mb-4 rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
                • First item<br />
                • Second item<br />
                • Third item
              </div>
              <div className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Output:</div>
              <div className="rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
                First item<br />
                Second item<br />
                Third item
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Input (numbered list):</div>
              <div className="mb-4 rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
                1. Introduction<br />
                2. Main content<br />
                3. Conclusion
              </div>
              <div className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Output:</div>
              <div className="rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
                Introduction<br />
                Main content<br />
                Conclusion
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">What types of bullet points does this remove?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This tool removes all common bullet point types including •, -, *, +, numbers with periods (1., 2., etc.), 
                and various Unicode bullet symbols like ◦, ○, ●, ■, □, ▪, ▫.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">Will this preserve my text formatting?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Yes! The tool only removes the bullet points and list markers at the beginning of lines. 
                All other text formatting and line breaks are preserved.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">Can I use this for numbered lists?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Absolutely! The tool removes both bulleted lists and numbered lists (1., 2., 3., etc.).
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">Is my data safe?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Yes! All processing happens in your browser. We never send your text to any server.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">Can I remove bullets from multiple paragraphs at once?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Yes! Paste any amount of text and the tool will process all lines simultaneously.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">Common Use Cases</Heading>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📄 Document Conversion</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Convert bulleted lists to plain text for reports or documents that don't support formatting.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📧 Email Formatting</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Clean up lists from emails before pasting into plain text systems.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">💾 Data Processing</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Prepare list data for CSV files or database imports.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">🤖 AI Content Cleaning</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Remove bullet points from AI-generated lists for cleaner output.
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  )
}
