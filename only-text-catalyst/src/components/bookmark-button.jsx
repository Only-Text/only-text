'use client'

import { useState, useEffect } from 'react'
import { BookmarkIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

export function BookmarkButton() {
  const [showTooltip, setShowTooltip] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  const handleBookmark = () => {
    // Check if browser supports bookmarking
    if (window.sidebar && window.sidebar.addPanel) {
      // Firefox
      window.sidebar.addPanel(
        'Only Text - Free Text Tools',
        window.location.href,
        ''
      )
      setIsBookmarked(true)
    } else if (window.external && 'AddFavorite' in window.external) {
      // IE
      window.external.AddFavorite(
        window.location.href,
        'Only Text - Free Text Tools'
      )
      setIsBookmarked(true)
    } else if (window.opera && window.print) {
      // Opera
      const elem = document.createElement('a')
      elem.setAttribute('href', window.location.href)
      elem.setAttribute('title', 'Only Text - Free Text Tools')
      elem.setAttribute('rel', 'sidebar')
      elem.click()
      setIsBookmarked(true)
    } else {
      // For Chrome, Safari, and other modern browsers
      // Show beautiful modal with instructions
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setIsBookmarked(true)
  }

  return (
    <>
      {/* Bookmark Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && !showModal && (
            <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white shadow-xl dark:bg-white dark:text-zinc-900">
              <div className="font-semibold mb-1">Bookmark this page</div>
              <div className="text-zinc-300 dark:text-zinc-600">
                Save Only Text to your favorites for quick access to all tools
              </div>
              {/* Arrow */}
              <div className="absolute top-full right-6 -mt-1">
                <div className="border-8 border-transparent border-t-zinc-900 dark:border-t-white" />
              </div>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleBookmark}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="group flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            aria-label="Bookmark this page"
          >
            {isBookmarked ? (
              <BookmarkSolidIcon className="h-6 w-6" />
            ) : (
              <BookmarkIcon className="h-6 w-6" />
            )}
            
            {/* Pulse animation on hover */}
            <span className="absolute inset-0 rounded-full bg-purple-600 opacity-0 group-hover:animate-ping" />
          </button>
        </div>
      </div>

      {/* Beautiful Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="relative max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                <BookmarkIcon className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-3">
              Bookmark Only Text
            </h3>

            {/* Description */}
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">
              Save this page to your favorites for quick access to all text tools
            </p>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Press this keyboard shortcut:
                </p>
                <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-lg px-6 py-3 shadow-sm">
                  <kbd className="px-3 py-2 text-lg font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-700 rounded border-2 border-zinc-300 dark:border-zinc-600">
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd>
                  <span className="text-2xl text-zinc-400">+</span>
                  <kbd className="px-3 py-2 text-lg font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-700 rounded border-2 border-zinc-300 dark:border-zinc-600">
                    D
                  </kbd>
                </div>
              </div>
            </div>

            {/* Alternative */}
            <div className="text-center text-sm text-zinc-500 dark:text-zinc-500 mb-6">
              Or click the ⭐ star icon in your browser's address bar
            </div>

            {/* Got it button */}
            <button
              onClick={closeModal}
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
