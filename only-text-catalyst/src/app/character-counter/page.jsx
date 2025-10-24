'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/button'
import { Textarea } from '@/components/textarea'
import { Heading } from '@/components/heading'
import { ToolLayout } from '@/components/tool-layout'
import { SoftwareApplicationSchema, FAQSchema, BreadcrumbSchema } from '@/components/structured-data'

export default function CharacterCounterPage() {
  const [text, setText] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    noSpaces: 0,
    letters: 0,
    digits: 0,
    punctuation: 0,
    whitespace: 0,
    special: 0,
    uppercase: 0,
    lowercase: 0,
  })

  useEffect(() => {
    calculateStats(text)
  }, [text])

  const calculateStats = (inputText) => {
    const total = inputText.length
    const noSpaces = inputText.replace(/\s/g, '').length
    
    let letters = 0
    let digits = 0
    let punctuation = 0
    let whitespace = 0
    let special = 0
    let uppercase = 0
    let lowercase = 0
    
    for (const char of inputText) {
      if (/[a-zA-Z]/.test(char)) {
        letters++
        if (char === char.toUpperCase()) uppercase++
        if (char === char.toLowerCase()) lowercase++
      } else if (/\d/.test(char)) {
        digits++
      } else if (/[.,!?;:'"()[\]{}]/.test(char)) {
        punctuation++
      } else if (/\s/.test(char)) {
        whitespace++
      } else {
        special++
      }
    }
    
    setStats({
      total,
      noSpaces,
      letters,
      digits,
      punctuation,
      whitespace,
      special,
      uppercase,
      lowercase,
    })
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
    } catch (err) {
      alert('Failed to read clipboard')
    }
  }

  const handleClear = () => {
    setText('')
  }

  const relatedTools = [
    {
      name: 'Word Counter',
      href: '/word-counter',
      icon: '📊',
      description: 'Count words with reading time'
    },
    {
      name: 'Remove Emojis',
      href: '/remove-emojis',
      icon: '😀',
      description: 'Remove all emojis'
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
      question: 'Does the character count include spaces?',
      answer: 'Yes, the total character count includes all characters including spaces. We also provide a separate count without spaces for your convenience.'
    },
    {
      question: 'What counts as a special character?',
      answer: 'Special characters include symbols like @, #, $, %, &, *, and other non-alphanumeric characters that aren\'t punctuation or whitespace.'
    },
    {
      question: 'Is this accurate for Unicode characters?',
      answer: 'Yes! Our character counter properly handles all Unicode characters including emojis, accented letters, and characters from non-Latin alphabets.'
    }
  ]

  return (
    <>
      <SoftwareApplicationSchema
        name="Character Counter"
        description="Free online character counter with detailed statistics. Count characters, letters, digits, and more."
        url="https://only-text.com/character-counter"
      />
      <FAQSchema questions={faqQuestions} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://only-text.com' },
          { name: 'Character Counter', url: 'https://only-text.com/character-counter' }
        ]}
      />
      
      <ToolLayout
        title="Character Counter - Count Characters with Detailed Statistics"
        description="Free online character counter. Count total characters, letters, digits, punctuation, and more with real-time updates."
        relatedTools={relatedTools}
      >
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button onClick={handlePaste}>Paste Text</Button>
          <Button onClick={handleClear} color="red">Clear</Button>
        </div>

        {/* Text Area */}
        <div className="mb-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here to count characters..."
            rows={15}
            className="font-mono"
          />
        </div>

        {/* Main Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Total Characters</div>
            <div className="mt-2 text-4xl font-bold">{stats.total}</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Without Spaces</div>
            <div className="mt-2 text-4xl font-bold">{stats.noSpaces}</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Letters</div>
            <div className="mt-2 text-4xl font-bold">{stats.letters}</div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Digits</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{stats.digits}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Punctuation</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{stats.punctuation}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Whitespace</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{stats.whitespace}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Special Characters</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{stats.special}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Uppercase</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{stats.uppercase}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Lowercase</div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{stats.lowercase}</div>
          </div>
        </div>

        {/* Character Breakdown Chart */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
          <Heading level={3} className="mb-4">Character Breakdown</Heading>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Letters</span>
                <span className="font-medium">{stats.total > 0 ? Math.round((stats.letters / stats.total) * 100) : 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div 
                  className="h-2 rounded-full bg-blue-500" 
                  style={{ width: `${stats.total > 0 ? (stats.letters / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Whitespace</span>
                <span className="font-medium">{stats.total > 0 ? Math.round((stats.whitespace / stats.total) * 100) : 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ width: `${stats.total > 0 ? (stats.whitespace / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Digits</span>
                <span className="font-medium">{stats.total > 0 ? Math.round((stats.digits / stats.total) * 100) : 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div 
                  className="h-2 rounded-full bg-purple-500" 
                  style={{ width: `${stats.total > 0 ? (stats.digits / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Punctuation</span>
                <span className="font-medium">{stats.total > 0 ? Math.round((stats.punctuation / stats.total) * 100) : 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div 
                  className="h-2 rounded-full bg-orange-500" 
                  style={{ width: `${stats.total > 0 ? (stats.punctuation / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">How to Use</Heading>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <ol className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                <span>Type or paste your text into the text area</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                <span>Character statistics update automatically as you type</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                <span>View detailed breakdown of character types</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                <span>Use the visual chart to see character distribution</span>
              </li>
            </ol>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">Does the character count include spaces?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Yes, the total character count includes all characters including spaces. We also provide a separate 
                count without spaces for your convenience.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">What counts as a special character?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Special characters include symbols like @, #, $, %, &, *, and other non-alphanumeric characters 
                that aren't punctuation or whitespace.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">Is this accurate for Unicode characters?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Yes! Our character counter properly handles all Unicode characters including emojis, accented letters, 
                and characters from non-Latin alphabets.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">Why do I need a character counter?</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Character counters are essential for social media posts (Twitter has a 280 character limit), 
                SMS messages, meta descriptions for SEO, and many other applications with character limits.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-12">
          <Heading level={2} className="mb-4">Common Use Cases</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📱 Social Media</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Stay within character limits for Twitter, LinkedIn, Instagram, and other platforms.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📧 SMS Messages</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Ensure your text messages fit within the 160-character SMS limit.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">🔍 SEO Meta Descriptions</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Keep meta descriptions within the recommended 155-160 character limit.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📝 Form Validation</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Check if your input meets form field character requirements.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">✍️ Writing Analysis</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Analyze character distribution in your writing for style consistency.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">💻 Programming</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Count characters in code snippets, strings, or data validation.
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  )
}
