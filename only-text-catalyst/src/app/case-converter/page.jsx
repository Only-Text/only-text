'use client'

import { ToolLayout } from '@/components/tool-layout'
import { MultiActionTemplate } from '@/components/tool-templates'
import { Heading } from '@/components/heading'

export default function CaseConverterPage() {
  const actions = [
    {
      id: 'upper',
      label: 'UPPERCASE',
      icon: '🅰',
      example: 'ABC',
      transform: (text) => text.toUpperCase()
    },
    {
      id: 'lower',
      label: 'lowercase',
      icon: '🔡',
      example: 'abc',
      transform: (text) => text.toLowerCase()
    },
    {
      id: 'title',
      label: 'Title Case',
      icon: '🆃',
      example: 'Title Case',
      transform: (text) => text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    },
    {
      id: 'sentence',
      label: 'Sentence case',
      icon: '📝',
      example: 'Sentence case',
      transform: (text) => text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
    },
    {
      id: 'capitalize',
      label: 'Capitalize',
      icon: '⬆️',
      example: 'Capitalize',
      transform: (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    },
    {
      id: 'alternating',
      label: 'aLtErNaTiNg',
      icon: '🔄',
      example: 'aLt',
      transform: (text) => text.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('')
    },
    {
      id: 'inverse',
      label: 'InVeRsE',
      icon: '🔃',
      example: 'InV',
      transform: (text) => text.split('').map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join('')
    }
  ]

  return (
    <ToolLayout
      title="Case Converter - Change Text Case Online"
      description="Free online case converter tool. Convert text to uppercase, lowercase, title case, sentence case, and more instantly."
      currentPath="/case-converter"
    >
      {/* Main Tool Interface */}
      <MultiActionTemplate
        title="Case Converter"
        placeholder="Type or paste your text here to convert case..."
        actions={actions}
        demoText="this is a sample text to demonstrate case conversion. try different options!"
      />

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
