'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // You can send to Google Analytics, Vercel Analytics, etc.
      const body = JSON.stringify(metric)
      const url = '/api/analytics'
      
      // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body)
      } else {
        fetch(url, { body, method: 'POST', keepalive: true })
      }
    }
  })

  return null
}
