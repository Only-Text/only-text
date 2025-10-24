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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
              ← Back to Only Text
            </Link>
          </div>
          <Heading className="mt-4">{title}</Heading>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Heading level={2} className="mb-6">Related Tools</Heading>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group rounded-lg border border-zinc-200 p-6 transition-colors hover:border-blue-500 dark:border-zinc-800 dark:hover:border-blue-500"
                >
                  <div className="mb-2 text-2xl">{tool.icon}</div>
                  <h3 className="mb-2 font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            © 2025 Only Text. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
