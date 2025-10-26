import { Heading } from '@/components/heading'
import { Button } from '@/components/button'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

const aiTools = [
  {
    name: 'AI Text Improver',
    description: 'Make your writing clearer, more professional, and better written with AI.',
    href: '/ai-text-improver',
    gradient: 'from-purple-500 to-pink-500',
    icon: '✨',
    stats: '99.2% accuracy',
  },
  {
    name: 'Grammar Checker',
    description: 'Find and fix all grammar, spelling, and punctuation errors instantly.',
    href: '/ai-grammar-checker',
    gradient: 'from-blue-500 to-cyan-500',
    icon: '✓',
    stats: '1-2 sec response',
  },
  {
    name: 'Tone Converter',
    description: 'Change your writing tone: professional, casual, friendly, formal & more.',
    href: '/ai-tone-converter',
    gradient: 'from-orange-500 to-red-500',
    icon: '🎭',
    stats: '6 tones available',
  },
  {
    name: 'Smart Summarizer',
    description: 'Summarize long articles and documents up to 50,000 characters.',
    href: '/ai-summarizer',
    gradient: 'from-green-500 to-emerald-500',
    icon: '📄',
    stats: 'Up to 50K chars',
  },
]

const essentialTools = [
  { href: '/remove-emojis', icon: '😊', title: 'Remove Emojis', desc: 'Clean all emojis from text' },
  { href: '/remove-bullet-points', icon: '•', title: 'Remove Bullets', desc: 'Strip bullet points and markers' },
  { href: '/word-counter', icon: '📊', title: 'Word Counter', desc: 'Count words and characters' },
  { href: '/character-counter', icon: '🔢', title: 'Character Counter', desc: 'Detailed character stats' },
  { href: '/case-converter', icon: 'Aa', title: 'Case Converter', desc: 'Convert text case formats' },
]

export function ToolLayout({ 
  title, 
  description, 
  children,
  relatedTools = [],
  currentPath = ''
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/10 to-orange-500/10 blur-3xl dark:from-purple-500/5 dark:to-orange-500/5" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/10 to-pink-500/10 blur-3xl dark:from-orange-500/5 dark:to-pink-500/5" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-3xl dark:from-pink-500/5 dark:to-purple-500/5" />
      </div>
      {/* Header - Minimal */}
      <div className="relative border-b border-zinc-200/50 bg-white/80 backdrop-blur-sm py-4 dark:border-zinc-800/50 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors">
              <span>←</span>
              <span>Back to Only Text</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </div>

      {/* AI Tools Section */}
      <div className="relative border-t border-zinc-200/50 bg-gradient-to-br from-purple-50/50 to-blue-50/50 backdrop-blur-sm py-16 dark:border-zinc-800/50 dark:from-zinc-900/50 dark:to-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 text-center">
            <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">AI-Powered</span>
          </div>
          <Heading level={2} className="mb-3 text-center text-zinc-900 dark:text-white">Transform your text with AI</Heading>
          <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">Powered by Claude Haiku 4.5. Lightning-fast responses. Enterprise-grade accuracy. <strong>100% Free</strong></p>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {aiTools.filter(tool => tool.href !== currentPath).map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-900/5 transition-all hover:shadow-lg dark:bg-zinc-900 dark:ring-white/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 transition-opacity group-hover:opacity-5`} />
                <div className="relative">
                  <div className="flex items-center gap-x-4">
                    <div className={`flex size-12 items-center justify-center rounded-lg bg-gradient-to-br ${tool.gradient} text-2xl`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{tool.stats}</p>
                    </div>
                    <ChevronRightIcon className="size-5 text-zinc-400 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Essential Tools Section */}
      <div className="relative border-t border-zinc-200/50 bg-white/50 backdrop-blur-sm py-16 dark:border-zinc-800/50 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 text-center">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">Basic Tools</span>
          </div>
          <Heading level={2} className="mb-3 text-center text-zinc-900 dark:text-white">Essential text utilities</Heading>
          <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">Simple, fast, and effective text processing tools. <strong>100% Free</strong></p>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {essentialTools.filter(tool => tool.href !== currentPath).map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex items-center gap-x-4 rounded-lg bg-white p-4 ring-1 ring-zinc-900/5 transition-all hover:shadow-md dark:bg-zinc-900 dark:ring-white/10"
              >
                <div className="text-2xl">{tool.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-zinc-200/50 bg-white/80 backdrop-blur-sm py-8 dark:border-zinc-800/50 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            © 2025 Only Text. All rights reserved. Free text processing tools powered by AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
