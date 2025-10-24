'use client'

import { useState } from 'react'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

export function BookmarkButton() {
  const [showTooltip, setShowTooltip] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

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
      // Show instructions since they don't support programmatic bookmarking
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const shortcut = isMac ? 'Cmd+D' : 'Ctrl+D'
      
      alert(
        `To bookmark this page:\n\n` +
        `Press ${shortcut}\n\n` +
        `Or click the star icon in your browser's address bar.`
      )
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Tooltip */}
        {showTooltip && (
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
  )
}
