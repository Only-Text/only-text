'use client'

import { useState } from 'react'
import { Button } from '@/components/button'
import { Textarea } from '@/components/textarea'
import { Heading } from '@/components/heading'
import { ToolLayout } from '@/components/tool-layout'

export default function CaseConverterPage() {
  const [text, setText] = useState('')

  const convertCase = (type) => {
    let converted = text
    
    switch (type) {
      case 'upper':
        converted = text.toUpperCase()
        break
      case 'lower':
        converted = text.toLowerCase()
        break
      case 'title':
        converted = text.replace(/\w\S*/g, (txt) => {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        })
        break
      case 'sentence':
        converted = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
        break
      case 'capitalize':
        converted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
        break
      case 'alternating':
        converted = text.split('').map((char, i) => 
          i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        ).join('')
        break
      case 'inverse':
        converted = text.split('').map(char => 
          char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        ).join('')
        break
    }
    
    setText(converted)
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
    } catch (err) {
      alert('Failed to read clipboard')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Text copied!')
    } catch (err) {
      alert('Failed to copy text')
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
      description: 'Count words and characters'
    },
    {
      name: 'Remove Emojis',
      href: '/remove-emojis',
      icon: '😀',
      description: 'Remove all emojis from text'
    },
    {
      name: 'All Tools',
      href: '/',
      icon: '🛠️',
      description: 'View all text tools'
    }
  ]

  return (
    <ToolLayout
      title="Case Converter - Change Text Case Online"
      description="Free online case converter tool. Convert text to uppercase, lowercase, title case, sentence case, and more instantly."
      relatedTools={relatedTools}
    >
      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button onClick={handlePaste}>Paste Text</Button>
        <Button onClick={handleCopy} outline>Copy Result</Button>
        <Button onClick={handleClear} color="red">Clear</Button>
      </div>

      {/* Text Area */}
      <div className="mb-6">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text here to convert case..."
          rows={12}
          className="font-mono"
        />
      </div>

      {/* Conversion Buttons */}
      <div className="mb-8">
        <Heading level={2} className="mb-4">Convert To:</Heading>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button onClick={() => convertCase('upper')} className="justify-start">
            <span className="text-left">
              <div className="font-semibold">UPPERCASE</div>
              <div className="text-xs opacity-70">ALL CAPS</div>
            </span>
          </Button>
          <Button onClick={() => convertCase('lower')} className="justify-start">
            <span className="text-left">
              <div className="font-semibold">lowercase</div>
              <div className="text-xs opacity-70">all lowercase</div>
            </span>
          </Button>
          <Button onClick={() => convertCase('title')} className="justify-start">
            <span className="text-left">
              <div className="font-semibold">Title Case</div>
              <div className="text-xs opacity-70">Capitalize Each Word</div>
            </span>
          </Button>
          <Button onClick={() => convertCase('sentence')} className="justify-start">
            <span className="text-left">
              <div className="font-semibold">Sentence case</div>
              <div className="text-xs opacity-70">First letter capital</div>
            </span>
          </Button>
          <Button onClick={() => convertCase('capitalize')} className="justify-start">
            <span className="text-left">
              <div className="font-semibold">Capitalized</div>
              <div className="text-xs opacity-70">First Letter Only</div>
            </span>
          </Button>
          <Button onClick={() => convertCase('alternating')} className="justify-start">
            <span className="text-left">
              <div className="font-semibold">aLtErNaTiNg</div>
              <div className="text-xs opacity-70">Alternating Case</div>
            </span>
          </Button>
          <Button onClick={() => convertCase('inverse')} className="justify-start">
            <span className="text-left">
              <div className="font-semibold">InVeRsE</div>
              <div className="text-xs opacity-70">Swap Case</div>
            </span>
          </Button>
        </div>
      </div>

      {/* Examples */}
      <div className="mt-12">
        <Heading level={2} className="mb-4">Case Conversion Examples</Heading>
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="mb-3 font-semibold">Original Text:</div>
            <div className="mb-4 rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
              the quick brown fox jumps over the lazy dog
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-medium text-zinc-500">UPPERCASE:</div>
                <div className="rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
                  THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-zinc-500">Title Case:</div>
                <div className="rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
                  The Quick Brown Fox Jumps Over The Lazy Dog
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-zinc-500">Sentence case:</div>
                <div className="rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-zinc-500">aLtErNaTiNg:</div>
                <div className="rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
                  tHe qUiCk bRoWn fOx jUmPs oVeR tHe lAzY dOg
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <Heading level={2} className="mb-4">Frequently Asked Questions</Heading>
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">What is title case?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Title case capitalizes the first letter of each word. It's commonly used for titles, headings, and headlines.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">What's the difference between sentence case and capitalize?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sentence case capitalizes the first letter after each period, while capitalize only capitalizes the very first letter of the entire text.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Does this work with special characters?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Yes! The case converter works with all Unicode characters that have uppercase and lowercase variants.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Is my text saved?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No, all conversions happen in your browser. Your text is never sent to our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="mt-12">
        <Heading level={2} className="mb-4">Common Use Cases</Heading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">📰 Headlines</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Convert article titles to proper title case for professional appearance.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">📧 Email Formatting</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Fix accidentally typed text in all caps or lowercase.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">💼 Professional Documents</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Ensure consistent capitalization in business documents.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">📱 Social Media</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Format posts and captions with proper capitalization.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">🎨 Creative Writing</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Experiment with different text styles for creative projects.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">💻 Code Comments</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Format code comments and documentation consistently.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
