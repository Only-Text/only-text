'use client'

import { ToolLayout } from '@/components/tool-layout'
import { SimpleTransformTemplate } from '@/components/tool-templates'
import { SoftwareApplicationSchema, FAQSchema, BreadcrumbSchema } from '@/components/structured-data'
import { Heading } from '@/components/heading'

export default function RemoveBulletPointsPage() {
  // Transform function for removing bullet points
  const removeBulletPoints = (text) => {
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
    const lineCount = processedLines.filter(l => l.length > 0).length
    
    return {
      text: processed,
      stats: {
        'Bullets Removed': removedCount,
        'Lines': lineCount
      }
    }
  }

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
        description="Instantly remove bullet points, dashes, and list markers from your text. Perfect for cleaning up lists and formatted content."
        currentPath="/remove-bullet-points"
      >
        {/* Main Tool Interface */}
        <SimpleTransformTemplate
          title="Remove Bullet Points"
          placeholder="• Item 1&#10;• Item 2&#10;• Item 3"
          transformFunction={removeBulletPoints}
          actionLabel="Clean Text"
          demoText={"• First important point\n• Second key insight\n• Third valuable tip\n- Another item here\n* And one more thing"}
        />

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
