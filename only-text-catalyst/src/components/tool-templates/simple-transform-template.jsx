'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'

/**
 * SimpleTransformTemplate - Voor tools die instant transformeren zonder API call
 * Gebruik: remove-emojis, remove-bullet-points
 */
export function SimpleTransformTemplate({
  title,
  placeholder = "Paste your text here...",
  transformFunction,
  stats = null,
  actionLabel = "Transform",
  demoText = null
}) {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [statsData, setStatsData] = useState(null)

  // Auto-transform on input change
  useEffect(() => {
    if (inputText.trim()) {
      const result = transformFunction(inputText)
      setOutputText(result.text)
      if (result.stats) {
        setStatsData(result.stats)
      }
    } else {
      setOutputText('')
      setStatsData(null)
    }
  }, [inputText, transformFunction])

  const handleAction = () => {
    if (outputText) {
      setShowOutput(true)
      setInputText(outputText)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      setShowOutput(false)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(showOutput ? inputText : outputText)
      alert('Text copied!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setShowOutput(false)
    setStatsData(null)
  }

  const handleReset = () => {
    setShowOutput(false)
  }

  const handleDemo = () => {
    if (demoText) {
      setInputText(demoText)
      setShowOutput(false)
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

        {/* Demo Button - Subtle but visible */}
        {demoText && !inputText && (
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
          {!showOutput && outputText && (
            <Button onClick={handleAction} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500">
              ✨ {actionLabel}
            </Button>
          )}
          {showOutput && (
            <Button onClick={handleReset} outline>
              ↩️ Edit Again
            </Button>
          )}
          <Button onClick={handleCopy} outline disabled={!inputText && !outputText}>
            📄 Copy
          </Button>
          <Button onClick={handleClear} outline color="red">
            🗑️ Clear
          </Button>
        </div>

        {/* Text Area - Large and Prominent */}
        <div className="relative">
          <Textarea
            value={showOutput ? inputText : inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              setShowOutput(false)
            }}
            placeholder={placeholder}
            rows={16}
            className="w-full text-base sm:text-lg font-mono"
          />
          
          {/* Character Count */}
          <div className="mt-2 text-right text-sm text-zinc-500 dark:text-zinc-400">
            {(showOutput ? inputText : inputText).length} characters
          </div>
        </div>

        {/* Live Preview/Stats */}
        {!showOutput && outputText && (
          <div className="mt-6 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50/50 p-4 dark:border-purple-700 dark:bg-purple-950/20">
            <div className="mb-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
              Preview (click "{actionLabel}" to apply):
            </div>
            <div className="max-h-32 overflow-y-auto rounded bg-white p-3 font-mono text-sm dark:bg-zinc-900">
              {outputText.substring(0, 200)}
              {outputText.length > 200 && '...'}
            </div>
            
            {/* Stats Display */}
            {statsData && (
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {Object.entries(statsData).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {key}:
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
