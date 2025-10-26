'use client'

import { ToolLayout } from '@/components/tool-layout'
import { SimpleTransformTemplate } from '@/components/tool-templates'
import { SoftwareApplicationSchema, FAQSchema, BreadcrumbSchema } from '@/components/structured-data'
import { Heading } from '@/components/heading'

export default function RemoveEmojisPage() {
  // Transform function for removing emojis
  const removeEmojis = (text) => {
    // Count emojis before removal
    const emojiRegex = /\p{Emoji}/gu
    const emojis = text.match(emojiRegex) || []
    
    // Remove emojis and spaces after them
    let processed = text.replace(/^\p{Emoji}\s*/gmu, '')
    processed = processed.replace(/\p{Emoji}/gu, '')
    
    return {
      text: processed,
      stats: {
        'Emojis Removed': emojis.length,
        'Characters': processed.length
      }
    }
  }

  const faqQuestions = [
    {
      question: 'Why remove emojis from text?',
      answer: 'Emojis can cause issues in professional documents, databases, or systems that don\'t support Unicode properly. Removing them ensures compatibility and maintains a professional appearance.'
    },
    {
      question: 'Does this remove all types of emojis?',
      answer: 'Yes! Our tool removes all Unicode emoji characters including smileys, symbols, flags, and pictographs.'
    },
    {
      question: 'Is my text data safe?',
      answer: 'Absolutely! All processing happens in your browser. We never send your text to any server, ensuring complete privacy and security.'
    }
  ]

  return (
    <>
      <SoftwareApplicationSchema
        name="Remove Emojis from Text"
        description="Free online tool to remove all emojis from text instantly. Perfect for professional documents and data processing."
        url="https://only-text.com/remove-emojis"
      />
      <FAQSchema questions={faqQuestions} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://only-text.com' },
          { name: 'Remove Emojis', url: 'https://only-text.com/remove-emojis' }
        ]}
      />
      
      <ToolLayout
        title="Remove Emojis from Text"
        description="Instantly remove all emojis from your text. Perfect for cleaning up social media posts, messages, or any text with unwanted emojis."
        currentPath="/remove-emojis"
      >
        {/* Main Tool Interface */}
        <SimpleTransformTemplate
          title="Remove Emojis"
          placeholder="Paste your text with emojis here... 😀🎉✨"
          transformFunction={removeEmojis}
          actionLabel="Clean Text"
          demoText="Hello! 👋 This is a great day! 🌞 Let's celebrate! 🎉 We're so excited! 😊✨"
        />

      {/* How It Works */}
      <div className="mt-12">
        <Heading level={2} className="mb-4">How It Works</Heading>
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
          <ol className="space-y-3 text-zinc-600 dark:text-zinc-400">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
              <span>Paste or type your text containing emojis in the input box</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
              <span>The tool automatically detects and removes all emoji characters</span>
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
              Hello! 👋 This is a great day! 🌞 Let's celebrate! 🎉
            </div>
            <div className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Output:</div>
            <div className="rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
              Hello! This is a great day! Let's celebrate!
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Input:</div>
            <div className="mb-4 rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
              📱 Check out our new app! 🚀<br />
              ✨ Amazing features<br />
              💯 100% free
            </div>
            <div className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Output:</div>
            <div className="rounded bg-zinc-50 p-3 font-mono text-sm dark:bg-zinc-900">
              Check out our new app!<br />
              Amazing features<br />
              100% free
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <Heading level={2} className="mb-4">Frequently Asked Questions</Heading>
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Why remove emojis from text?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Emojis can cause issues in professional documents, databases, or systems that don't support Unicode properly. 
              Removing them ensures compatibility and maintains a professional appearance.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Does this remove all types of emojis?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Yes! Our tool removes all Unicode emoji characters including smileys, symbols, flags, and pictographs.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Is my text data safe?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Absolutely! All processing happens in your browser. We never send your text to any server, 
              ensuring complete privacy and security.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Can I use this for social media posts?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Yes! This tool is perfect for cleaning up LinkedIn posts, tweets, or any social media content 
              before using it in professional contexts.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Does it work on mobile devices?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Yes! Our emoji remover is fully responsive and works perfectly on smartphones and tablets.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Is this tool free?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Yes, completely free with no sign-up required. Use it as many times as you need!
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="mt-12">
        <Heading level={2} className="mb-4">Common Use Cases</Heading>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">📧 Email Cleaning</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Remove emojis from emails before sending to professional contacts or importing into CRM systems.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">📄 Document Preparation</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Clean text for reports, presentations, or any formal documentation that requires plain text.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">💾 Database Import</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Prepare text data for databases that don't handle Unicode emojis well.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">🤖 AI Content Cleaning</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Remove emojis from AI-generated content before publishing or further processing.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
    </>
  )
}
