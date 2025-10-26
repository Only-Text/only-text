'use client'

import { ToolLayout } from '@/components/tool-layout'
import { CounterTemplate } from '@/components/tool-templates'
import { SoftwareApplicationSchema, FAQSchema, BreadcrumbSchema } from '@/components/structured-data'
import { Heading } from '@/components/heading'

export default function CharacterCounterPage() {
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
    
    return {
      total,
      noSpaces,
      letters,
      digits,
      punctuation,
      whitespace,
      special,
      uppercase,
      lowercase,
    }
  }

  const statsConfig = [
    { key: 'total', label: 'Total Characters', icon: '🔢', color: 'purple' },
    { key: 'noSpaces', label: 'No Spaces', icon: '✨', color: 'blue' },
    { key: 'letters', label: 'Letters', icon: '🅰️', color: 'green' },
    { key: 'digits', label: 'Digits', icon: '🔣', color: 'orange' },
    { key: 'punctuation', label: 'Punctuation', icon: '❗', color: 'pink' },
    { key: 'whitespace', label: 'Whitespace', icon: '⬜', color: 'cyan' },
    { key: 'uppercase', label: 'Uppercase', icon: '🅰', color: 'indigo' },
    { key: 'lowercase', label: 'Lowercase', icon: '🔡', color: 'red' },
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
        currentPath="/character-counter"
      >
        {/* Main Tool Interface */}
        <CounterTemplate
          title="Character Counter"
          placeholder="Start typing or paste your text here to count characters..."
          calculateStats={calculateStats}
          statsConfig={statsConfig}
          demoText="Hello World! This is a TEST with 123 numbers, punctuation marks (like these), and UPPERCASE letters mixed with lowercase."
        />

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
