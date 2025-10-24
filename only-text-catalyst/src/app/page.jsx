'use client'

import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import { Textarea } from '@/components/textarea'
import { useToast, ToastContainer } from '@/components/toast'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  SparklesIcon, 
  EnvelopeIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

// Smart Presets Configuration
const PRESETS = {
  magic: {
    name: 'Magic Clean',
    icon: SparklesIcon,
    color: 'from-purple-500 to-pink-500',
    config: {
      removeEmojis: true,
      removeBullets: true,
      removeSpecialChars: true,
      cleanAI: true,
      removeCode: true,
      addDots: false,
    }
  },
  email: {
    name: 'Email',
    icon: EnvelopeIcon,
    color: 'from-blue-500 to-cyan-500',
    config: {
      removeEmojis: true,
      removeBullets: true,
      removeSpecialChars: true,
      cleanAI: true,
      removeCode: false,
      addDots: true,
    }
  },
  linkedin: {
    name: 'LinkedIn',
    icon: BriefcaseIcon,
    color: 'from-blue-600 to-blue-800',
    config: {
      removeEmojis: true,
      removeBullets: false,
      removeSpecialChars: true,
      cleanAI: true,
      removeCode: false,
      addDots: false,
    }
  },
  blog: {
    name: 'Blog Post',
    icon: DocumentTextIcon,
    color: 'from-green-500 to-emerald-500',
    config: {
      removeEmojis: false,
      removeBullets: false,
      removeSpecialChars: false,
      cleanAI: true,
      removeCode: true,
      addDots: false,
    }
  },
}

export default function OnlyTextHome() {
  const { toasts, showToast } = useToast()
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [activePreset, setActivePreset] = useState(null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const [removedStats, setRemovedStats] = useState({
    emojis: 0,
    bullets: 0,
    specialChars: 0,
    extraSpaces: 0,
  })
  
  const [stats, setStats] = useState({
    input: { characters: 0, words: 0, lines: 0 },
    output: { characters: 0, words: 0, lines: 0 },
  })

  // Calculate statistics
  const calculateStats = useCallback((text) => {
    if (!text) return { characters: 0, words: 0, lines: 0 }
    
    const charCount = text.length
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    
    return {
      characters: charCount,
      words: words.length,
      lines: lines.length,
    }
  }, [])

  // Update stats when text changes
  useEffect(() => {
    setStats({
      input: calculateStats(inputText),
      output: calculateStats(outputText),
    })
  }, [inputText, outputText, calculateStats])

  // Smart text processing
  const processText = useCallback((text, config) => {
    if (!text) return { cleaned: '', stats: { emojis: 0, bullets: 0, specialChars: 0, extraSpaces: 0 } }
    
    let processed = text
    let removedCount = { emojis: 0, bullets: 0, specialChars: 0, extraSpaces: 0 }
    
    // Count emojis before removal
    if (config.removeEmojis) {
      const emojiMatches = text.match(/\p{Emoji}/gu)
      removedCount.emojis = emojiMatches ? emojiMatches.length : 0
      processed = processed.replace(/\p{Emoji}/gu, '')
    }
    
    // Process line by line
    let lines = processed.split('\n')
    lines = lines.map(line => {
      let processedLine = line.trim()
      
      // Remove bullets
      if (config.removeBullets) {
        const bulletMatch = processedLine.match(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s*/)
        if (bulletMatch) {
          removedCount.bullets++
          processedLine = processedLine.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s*/g, '')
        }
      }
      
      // Add dots
      if (config.addDots && processedLine !== '' && !/[.!?]$/.test(processedLine)) {
        processedLine += '.'
      }
      
      // Remove code symbols
      if (config.removeCode) {
        processedLine = processedLine.replace(/\{\}/g, '')
        processedLine = processedLine.replace(/\{|\}/g, '')
      }
      
      // Clean AI markers
      if (config.cleanAI) {
        processedLine = processedLine.replace(/\[\[\w+\]\]/g, '')
        processedLine = processedLine.replace(/\{(\w+):[^}]*\}/g, '')
        processedLine = processedLine.replace(/[\u200B-\u200D\uFEFF]/g, '')
      }
      
      // Remove special characters
      if (config.removeSpecialChars) {
        const beforeLength = processedLine.length
        processedLine = processedLine.replace(/\s+\-\s+/g, ', ')
        processedLine = processedLine.replace(/[^\w\s.,!?"-]/g, '')
        const afterLength = processedLine.length
        removedCount.specialChars += (beforeLength - afterLength)
      }
      
      // Remove extra spaces
      const spacesBefore = (processedLine.match(/\s{2,}/g) || []).length
      processedLine = processedLine.replace(/\s{2,}/g, ' ')
      removedCount.extraSpaces += spacesBefore
      
      return processedLine
    })
    
    return { 
      cleaned: lines.filter(line => line.length > 0).join('\n'),
      stats: removedCount
    }
  }, [])

  // Apply preset
  const applyPreset = useCallback((presetKey) => {
    if (!inputText) {
      showToast('Please enter some text first', 'error')
      return
    }
    
    const preset = PRESETS[presetKey]
    const { cleaned, stats: removedCount } = processText(inputText, preset.config)
    
    setOutputText(cleaned)
    setRemovedStats(removedCount)
    setActivePreset(presetKey)
    
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), { input: inputText, output: cleaned }])
    setHistoryIndex(prev => prev + 1)
    
    showToast(`${preset.name} applied!`, 'success')
  }, [inputText, processText, historyIndex, showToast])

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      const prevState = history[historyIndex - 1]
      setInputText(prevState.input)
      setOutputText(prevState.output)
      showToast('Undone', 'success')
    }
  }, [history, historyIndex, showToast])

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      const nextState = history[historyIndex + 1]
      setInputText(nextState.input)
      setOutputText(nextState.output)
      showToast('Redone', 'success')
    }
  }, [history, historyIndex, showToast])

  // Copy output
  const handleCopy = async () => {
    if (!outputText) {
      showToast('Nothing to copy', 'error')
      return
    }
    
    try {
      await navigator.clipboard.writeText(outputText)
      showToast('Copied to clipboard!', 'success')
    } catch (err) {
      showToast('Failed to copy', 'error')
    }
  }

  // Download output
  const handleDownload = () => {
    if (!outputText) {
      showToast('Nothing to download', 'error')
      return
    }
    
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cleaned_text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Downloaded!', 'success')
  }

  // Clear all
  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setActivePreset(null)
    setRemovedStats({ emojis: 0, bullets: 0, specialChars: 0, extraSpaces: 0 })
    setHistory([])
    setHistoryIndex(-1)
  }

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      showToast('Pasted from clipboard!', 'success')
    } catch (err) {
      showToast('Failed to paste', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <Heading className="text-white drop-shadow-lg">
              ✨ Smart Text Cleaner Pro
            </Heading>
            <p className="mt-4 text-xl text-white/90">
              AI-powered text cleaning with one-click presets
            </p>
            <div className="mt-6 flex justify-center gap-4 text-sm text-white/80">
              <Link href="/glossary" className="hover:text-white transition-colors">
                📖 Glossary
              </Link>
              <span>•</span>
              <Link href="/how-to-remove-emojis-from-linkedin" className="hover:text-white transition-colors">
                💼 LinkedIn Guide
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Smart Presets */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            🎯 Quick Presets
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(PRESETS).map(([key, preset]) => {
              const Icon = preset.icon
              const isActive = activePreset === key
              
              return (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all ${
                    isActive
                      ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-900'
                      : 'hover:scale-105'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${preset.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className="relative">
                    <Icon className="h-6 w-6 text-zinc-700 dark:text-zinc-300 mb-2" />
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {preset.name}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Split View */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {/* Input */}
          <div className="relative">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                📝 Before
              </label>
              <Button onClick={handlePaste} className="text-xs" outline>
                Paste
              </Button>
            </div>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text with emojis, bullets, and special characters here...

Try pasting:
• Bullet points with emojis 😊
• Special characters & symbols
• AI-generated content with markers"
              rows={16}
              className="font-mono text-sm"
            />
            {/* Input Stats */}
            <div className="mt-2 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{stats.input.characters} chars</span>
              <span>{stats.input.words} words</span>
              <span>{stats.input.lines} lines</span>
            </div>
          </div>

          {/* Output */}
          <div className="relative">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                ✨ After
              </label>
              <div className="flex gap-2">
                <Button onClick={handleCopy} className="text-xs" outline>
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </Button>
                <Button onClick={handleDownload} className="text-xs" outline>
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={outputText}
              readOnly
              placeholder="Cleaned text will appear here...

Select a preset above or paste text to get started!"
              rows={16}
              className="font-mono text-sm bg-zinc-50 dark:bg-zinc-800/50"
            />
            {/* Output Stats */}
            <div className="mt-2 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{stats.output.characters} chars</span>
              <span>{stats.output.words} words</span>
              <span>{stats.output.lines} lines</span>
            </div>
          </div>
        </div>

        {/* Removed Stats */}
        {(removedStats.emojis > 0 || removedStats.bullets > 0 || removedStats.specialChars > 0) && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Cleaned Successfully!
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
              {removedStats.emojis > 0 && (
                <div className="text-green-700 dark:text-green-300">
                  <span className="font-bold">{removedStats.emojis}</span> emojis removed
                </div>
              )}
              {removedStats.bullets > 0 && (
                <div className="text-green-700 dark:text-green-300">
                  <span className="font-bold">{removedStats.bullets}</span> bullets removed
                </div>
              )}
              {removedStats.specialChars > 0 && (
                <div className="text-green-700 dark:text-green-300">
                  <span className="font-bold">{removedStats.specialChars}</span> special chars
                </div>
              )}
              {removedStats.extraSpaces > 0 && (
                <div className="text-green-700 dark:text-green-300">
                  <span className="font-bold">{removedStats.extraSpaces}</span> extra spaces
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button onClick={handleUndo} outline disabled={historyIndex <= 0}>
            <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button onClick={handleRedo} outline disabled={historyIndex >= history.length - 1}>
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Redo
          </Button>
          <div className="flex-1" />
          <Button onClick={handleClear} color="red">
            <TrashIcon className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>

        {/* AI Tools Section */}
        <div className="mb-12">
          <Heading level={2} className="mb-6">🤖 AI-Powered Tools</Heading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/ai-text-improver" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative">
                <div className="mb-3 text-3xl">✨</div>
                <h3 className="mb-2 text-lg font-bold">AI Text Improver</h3>
                <p className="text-sm text-white/90">
                  Make your writing clearer and more professional with AI
                </p>
                <div className="mt-4 text-sm font-medium">
                  Try it →
                </div>
              </div>
            </Link>

            <Link href="/ai-grammar-checker" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative">
                <div className="mb-3 text-3xl">✓</div>
                <h3 className="mb-2 text-lg font-bold">Grammar Checker</h3>
                <p className="text-sm text-white/90">
                  Find and fix all grammar, spelling, and punctuation errors
                </p>
                <div className="mt-4 text-sm font-medium">
                  Try it →
                </div>
              </div>
            </Link>

            <Link href="/ai-tone-converter" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative">
                <div className="mb-3 text-3xl">🎭</div>
                <h3 className="mb-2 text-lg font-bold">Tone Converter</h3>
                <p className="text-sm text-white/90">
                  Change your writing tone: professional, casual, friendly & more
                </p>
                <div className="mt-4 text-sm font-medium">
                  Try it →
                </div>
              </div>
            </Link>

            <Link href="/ai-summarizer" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-grid-white/10" />
              <div className="relative">
                <div className="mb-3 text-3xl">📄</div>
                <h3 className="mb-2 text-lg font-bold">Smart Summarizer</h3>
                <p className="text-sm text-white/90">
                  Summarize long articles and documents instantly
                </p>
                <div className="mt-4 text-sm font-medium">
                  Try it →
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Other Tools */}
        <div className="mb-12">
          <Heading level={2} className="mb-6">🛠️ Text Tools</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: '/remove-emojis', icon: '😊', title: 'Remove Emojis', desc: 'Remove all emojis from text' },
              { href: '/remove-bullet-points', icon: '•', title: 'Remove Bullets', desc: 'Remove bullet points and list markers' },
              { href: '/word-counter', icon: '📊', title: 'Word Counter', desc: 'Count words, characters, and more' },
              { href: '/character-counter', icon: '🔢', title: 'Character Counter', desc: 'Detailed character statistics' },
              { href: '/case-converter', icon: 'Aa', title: 'Case Converter', desc: 'Convert text case formats' },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-zinc-800"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{tool.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {tool.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {tool.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
