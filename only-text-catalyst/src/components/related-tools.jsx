import { Heading } from '@/components/heading'
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

export function RelatedTools({ currentPath = '' }) {
  return (
    <>
      {/* AI Tools Section */}
      <div className="mt-16">
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

      {/* Essential Tools Section */}
      <div className="mt-12">
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
    </>
  )
}
