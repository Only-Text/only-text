'use client'

import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import { Textarea } from '@/components/textarea'
import { useToast, ToastContainer } from '@/components/toast'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OnlyTextHome() {
  const { toasts, showToast } = useToast()
  const [text, setText] = useState('')
  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    lines: 0,
    sentences: 0,
  })
  
  // Toggle states
  const [removeEmojis, setRemoveEmojis] = useState(true)
  const [removeBullets, setRemoveBullets] = useState(true)
  const [addDots, setAddDots] = useState(false)
  const [removeCode, setRemoveCode] = useState(false)
  const [cleanAI, setCleanAI] = useState(true)
  const [removeSpecialChars, setRemoveSpecialChars] = useState(true)

  // Update statistics whenever text changes
  useEffect(() => {
    if (!text) {
      setStats({ characters: 0, words: 0, lines: 0, sentences: 0 })
      return
    }

    try {
      const charCount = text.length
      const words = text.trim().split(/\s+/).filter(word => word.length > 0)
      const lines = text.split('\n').filter(line => line.trim().length > 0)
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      
      setStats({
        characters: charCount,
        words: words.length,
        lines: lines.length,
        sentences: sentences.length,
      })
    } catch (error) {
      console.error('Statistics calculation error:', error)
    }
  }, [text])

  // Process text based on toggles
  const processText = (inputText) => {
    let processed = inputText
    let lines = processed.split('\n')

    lines = lines.map(line => {
      let processedLine = line.trim()

      // Remove bullets
      if (removeBullets) {
        processedLine = processedLine.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s*/g, '')
      }

      // Remove emojis
      if (removeEmojis) {
        processedLine = processedLine.replace(/^\p{Emoji}\s*/gu, '')
        processedLine = processedLine.replace(/\p{Emoji}/gu, '')
      }

      // Add dots
      if (addDots && processedLine !== '' && !/[.!?]$/.test(processedLine)) {
        processedLine += '.'
      }

      // Remove code symbols
      if (removeCode) {
        processedLine = processedLine.replace(/\{\}/g, '')
        processedLine = processedLine.replace(/\{|\}/g, '')
      }

      // Clean AI markers
      if (cleanAI) {
        processedLine = processedLine.replace(/\[\[\w+\]\]/g, '')
        processedLine = processedLine.replace(/\{(\w+):[^}]*\}/g, '')
        processedLine = processedLine.replace(/[\u200B-\u200D\uFEFF]/g, '')
      }

      // Remove special characters
      if (removeSpecialChars) {
        processedLine = processedLine.replace(/\s+\-\s+/g, ', ')
        processedLine = processedLine.replace(/[^\w\s.,{}"-]/g, '')
        processedLine = processedLine.replace(/\s{2,}/g, ' ')
      }

      return processedLine
    })

    return lines.join('\n')
  }

  const handleTextChange = (e) => {
    const newText = e.target.value
    setText(processText(newText))
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(processText(clipboardText))
      showToast('Text pasted successfully!', 'success')
    } catch (err) {
      showToast('Failed to read clipboard. Please try again.', 'error')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Text copied to clipboard!', 'success')
    } catch (err) {
      showToast('Failed to copy text. Please try again.', 'error')
    }
  }

  const handleClear = () => {
    setText('')
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cleaned_text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Heading className="text-center text-white">Only Text</Heading>
          <p className="mt-2 text-center text-lg text-blue-100">
            Remove emojis, bullets, and special characters in one click
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/glossary" className="text-sm text-blue-100 hover:text-white hover:underline">
              📖 Glossary
            </Link>
            <Link href="/how-to-remove-emojis-from-linkedin" className="text-sm text-blue-100 hover:text-white hover:underline">
              💼 LinkedIn Guide
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button onClick={handlePaste}>Paste</Button>
          <Button onClick={handleCopy} outline>Copy</Button>
          <Button onClick={handleDownload} outline>Download</Button>
          <Button onClick={handleClear} color="red">Clear</Button>
        </div>

        {/* Text Area */}
        <div className="mb-6">
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Paste your text with emojis and characters here..."
            rows={15}
            className="font-mono"
          />
        </div>

        {/* Statistics Panel */}
        <div className="mb-8 grid grid-cols-2 gap-4 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Characters</div>
            <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.characters}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Words</div>
            <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.words}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Lines</div>
            <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.lines}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sentences</div>
            <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.sentences}</div>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            color={removeEmojis ? 'red' : 'green'}
            onClick={() => setRemoveEmojis(!removeEmojis)}
          >
            😁 Emoji
          </Button>
          <Button
            color={removeBullets ? 'red' : 'green'}
            onClick={() => setRemoveBullets(!removeBullets)}
          >
            • Bullets
          </Button>
          <Button
            color={addDots ? 'green' : 'zinc'}
            onClick={() => setAddDots(!addDots)}
          >
            . Dots
          </Button>
          <Button
            color={removeCode ? 'red' : 'green'}
            onClick={() => setRemoveCode(!removeCode)}
          >
            {'{}'} Code
          </Button>
          <Button
            color={cleanAI ? 'red' : 'zinc'}
            onClick={() => setCleanAI(!cleanAI)}
          >
            AI Clean
          </Button>
          <Button
            color={removeSpecialChars ? 'red' : 'zinc'}
            onClick={() => setRemoveSpecialChars(!removeSpecialChars)}
          >
            *_ Special
          </Button>
        </div>

        {/* Feature Cards - Dedicated Tools */}
        <div className="mb-12">
          <Heading level={2} className="mb-6">Dedicated Text Tools</Heading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/remove-emojis" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <div className="mb-3 text-3xl">😁</div>
              <h3 className="mb-2 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">Remove Emojis</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Remove all emojis from your text instantly. Perfect for professional documents.
              </p>
              <div className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                Try it →
              </div>
            </Link>
            <Link href="/remove-bullet-points" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <div className="mb-3 text-3xl">•</div>
              <h3 className="mb-2 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">Remove Bullet Points</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Remove bullets, dashes, and list markers from text instantly.
              </p>
              <div className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                Try it →
              </div>
            </Link>
            <Link href="/word-counter" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <div className="mb-3 text-3xl">📊</div>
              <h3 className="mb-2 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">Word Counter</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Count words, characters, sentences, and get reading time estimates.
              </p>
              <div className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                Try it →
              </div>
            </Link>
            <Link href="/character-counter" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <div className="mb-3 text-3xl">🔢</div>
              <h3 className="mb-2 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">Character Counter</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Count characters with detailed breakdown and statistics.
              </p>
              <div className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                Try it →
              </div>
            </Link>
            <Link href="/case-converter" className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-zinc-800">
              <div className="mb-3 text-3xl">Aa</div>
              <h3 className="mb-2 text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">Case Converter</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Convert text to uppercase, lowercase, title case, and more.
              </p>
              <div className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                Try it →
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Features */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="mb-3 text-3xl">•</div>
            <h3 className="mb-2 text-lg font-semibold">Bullet Points</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Removes list markers like dashes and bullets. When activated, a bullet point is added at the beginning of each item.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="mb-3 text-3xl">{'{}'}</div>
            <h3 className="mb-2 text-lg font-semibold">Code</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Removes code symbols and formatting from your text, such as braces and other programming symbols.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="mb-3 text-3xl">🤖</div>
            <h3 className="mb-2 text-lg font-semibold">AI Clean</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Eliminates AI traces and invisible characters added by AI tools.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="mb-3 text-3xl">*_</div>
            <h3 className="mb-2 text-lg font-semibold">Special Characters</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Removes special characters like @, #, %, &, etc., and eliminates extra spaces from your text.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <div className="mb-3 text-3xl">.</div>
            <h3 className="mb-2 text-lg font-semibold">Dots</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Adds or removes periods at the end of sentences, based on your preference.
            </p>
          </div>
        </div>

        {/* What is Only Text - AI Discoverability */}
        <div className="mt-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-zinc-800 dark:to-zinc-900">
          <Heading level={2} className="mb-4">What is Only Text?</Heading>
          <p className="mb-4 text-lg text-zinc-700 dark:text-zinc-300">
            Only Text is a free online text cleaning tool that removes emojis, bullet points, special characters, 
            and other unwanted formatting from your text. It processes everything in your browser, ensuring 
            complete privacy and instant results.
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Whether you're cleaning AI-generated content, preparing text for professional documents, or formatting 
            social media posts, Only Text provides powerful tools to transform messy text into clean, plain text 
            in seconds.
          </p>
        </div>

        {/* How to Use - AI Discoverability */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">How to Use Only Text in 3 Simple Steps</Heading>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold">Paste Your Text</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Copy your text with emojis, bullets, or special characters and paste it into the text box above. 
                You can also type directly or use the "Paste" button.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600 dark:bg-green-900 dark:text-green-300">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold">Choose Your Options</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Toggle the cleaning options you need. Red buttons mean the feature is active and will clean your text. 
                The text updates automatically as you type.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold">Copy or Download</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Click "Copy" to copy the cleaned text to your clipboard, or "Download" to save it as a .txt file. 
                Your cleaned text is ready to use anywhere!
              </p>
            </div>
          </div>
        </div>

        {/* Why Use Only Text - AI Discoverability */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">Why Use Only Text?</Heading>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">⚡ Save Time</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No more manual deleting. Remove emoji from text, bullet points, and other unwanted characters in seconds.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">📝 Plain Text Anywhere</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get a clean plain text output that's ready to use in emails, documents, or any platform – without weird formatting issues.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">🔒 Privacy-Friendly</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                All processing happens in your browser. We never see, store, or transmit your text data.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <h3 className="mb-2 text-lg font-semibold">🆓 Free & Easy</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                100% free online tool with no sign-up or installation. Just paste/import original text, and copy/download your cleaned text.
              </p>
            </div>
          </div>
        </div>

        {/* People Also Ask - AI Discoverability */}
        <div className="mt-12">
          <Heading level={2} className="mb-6">People Also Ask</Heading>
          <div className="space-y-4">
            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                How do I remove emojis from text?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                To remove emojis from text, simply paste your text into the Only Text tool above, make sure the "😁 Emoji" 
                button is red (active), and your text will be automatically cleaned. You can then copy or download the 
                emoji-free text. This works for all types of emojis including smileys, symbols, flags, and pictographs.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                Is Only Text free to use?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! Only Text is completely free to use with no sign-up required, no limits on usage, and no hidden fees. 
                All text processing happens in your browser, so there are no server costs or data storage involved.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                Is my text data safe and private?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Absolutely! All text processing happens entirely in your browser using JavaScript. Your text is never sent 
                to any server, stored in any database, or shared with anyone. This ensures complete privacy and security 
                for your sensitive documents.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                Can I use Only Text for professional documents?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! Only Text is perfect for professional use. Many users clean text for business emails, reports, 
                presentations, and official documents. It's especially useful for removing emojis and formatting from 
                AI-generated content before using it in professional contexts.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                What's the difference between word count and character count?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Word count counts the number of words in your text (separated by spaces), while character count counts 
                every individual character including letters, numbers, punctuation, and spaces. Character count is useful 
                for social media posts with character limits (like Twitter's 280 characters), while word count is better 
                for essays, articles, and documents.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                Can I remove bullet points and keep the text?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! The bullet point remover keeps all your text content and only removes the bullet symbols (•, -, *, etc.) 
                at the beginning of lines. This is perfect for converting lists to plain text while preserving the actual 
                content. Try our dedicated <Link href="/remove-bullet-points" className="text-blue-600 hover:underline dark:text-blue-400">Remove Bullet Points tool</Link> for more options.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                How do I clean AI-generated text?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                AI-generated text often contains special markers, formatting codes, or unwanted characters. Use Only Text 
                with the "🤖 AI Clean" option enabled to remove these traces. You can also enable emoji removal and special 
                character cleaning for comprehensive AI content cleaning.
              </p>
            </details>

            <details className="group rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
              <summary className="cursor-pointer text-lg font-semibold text-zinc-900 dark:text-white">
                Does Only Text work on mobile devices?
              </summary>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Yes! Only Text is fully responsive and works perfectly on smartphones and tablets. The interface adapts 
                to your screen size, and all features including paste, copy, and download work on mobile browsers.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            © 2025 Only Text. All rights reserved. Only Text is provided 'as is' and is not affiliated with OpenAI, LinkedIn, or any other platform.
          </p>
        </div>
      </footer>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
