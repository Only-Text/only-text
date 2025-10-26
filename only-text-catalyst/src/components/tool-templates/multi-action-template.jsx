'use client'

import { useState } from 'react'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'

/**
 * MultiActionTemplate - Voor tools met meerdere transformatie opties
 * Gebruik: case-converter
 */
export function MultiActionTemplate({
  title,
  placeholder = "Paste your text here...",
  actions = [],
  demoText = null
}) {
  const [text, setText] = useState('')

  const handleAction = (transformFn) => {
    if (text.trim()) {
      const transformed = transformFn(text)
      setText(transformed)
    }
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Text copied!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleClear = () => {
    setText('')
  }

  const handleDemo = () => {
    if (demoText) {
      setText(demoText)
    }
  }

  return (
    <div className="w-full">
      {/* Main Tool Area - Full Focus */}
      <div className="mx-auto max-w-4xl">
        {/* Title */}
        <h1 className="mb-6 text-center text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
          {title}
        </h1>

        {/* Demo Button */}
        {demoText && !text && (
          <div className="mb-4 text-center">
            <button
              onClick={handleDemo}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline decoration-dashed underline-offset-4"
            >
              💡 Try with example text
            </button>
          </div>
        )}

        {/* Utility Buttons - Top */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Button onClick={handlePaste} outline>
            📋 Paste
          </Button>
          <Button onClick={handleCopy} outline disabled={!text}>
            📄 Copy
          </Button>
          <Button onClick={handleClear} outline color="red">
            🗑️ Clear
          </Button>
        </div>

        {/* Text Area - Large and Prominent */}
        <div className="relative mb-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={16}
            className="w-full text-base sm:text-lg font-mono"
          />
          
          {/* Character Count */}
          <div className="mt-2 text-right text-sm text-zinc-500 dark:text-zinc-400">
            {text.length} characters
          </div>
        </div>

        {/* Action Buttons - Transformation Options */}
        <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 dark:border-purple-800 dark:from-purple-950/30 dark:to-blue-950/30">
          <h2 className="mb-4 text-center text-lg font-bold text-zinc-900 dark:text-white">
            Choose Transformation
          </h2>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {actions.map((action) => (
              <Button
                key={action.id}
                onClick={() => handleAction(action.transform)}
                disabled={!text.trim()}
                className="flex flex-col items-center gap-2 py-4"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-semibold">{action.label}</span>
                {action.example && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {action.example}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
