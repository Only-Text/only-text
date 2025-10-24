'use client'

import { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showButton, setShowButton] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowButton(false)
      setShowModal(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show modal with instructions for browsers that don't support install prompt
      setShowModal(true)
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setShowButton(false)
    }

    setDeferredPrompt(null)
  }

  if (isInstalled) {
    return null // Don't show button if already installed
  }

  if (!showButton) {
    return null // Don't show button if install prompt not available
  }

  return (
    <>
      {/* Install Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && !showModal && (
            <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white shadow-xl dark:bg-white dark:text-zinc-900">
              <div className="font-semibold mb-1">Install Only Text</div>
              <div className="text-zinc-300 dark:text-zinc-600">
                Add to your home screen for quick access to all tools
              </div>
              {/* Arrow */}
              <div className="absolute top-full right-6 -mt-1">
                <div className="border-8 border-transparent border-t-zinc-900 dark:border-t-white" />
              </div>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleInstall}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="group flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            aria-label="Install app"
          >
            <ArrowDownTrayIcon className="h-6 w-6" />
            
            {/* Pulse animation on hover */}
            <span className="absolute inset-0 rounded-full bg-purple-600 opacity-0 group-hover:animate-ping" />
          </button>
        </div>
      </div>

      {/* Install Modal (for browsers without install prompt) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                <ArrowDownTrayIcon className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-3">
              Install Only Text
            </h3>

            {/* Description */}
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">
              Add Only Text to your home screen for quick access to all text tools
            </p>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 mb-6">
              <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Chrome/Edge:</strong> Click the menu (⋮) → "Install Only Text"
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Safari (iOS):</strong> Tap Share → "Add to Home Screen"
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Firefox:</strong> Look for the install icon in the address bar
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              ✨ Works offline • ⚡ Faster loading • 📱 Native app feel
            </div>

            {/* Got it button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
