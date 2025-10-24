// IP-based rate limiter with daily limits
// Prevents API key abuse and excessive usage

const rateLimitMap = new Map()

// Configuration
const LIMITS = {
  REQUESTS_PER_DAY: 50,        // 50 requests per IP per day
  REQUESTS_PER_HOUR: 10,       // 10 requests per IP per hour
  REQUESTS_PER_MINUTE: 5,      // 5 requests per IP per minute (burst protection)
  WINDOW_DAY: 24 * 60 * 60 * 1000,      // 24 hours
  WINDOW_HOUR: 60 * 60 * 1000,          // 1 hour
  WINDOW_MINUTE: 60 * 1000,             // 1 minute
}

// Get client IP from request
export function getClientIP(request) {
  // Try various headers for IP (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const cfConnecting = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (real) {
    return real
  }
  if (cfConnecting) {
    return cfConnecting
  }
  
  return 'unknown'
}

// Check if IP is rate limited
export function checkRateLimit(ip) {
  const now = Date.now()
  
  // Get or create rate limit data for this IP
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      daily: [],
      hourly: [],
      minute: [],
    })
  }
  
  const limits = rateLimitMap.get(ip)
  
  // Clean up old timestamps
  limits.daily = limits.daily.filter(time => now - time < LIMITS.WINDOW_DAY)
  limits.hourly = limits.hourly.filter(time => now - time < LIMITS.WINDOW_HOUR)
  limits.minute = limits.minute.filter(time => now - time < LIMITS.WINDOW_MINUTE)
  
  // Check limits
  if (limits.daily.length >= LIMITS.REQUESTS_PER_DAY) {
    return {
      allowed: false,
      reason: 'daily_limit',
      limit: LIMITS.REQUESTS_PER_DAY,
      remaining: 0,
      resetIn: LIMITS.WINDOW_DAY - (now - limits.daily[0]),
    }
  }
  
  if (limits.hourly.length >= LIMITS.REQUESTS_PER_HOUR) {
    return {
      allowed: false,
      reason: 'hourly_limit',
      limit: LIMITS.REQUESTS_PER_HOUR,
      remaining: 0,
      resetIn: LIMITS.WINDOW_HOUR - (now - limits.hourly[0]),
    }
  }
  
  if (limits.minute.length >= LIMITS.REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      reason: 'burst_limit',
      limit: LIMITS.REQUESTS_PER_MINUTE,
      remaining: 0,
      resetIn: LIMITS.WINDOW_MINUTE - (now - limits.minute[0]),
    }
  }
  
  // Add current timestamp
  limits.daily.push(now)
  limits.hourly.push(now)
  limits.minute.push(now)
  
  return {
    allowed: true,
    remaining: {
      daily: LIMITS.REQUESTS_PER_DAY - limits.daily.length,
      hourly: LIMITS.REQUESTS_PER_HOUR - limits.hourly.length,
      minute: LIMITS.REQUESTS_PER_MINUTE - limits.minute.length,
    }
  }
}

// Format time remaining
export function formatResetTime(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }
  return `${seconds} second${seconds > 1 ? 's' : ''}`
}

// Clean up old entries periodically (run every hour)
setInterval(() => {
  const now = Date.now()
  for (const [ip, limits] of rateLimitMap.entries()) {
    limits.daily = limits.daily.filter(time => now - time < LIMITS.WINDOW_DAY)
    limits.hourly = limits.hourly.filter(time => now - time < LIMITS.WINDOW_HOUR)
    limits.minute = limits.minute.filter(time => now - time < LIMITS.WINDOW_MINUTE)
    
    // Remove IP if no recent requests
    if (limits.daily.length === 0) {
      rateLimitMap.delete(ip)
    }
  }
}, 60 * 60 * 1000) // Every hour
