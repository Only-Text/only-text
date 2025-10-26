'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'

/**
 * CounterTemplate - Voor tools die live statistieken tonen
 * Gebruik: word-counter, character-counter
 */
export function CounterTemplate({
  title,
  placeholder = "Paste your text here to analyze...",
  calculateStats,
  statsConfig = [],
  demoText = null
}) {
  const [text, setText] = useState('')
  const [stats, setStats] = useState({})

  useEffect(() => {
    const calculatedStats = calculateStats(text)
    setStats(calculatedStats)
  }, [text, calculateStats])

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
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

        {/* Action Buttons - Top */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Button onClick={handlePaste} outline>
            📋 Paste
          </Button>
          <Button onClick={handleClear} outline color="red">
            🗑️ Clear
          </Button>
        </div>

        {/* Text Area - Large and Prominent */}
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={16}
            className="w-full text-base sm:text-lg font-mono"
          />
        </div>

        {/* Live Statistics - Prominent Display */}
        <div className="mt-6 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 dark:border-purple-800 dark:from-purple-950/30 dark:to-blue-950/30">
          <h2 className="mb-4 text-center text-xl font-bold text-zinc-900 dark:text-white">
            📊 Live Statistics
          </h2>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {statsConfig.map(({ key, label, icon, color = 'purple' }) => (
              <div
                key={key}
                className="rounded-lg bg-white p-4 text-center shadow-sm dark:bg-zinc-900"
              >
                <div className="mb-1 text-2xl">{icon}</div>
                <div className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {label}
                </div>
                <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
                  {stats[key] !== undefined ? stats[key] : 0}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          {text.length > 0 && (
            <div className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Keep typing to see live updates
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
