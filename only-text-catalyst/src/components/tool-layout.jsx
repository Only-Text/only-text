import { Heading } from '@/components/heading'
import { Button } from '@/components/button'
import Link from 'next/link'

export function ToolLayout({ 
  title, 
  description, 
  children,
  relatedTools = []
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/10 to-orange-500/10 blur-3xl dark:from-purple-500/5 dark:to-orange-500/5" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/10 to-pink-500/10 blur-3xl dark:from-orange-500/5 dark:to-pink-500/5" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-3xl dark:from-pink-500/5 dark:to-purple-500/5" />
      </div>
      {/* Header */}
      <div className="relative border-b border-zinc-200/50 bg-white/80 backdrop-blur-sm py-8 dark:border-zinc-800/50 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors">
              <span>←</span>
              <span>Back to Only Text</span>
            </Link>
          </div>
          <Heading className="mt-6 text-zinc-900 dark:text-white">{title}</Heading>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className="relative border-t border-zinc-200/50 bg-white/50 backdrop-blur-sm py-16 dark:border-zinc-800/50 dark:bg-zinc-950/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Heading level={2} className="mb-8 text-zinc-900 dark:text-white">Related Tools</Heading>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-900/5 transition-all hover:shadow-md dark:bg-zinc-900 dark:ring-white/10"
                >
                  <div className="mb-3 text-2xl">{tool.icon}</div>
                  <h3 className="mb-2 font-semibold text-zinc-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

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
