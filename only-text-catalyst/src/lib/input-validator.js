// Input validation and sanitization
// Prevents malicious input and excessive API usage

const MAX_LENGTHS = {
  improve: 10000,      // 10K characters for text improvement
  grammar: 10000,      // 10K characters for grammar check
  tone: 10000,         // 10K characters for tone conversion
  summarize: 50000,    // 50K characters for summarization
}

const MIN_LENGTH = 10 // Minimum 10 characters

// Validate text input
export function validateTextInput(text, type = 'improve') {
  const errors = []
  
  // Check if text exists
  if (!text || typeof text !== 'string') {
    errors.push('Text is required')
    return { valid: false, errors }
  }
  
  // Trim whitespace
  const trimmed = text.trim()
  
  // Check minimum length
  if (trimmed.length < MIN_LENGTH) {
    errors.push(`Text must be at least ${MIN_LENGTH} characters`)
  }
  
  // Check maximum length
  const maxLength = MAX_LENGTHS[type] || MAX_LENGTHS.improve
  if (trimmed.length > maxLength) {
    errors.push(`Text must be less than ${maxLength.toLocaleString()} characters`)
  }
  
  // Check for suspicious patterns (potential abuse)
  if (isSuspiciousInput(trimmed)) {
    errors.push('Input contains suspicious patterns')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: sanitizeText(trimmed),
  }
}

// Sanitize text input
function sanitizeText(text) {
  // Remove null bytes
  let sanitized = text.replace(/\0/g, '')
  
  // Remove excessive whitespace (but preserve intentional spacing)
  sanitized = sanitized.replace(/\s{10,}/g, ' '.repeat(5))
  
  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  return sanitized
}

// Detect suspicious input patterns
function isSuspiciousInput(text) {
  // Check for repeated characters (potential spam)
  const repeatedChars = /(.)\1{100,}/
  if (repeatedChars.test(text)) {
    return true
  }
  
  // Check for excessive special characters
  const specialChars = text.match(/[^a-zA-Z0-9\s.,!?;:'"()-]/g)
  if (specialChars && specialChars.length > text.length * 0.5) {
    return true
  }
  
  // Check for potential code injection
  const codePatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
  ]
  
  for (const pattern of codePatterns) {
    if (pattern.test(text)) {
      return true
    }
  }
  
  return false
}

// Validate tone parameter
export function validateTone(tone) {
  const validTones = ['professional', 'casual', 'friendly', 'formal', 'confident', 'empathetic']
  
  if (!tone || typeof tone !== 'string') {
    return { valid: false, error: 'Tone is required' }
  }
  
  if (!validTones.includes(tone.toLowerCase())) {
    return { valid: false, error: 'Invalid tone selected' }
  }
  
  return { valid: true, sanitized: tone.toLowerCase() }
}

// Validate summary length
export function validateSummaryLength(length) {
  const validLengths = ['short', 'medium', 'long']
  
  if (!length || typeof length !== 'string') {
    return { valid: false, error: 'Summary length is required' }
  }
  
  if (!validLengths.includes(length.toLowerCase())) {
    return { valid: false, error: 'Invalid summary length' }
  }
  
  return { valid: true, sanitized: length.toLowerCase() }
}

// Estimate API cost (to prevent excessive usage)
export function estimateAPICost(text, type = 'improve') {
  const charCount = text.length
  
  // Rough cost estimates (in tokens)
  const tokenEstimate = Math.ceil(charCount / 4) // ~4 chars per token
  
  // Cost multipliers by type
  const multipliers = {
    improve: 1.5,     // Input + output
    grammar: 1.5,     // Input + output
    tone: 1.5,        // Input + output
    summarize: 1.2,   // Input + shorter output
  }
  
  const multiplier = multipliers[type] || 1
  const estimatedTokens = Math.ceil(tokenEstimate * multiplier)
  
  return {
    characters: charCount,
    estimatedTokens,
    estimatedCost: estimatedTokens * 0.000001, // Rough cost in USD
  }
}
