'use client'

import { useState } from 'react'
import { Textarea } from '@/components/textarea'
import { Button } from '@/components/button'

/**
 * AITransformTemplate - Voor AI tools met API calls
 * Gebruik: ai-text-improver, ai-grammar-checker, ai-tone-converter, ai-summarizer
 */
export function AITransformTemplate({
  title,
  placeholder = "Paste your text here...",
  actionLabel = "Transform",
  onTransform,
  options = null,
  showToast,
  loadingText = "Processing...",
  demoText = null
}) {
  const [inputText, setInputText] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    if (!inputText.trim()) {
      showToast?.('Please enter some text', 'error')
      return
    }

    setLoading(true)
    try {
      const result = await onTransform(inputText)
      setInputText(result)
      setShowOutput(true)
      showToast?.(`${actionLabel} successful!`, 'success')
    } catch (error) {
      showToast?.(error.message || 'An error occurred', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      setShowOutput(false)
    } catch (err) {
      showToast?.('Failed to read clipboard', 'error')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inputText)
      showToast?.('Text copied!', 'success')
    } catch (err) {
      showToast?.('Failed to copy text', 'error')
    }
  }

  const handleClear = () => {
    setInputText('')
    setShowOutput(false)
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

        {/* Demo Button */}
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

        {/* Options (if provided) */}
        {options && !showOutput && (
          <div className="mb-6">
            {options}
          </div>
        )}

        {/* Action Buttons - Top */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Button onClick={handlePaste} outline>
            📋 Paste
          </Button>
          {!showOutput && (
            <Button 
              onClick={handleAction} 
              disabled={loading || !inputText.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500"
            >
              {loading ? `⏳ ${loadingText}` : `✨ ${actionLabel}`}
            </Button>
          )}
          {showOutput && (
            <Button onClick={handleReset} outline>
              ↩️ Edit Again
            </Button>
          )}
          <Button onClick={handleCopy} outline disabled={!inputText}>
            📄 Copy
          </Button>
          <Button onClick={handleClear} outline color="red">
            🗑️ Clear
          </Button>
        </div>

        {/* Text Area - Large and Prominent */}
        <div className="relative">
          <Textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              setShowOutput(false)
            }}
            placeholder={placeholder}
            rows={16}
            className="w-full text-base sm:text-lg font-mono"
            disabled={loading}
          />
          
          {/* Loading Indicator with Animation - Inside Textarea */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/95 backdrop-blur-sm dark:bg-zinc-900/95">
              <div className="text-center">
                {/* Animated thinking dots */}
                <div className="mb-4 flex items-center justify-center gap-2">
                  <div className="h-3 w-3 animate-bounce rounded-full bg-purple-600 dark:bg-purple-400 [animation-delay:0ms]"></div>
                  <div className="h-3 w-3 animate-bounce rounded-full bg-purple-600 dark:bg-purple-400 [animation-delay:150ms]"></div>
                  <div className="h-3 w-3 animate-bounce rounded-full bg-purple-600 dark:bg-purple-400 [animation-delay:300ms]"></div>
                </div>
                
                {/* Pulsing brain icon */}
                <div className="mb-3 text-4xl animate-pulse">
                  🧠
                </div>
                
                <div className="mb-2 text-lg font-semibold text-purple-700 dark:text-purple-300">
                  {loadingText}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Powered by Claude Haiku 4.5
                </div>
              </div>
            </div>
          )}
          
          {/* Character Count */}
          <div className="mt-2 text-right text-sm text-zinc-500 dark:text-zinc-400">
            {inputText.length} characters
          </div>
        </div>

        {/* Success Message */}
        {showOutput && !loading && (
          <div className="mt-6 rounded-lg border-2 border-green-300 bg-green-50/50 p-4 dark:border-green-700 dark:bg-green-950/20">
            <div className="text-center text-sm font-semibold text-green-700 dark:text-green-300">
              ✅ {actionLabel} complete! Your text has been updated above.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
