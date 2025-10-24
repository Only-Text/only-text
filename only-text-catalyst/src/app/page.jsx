'use client'

import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import Link from 'next/link'
import { 
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'AI-Powered Tools',
    description: 'Claude Haiku 4.5 powered text improvement, grammar checking, tone conversion, and summarization.',
    icon: SparklesIcon,
    href: '/ai-text-improver',
  },
  {
    name: 'Lightning Fast',
    description: '1-3 second response times. 2x faster than competitors. Optimized for speed and performance.',
    icon: BoltIcon,
    href: '#',
  },
  {
    name: 'Privacy First',
    description: 'No data storage. No tracking. No signup required. Your text stays private and secure.',
    icon: ShieldCheckIcon,
    href: '#',
  },
  {
    name: 'Always Free',
    description: 'All tools completely free. No hidden costs. No premium tiers. Just powerful text processing.',
    icon: RocketLaunchIcon,
    href: '#',
  },
]

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

const stats = [
  { name: 'Response Time', value: '1-3s' },
  { name: 'Accuracy Rate', value: '99%+' },
  { name: 'Daily Limit', value: '50 free' },
  { name: 'Tools Available', value: '9+' },
]

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-zinc-950">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/10 to-orange-500/10 blur-3xl dark:from-purple-500/5 dark:to-orange-500/5" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/10 to-pink-500/10 blur-3xl dark:from-orange-500/5 dark:to-pink-500/5" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-3xl dark:from-pink-500/5 dark:to-purple-500/5" />
      </div>

      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl shrink-0 lg:mx-0 lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a href="#ai-tools" className="inline-flex space-x-6">
                <span className="rounded-full bg-purple-50 px-3 py-1 text-sm/6 font-semibold text-purple-600 ring-1 ring-purple-600/20 ring-inset dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20">
                  What's new
                </span>
                <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-zinc-600 dark:text-zinc-400">
                  <span>4 AI-powered tools launched</span>
                  <ChevronRightIcon aria-hidden="true" className="size-5 text-zinc-400" />
                </span>
              </a>
            </div>
            
            <h1 className="mt-10 text-5xl font-semibold tracking-tight text-pretty text-zinc-900 dark:text-white sm:text-7xl">
              Clean & Improve Text with AI
            </h1>
            
            <p className="mt-8 text-lg font-medium text-pretty text-zinc-600 dark:text-zinc-400 sm:text-xl/8">
              Remove emojis, bullets, and special characters. Improve writing with AI. 
              Grammar check, tone conversion, and smart summarization. All free, fast, and private.
            </p>
            
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/ai-text-improver"
                className="rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:from-purple-500 hover:to-pink-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
              >
                Try AI Tools
              </Link>
              <a href="#features" className="text-sm/6 font-semibold text-zinc-900 dark:text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>

            {/* Stats */}
            <dl className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col gap-y-2">
                  <dt className="text-sm/6 text-zinc-600 dark:text-zinc-400">{stat.name}</dt>
                  <dd className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Screenshot placeholder - will be replaced with actual screenshot */}
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:mt-0 lg:mr-0 lg:ml-10 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="w-[76rem] rounded-xl bg-zinc-900/5 p-2 ring-1 ring-zinc-900/10 dark:bg-white/5 dark:ring-white/10 lg:rounded-2xl lg:p-4">
                <div className="aspect-[16/9] rounded-md bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 shadow-2xl ring-1 ring-zinc-900/10 dark:ring-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-purple-600 dark:text-purple-400">Everything you need</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-zinc-900 dark:text-white sm:text-5xl lg:text-balance">
            Powerful text tools, all in one place
          </p>
          <p className="mt-6 text-lg/8 text-zinc-600 dark:text-zinc-400">
            From basic text cleaning to advanced AI-powered improvements. Fast, free, and privacy-focused.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base/7 font-semibold text-zinc-900 dark:text-white">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-zinc-600 dark:text-zinc-400">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* AI Tools Section */}
      <div id="ai-tools" className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-base/7 font-semibold text-purple-600 dark:text-purple-400">AI-Powered</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-zinc-900 dark:text-white sm:text-5xl sm:text-balance">
            Transform your text with AI
          </p>
          <p className="mt-6 text-lg/8 text-zinc-600 dark:text-zinc-400">
            Powered by Claude Haiku 4.5. Lightning-fast responses. Enterprise-grade accuracy.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-8">
          {aiTools.map((tool) => (
            <Link
              key={tool.name}
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

      {/* Text Tools Section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-purple-600 dark:text-purple-400">Basic Tools</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-zinc-900 dark:text-white sm:text-5xl lg:text-balance">
            Essential text utilities
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {[
            { href: '/remove-emojis', icon: '😊', title: 'Remove Emojis', desc: 'Clean all emojis from text' },
            { href: '/remove-bullet-points', icon: '•', title: 'Remove Bullets', desc: 'Strip bullet points and markers' },
            { href: '/word-counter', icon: '📊', title: 'Word Counter', desc: 'Count words and characters' },
            { href: '/character-counter', icon: '🔢', title: 'Character Counter', desc: 'Detailed character stats' },
            { href: '/case-converter', icon: 'Aa', title: 'Case Converter', desc: 'Convert text case formats' },
          ].map((tool) => (
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

      {/* CTA Section */}
      <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-zinc-900 dark:text-white sm:text-5xl">
            Start improving your text today
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-zinc-600 dark:text-zinc-400">
            No signup required. No credit card needed. Just paste your text and get instant results.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/ai-text-improver"
              className="rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:from-purple-500 hover:to-pink-500"
            >
              Try AI Text Improver
            </Link>
            <Link href="/ai-grammar-checker" className="text-sm/6 font-semibold text-zinc-900 dark:text-white">
              Grammar Checker <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm/6 text-zinc-600 dark:text-zinc-400">
            © 2025 Only Text. All rights reserved. Free text processing tools powered by AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
