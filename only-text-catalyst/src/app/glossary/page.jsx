'use client'

import { Heading } from '@/components/heading'
import Link from 'next/link'

export default function GlossaryPage() {
  const terms = [
    {
      term: "Emoji",
      definition: "A small digital image or icon used to express an idea, emotion, or concept in electronic communication. Emojis include smileys (😀), symbols (✨), flags (🇺🇸), and pictographs (📱).",
      examples: ["😀 Grinning Face", "❤️ Red Heart", "👍 Thumbs Up"],
      relatedTools: ["/remove-emojis"]
    },
    {
      term: "Bullet Point",
      definition: "A typographical symbol (such as •, -, or *) used to introduce items in a list. Bullet points help organize information and make text easier to scan.",
      examples: ["• Standard bullet", "- Dash bullet", "* Asterisk bullet", "1. Numbered list"],
      relatedTools: ["/remove-bullet-points"]
    },
    {
      term: "Character",
      definition: "A single unit of text, including letters, numbers, punctuation marks, spaces, and special symbols. Character count is important for social media posts, SMS messages, and SEO meta descriptions.",
      examples: ["Letters: A, b, Z", "Numbers: 1, 2, 3", "Punctuation: . , ! ?", "Spaces and symbols"],
      relatedTools: ["/character-counter"]
    },
    {
      term: "Word",
      definition: "A unit of language consisting of one or more characters separated by spaces. Word count is commonly used to measure the length of essays, articles, and documents.",
      examples: ["Single word: 'hello'", "Multiple words: 'hello world'", "Hyphenated: 'twenty-one'"],
      relatedTools: ["/word-counter"]
    },
    {
      term: "Text Case",
      definition: "The capitalization style of text. Common cases include uppercase (ALL CAPS), lowercase (all small), title case (Each Word Capitalized), and sentence case (First letter capitalized).",
      examples: ["UPPERCASE", "lowercase", "Title Case", "Sentence case"],
      relatedTools: ["/case-converter"]
    },
    {
      term: "Special Character",
      definition: "Non-alphanumeric characters that have special meaning or formatting purposes, such as @, #, $, %, &, *, and others. These are often used in programming, social media, or formatting.",
      examples: ["@ (at sign)", "# (hashtag)", "$ (dollar)", "% (percent)", "& (ampersand)"],
      relatedTools: ["/"]
    },
    {
      term: "Unicode",
      definition: "A universal character encoding standard that assigns a unique number to every character across all writing systems, including emojis. Unicode enables consistent text representation across different platforms and devices.",
      examples: ["U+1F600 (😀)", "U+2764 (❤️)", "U+1F44D (👍)"],
      relatedTools: ["/remove-emojis"]
    },
    {
      term: "Plain Text",
      definition: "Text without any formatting, styling, or special characters. Plain text contains only basic characters and is universally compatible across all systems and applications.",
      examples: ["No bold or italic", "No colors", "No special formatting", "Just characters"],
      relatedTools: ["/"]
    },
    {
      term: "Formatted Text",
      definition: "Text that includes styling elements such as bold, italic, colors, fonts, or special characters. Formatted text may not display consistently across different platforms.",
      examples: ["**Bold text**", "*Italic text*", "Colored text", "Special fonts"],
      relatedTools: ["/"]
    },
    {
      term: "AI-Generated Text",
      definition: "Text created by artificial intelligence systems like ChatGPT, Claude, or other language models. AI-generated text may contain special markers, formatting codes, or artifacts that need to be cleaned.",
      examples: ["[[markers]]", "{metadata}", "Special formatting", "Hidden characters"],
      relatedTools: ["/"]
    },
    {
      term: "Sentence",
      definition: "A grammatical unit consisting of one or more words that expresses a complete thought. Sentences typically end with punctuation marks like periods (.), question marks (?), or exclamation points (!).",
      examples: ["This is a sentence.", "Is this a question?", "What an exclamation!"],
      relatedTools: ["/word-counter"]
    },
    {
      term: "Paragraph",
      definition: "A distinct section of text consisting of one or more sentences that deal with a single theme or idea. Paragraphs are separated by line breaks.",
      examples: ["First paragraph.\\n\\nSecond paragraph."],
      relatedTools: ["/word-counter"]
    },
    {
      term: "Line Break",
      definition: "A control character or sequence that marks the end of a line of text and the beginning of a new one. Line breaks are used to separate lines in multi-line text.",
      examples: ["Line 1\\nLine 2", "Paragraph break: \\n\\n"],
      relatedTools: ["/"]
    },
    {
      term: "Whitespace",
      definition: "Characters that represent horizontal or vertical space in text, including spaces, tabs, and line breaks. Whitespace is used for formatting and readability.",
      examples: ["Space: ' '", "Tab: '\\t'", "Newline: '\\n'"],
      relatedTools: ["/character-counter"]
    },
    {
      term: "Character Encoding",
      definition: "A system that maps characters to numbers for computer storage and transmission. Common encodings include UTF-8, ASCII, and Unicode.",
      examples: ["UTF-8 (universal)", "ASCII (basic)", "ISO-8859-1 (Latin)"],
      relatedTools: ["/"]
    },
    {
      term: "Text Cleaning",
      definition: "The process of removing unwanted characters, formatting, or elements from text to make it plain, consistent, or suitable for a specific purpose.",
      examples: ["Remove emojis", "Remove bullets", "Remove special chars", "Clean formatting"],
      relatedTools: ["/", "/remove-emojis", "/remove-bullet-points"]
    },
    {
      term: "Word Count",
      definition: "The total number of words in a piece of text. Word count is commonly used in academic writing, content creation, and publishing to measure document length.",
      examples: ["Essay: 500 words", "Article: 1000 words", "Blog post: 1500 words"],
      relatedTools: ["/word-counter"]
    },
    {
      term: "Character Count",
      definition: "The total number of characters in text, including or excluding spaces. Character count is crucial for social media posts, SMS messages, and SEO meta descriptions with character limits.",
      examples: ["Twitter: 280 chars", "SMS: 160 chars", "Meta description: 155-160 chars"],
      relatedTools: ["/character-counter"]
    },
    {
      term: "Reading Time",
      definition: "An estimate of how long it takes to read a piece of text, typically calculated based on an average reading speed of 200-250 words per minute.",
      examples: ["500 words ≈ 2-3 minutes", "1000 words ≈ 4-5 minutes"],
      relatedTools: ["/word-counter"]
    },
    {
      term: "Speaking Time",
      definition: "An estimate of how long it takes to speak a piece of text aloud, typically calculated based on an average speaking speed of 130-150 words per minute.",
      examples: ["500 words ≈ 3-4 minutes", "1000 words ≈ 7-8 minutes"],
      relatedTools: ["/word-counter"]
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="mb-4 inline-block text-purple-100 hover:text-white">
            ← Back to Home
          </Link>
          <Heading className="text-center text-white">Text Cleaning Glossary</Heading>
          <p className="mt-2 text-center text-lg text-purple-100">
            Complete guide to text formatting, cleaning, and processing terms
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* What is this page */}
        <div className="mb-12 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 p-8 dark:from-zinc-800 dark:to-zinc-900">
          <Heading level={2} className="mb-4">What is this Glossary?</Heading>
          <p className="mb-4 text-lg text-zinc-700 dark:text-zinc-300">
            This glossary defines common terms related to text cleaning, formatting, and processing. Whether you're 
            removing emojis, counting words, or converting text case, understanding these terms will help you use 
            our tools more effectively.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Each term includes a clear definition, examples, and links to related tools where applicable.
          </p>
        </div>

        {/* Terms Grid */}
        <div className="space-y-6">
          {terms.map((item, index) => (
            <div key={index} className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800" id={item.term.toLowerCase().replace(/\s+/g, '-')}>
              <Heading level={3} className="mb-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
                {item.term}
              </Heading>
              
              <p className="mb-4 text-lg text-zinc-700 dark:text-zinc-300">
                {item.definition}
              </p>

              {item.examples && item.examples.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 font-semibold text-zinc-900 dark:text-white">Examples:</h4>
                  <ul className="list-inside list-disc space-y-1 text-zinc-600 dark:text-zinc-400">
                    {item.examples.map((example, i) => (
                      <li key={i}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.relatedTools && item.relatedTools.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-zinc-900 dark:text-white">Related Tools:</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.relatedTools.map((tool, i) => (
                      <Link
                        key={i}
                        href={tool}
                        className="rounded-full bg-purple-100 px-4 py-1 text-sm font-medium text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
                      >
                        {tool === '/' ? 'Main Tool' : tool.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Navigation */}
        <div className="mt-12 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
          <Heading level={2} className="mb-4">Quick Navigation</Heading>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {terms.map((item, index) => (
              <a
                key={index}
                href={`#${item.term.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {item.term}
              </a>
            ))}
          </div>
        </div>

        {/* Related Pages */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Related Pages</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400">
                🏠 Main Tool
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                All-in-one text cleaning tool
              </p>
            </Link>
            <Link href="/remove-emojis" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400">
                😀 Remove Emojis
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Remove all emojis from text
              </p>
            </Link>
            <Link href="/word-counter" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400">
                📊 Word Counter
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Count words and characters
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
