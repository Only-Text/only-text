'use client'

import { ToolLayout } from '@/components/tool-layout'
import { CounterTemplate } from '@/components/tool-templates'
import { Heading } from '@/components/heading'

export default function WordCounterPage() {
  const calculateStats = (inputText) => {
    // Characters
    const characters = inputText.length
    const charactersNoSpaces = inputText.replace(/\s/g, '').length
    
    // Words
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length
    
    // Sentences
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const sentenceCount = sentences.length
    
    // Paragraphs
    const paragraphs = inputText.split(/\n\n+/).filter(p => p.trim().length > 0)
    const paragraphCount = paragraphs.length
    
    // Lines
    const lines = inputText.split('\n').filter(line => line.trim().length > 0)
    const lineCount = lines.length
    
    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200)
    
    // Speaking time (average 130 words per minute)
    const speakingTime = Math.ceil(wordCount / 130)
    
    return {
      characters,
      charactersNoSpaces,
      words: wordCount,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      lines: lineCount,
      readingTime,
      speakingTime,
    }
  }

  const statsConfig = [
    { key: 'words', label: 'Words', icon: '📝', color: 'purple' },
    { key: 'characters', label: 'Characters', icon: '🔢', color: 'blue' },
    { key: 'charactersNoSpaces', label: 'No Spaces', icon: '✨', color: 'cyan' },
    { key: 'sentences', label: 'Sentences', icon: '💬', color: 'green' },
    { key: 'paragraphs', label: 'Paragraphs', icon: '📊', color: 'orange' },
    { key: 'lines', label: 'Lines', icon: '📋', color: 'pink' },
    { key: 'readingTime', label: 'Reading (min)', icon: '📖', color: 'indigo' },
    { key: 'speakingTime', label: 'Speaking (min)', icon: '🎤', color: 'red' },
  ]

  return (
    <ToolLayout
      title="Word Counter - Count Words, Characters & More"
      description="Free online word counter tool. Count words, characters, sentences, paragraphs, and estimate reading time."
      currentPath="/word-counter"
    >
      {/* Main Tool Interface */}
      <CounterTemplate
        title="Word Counter"
        placeholder="Start typing or paste your text here to count words..."
        calculateStats={calculateStats}
        statsConfig={statsConfig}
        demoText={"This is a sample text to demonstrate the word counter tool. It contains multiple sentences and paragraphs to show you how the statistics work in real-time.\n\nYou can see the word count, character count, sentence count, and even estimated reading time. This helps writers, students, and professionals track their content length and complexity."}
      />

      {/* How It Works */}
      <div className="mt-12">
        <Heading level={2} className="mb-4">How to Use the Word Counter</Heading>
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
          <ol className="space-y-3 text-zinc-600 dark:text-zinc-400">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
              <span>Type or paste your text into the text area above</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
              <span>Statistics update automatically as you type</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
              <span>View word count, character count, and other metrics instantly</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
              <span>Get reading and speaking time estimates for your content</span>
            </li>
          </ol>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <Heading level={2} className="mb-4">Frequently Asked Questions</Heading>
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">How accurate is the word counter?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Our word counter uses industry-standard algorithms to count words accurately. It counts any sequence of 
              characters separated by spaces as a word.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">What is the reading time based on?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Reading time is calculated based on an average reading speed of 200 words per minute, which is the 
              standard for adult readers.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Does it count hyphenated words as one or two words?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Hyphenated words are counted as a single word, following standard word counting conventions.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">Is my text stored anywhere?</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No! All counting happens in your browser. Your text is never sent to our servers or stored anywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="mt-12">
        <Heading level={2} className="mb-4">Common Use Cases</Heading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">✍️ Essay Writing</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Track word count for academic essays and meet assignment requirements.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">📝 Blog Posts</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Optimize blog post length for SEO and reader engagement.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">📱 Social Media</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Stay within character limits for Twitter, LinkedIn, and other platforms.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">📖 Book Writing</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Track progress and meet chapter or book length goals.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">🎤 Speech Preparation</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Estimate speaking time for presentations and speeches.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h3 className="mb-2 font-semibold">📄 Document Analysis</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Analyze document length and complexity quickly.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
