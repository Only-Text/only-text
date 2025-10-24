'use client'

import { Heading } from '@/components/heading'
import { Button } from '@/components/button'
import Link from 'next/link'

export default function HowToRemoveEmojisLinkedInPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="mb-4 inline-block text-blue-100 hover:text-white">
            ← Back to Home
          </Link>
          <Heading className="text-white">How to Remove Emojis from LinkedIn Posts</Heading>
          <p className="mt-2 text-lg text-blue-100">
            Step-by-step guide to cleaning LinkedIn content for professional communication
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* What & Why */}
        <div className="mb-12 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-8 dark:from-zinc-800 dark:to-zinc-900">
          <Heading level={2} className="mb-4">Why Remove Emojis from LinkedIn?</Heading>
          <p className="mb-4 text-lg text-zinc-700 dark:text-zinc-300">
            LinkedIn is a professional networking platform where maintaining a professional tone is crucial. While emojis 
            can add personality to casual social media posts, they may appear unprofessional in LinkedIn content, especially 
            for corporate communications, job applications, or B2B marketing.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Removing emojis from LinkedIn posts helps you maintain credibility, ensures compatibility with professional 
            tools, and makes your content more suitable for formal business contexts.
          </p>
        </div>

        {/* Step-by-Step Guide */}
        <div className="mb-12">
          <Heading level={2} className="mb-6">How to Remove Emojis in 3 Simple Steps</Heading>
          
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  1
                </div>
                <Heading level={3} className="text-xl">Copy Your LinkedIn Text</Heading>
              </div>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                Select and copy the text from your LinkedIn post, comment, or message that contains emojis. 
                You can copy from:
              </p>
              <ul className="list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>LinkedIn post drafts</li>
                <li>LinkedIn comments</li>
                <li>LinkedIn messages</li>
                <li>LinkedIn articles</li>
                <li>LinkedIn profile sections</li>
              </ul>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600 dark:bg-green-900 dark:text-green-300">
                  2
                </div>
                <Heading level={3} className="text-xl">Use Only Text Tool</Heading>
              </div>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                Paste your text into the Only Text emoji remover tool. The tool will automatically detect and remove 
                all emojis while preserving your text content.
              </p>
              <Link href="/remove-emojis">
                <Button className="mt-2">
                  Try Emoji Remover Tool →
                </Button>
              </Link>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                  3
                </div>
                <Heading level={3} className="text-xl">Copy Clean Text Back to LinkedIn</Heading>
              </div>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                Click the "Copy" button to copy your emoji-free text, then paste it back into LinkedIn. Your text 
                is now professional and ready for business communication.
              </p>
            </div>
          </div>
        </div>

        {/* Example */}
        <div className="mb-12">
          <Heading level={2} className="mb-6">Before & After Example</Heading>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
              <h3 className="mb-2 font-semibold text-red-900 dark:text-red-300">❌ Before (With Emojis)</h3>
              <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                🚀 Excited to announce our new product launch! 💼 Join us for an exclusive webinar 📅 
                this Friday at 2 PM. Don't miss out! 🎉 Register now 👉 link in comments ⬇️
              </p>
            </div>

            <div className="flex justify-center">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
              <h3 className="mb-2 font-semibold text-green-900 dark:text-green-300">✅ After (Professional)</h3>
              <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                Excited to announce our new product launch! Join us for an exclusive webinar 
                this Friday at 2 PM. Don't miss out! Register now - link in comments.
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-12">
          <Heading level={2} className="mb-6">When to Remove Emojis from LinkedIn</Heading>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📄 Job Applications</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Remove emojis from cover letters, LinkedIn messages to recruiters, and professional introductions.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">💼 B2B Marketing</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Clean business-to-business content for a more professional and credible appearance.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">📊 Corporate Communications</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Ensure company announcements and official posts maintain professional standards.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold">🎓 Academic Content</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Remove emojis from research posts, academic discussions, and educational content.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <Heading level={2} className="mb-6">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                Should I use emojis on LinkedIn at all?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                It depends on your industry and audience. While emojis can add personality to personal branding posts, 
                they're generally best avoided in formal business communications, job applications, and B2B content. 
                Use them sparingly and consider your professional context.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                Will removing emojis affect my LinkedIn engagement?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Not necessarily. Professional, well-written content without emojis can actually perform better in 
                B2B contexts and with executive audiences. Focus on clear, valuable content rather than relying 
                on emojis for engagement.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                Can I remove emojis from LinkedIn messages in bulk?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! You can copy multiple messages or posts, paste them all into Only Text, and remove all emojis 
                at once. This is perfect for cleaning up message templates or multiple posts.
              </p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-center text-white">
          <Heading level={2} className="mb-4 text-white">Ready to Clean Your LinkedIn Content?</Heading>
          <p className="mb-6 text-blue-100">
            Remove emojis from your LinkedIn posts in seconds with our free tool
          </p>
          <Link href="/remove-emojis">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              Try Emoji Remover Now →
            </Button>
          </Link>
        </div>

        {/* Related Tools */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Related Tools</Heading>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/remove-emojis" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                😀 Remove Emojis
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Remove all emojis from any text
              </p>
            </Link>
            <Link href="/word-counter" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                📊 Word Counter
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Count words for LinkedIn posts
              </p>
            </Link>
            <Link href="/case-converter" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Aa Case Converter
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Format text case properly
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
