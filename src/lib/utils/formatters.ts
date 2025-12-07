// ============================================================================
// FILE: src/lib/utils/formatters.ts
// ============================================================================
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null
  
  if (typeof date === 'string') {
    const trimmed = date.trim()
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return null
    }
    
    // PostgreSQL DATE format is YYYY-MM-DD, parseISO handles this
    // But we need to ensure it's treated as UTC to avoid timezone issues
    try {
      const parsed = parseISO(trimmed)
      if (isValid(parsed)) {
        return parsed
      }
      
      // Fallback: try new Date for other formats
      const fallback = new Date(trimmed)
      if (isValid(fallback)) {
        return fallback
      }
    } catch {
      return null
    }
    
    return null
  }
  
  // Already a Date object
  if (date instanceof Date) {
    return isValid(date) ? date : null
  }
  
  return null
}

export function formatDate(date: string | Date | null | undefined, formatString: string = 'MMM dd, yyyy'): string {
  const dateObj = parseDate(date)
  
  if (!dateObj) {
    return 'N/A'
  }
  
  try {
    return format(dateObj, formatString)
  } catch {
    return 'N/A'
  }
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  const dateObj = parseDate(date)
  
  if (!dateObj) {
    return 'N/A'
  }
  
  try {
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch {
    return 'N/A'
  }
}

export function formatPhoneNumber(phone: string): string {
  // Format: +232 XX XXX XXX
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('232')) {
    const match = cleaned.match(/^(232)(\d{2})(\d{3})(\d{3,4})$/)
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`
    }
  }
  return phone
}

export function formatCurrency(amount: number, currency: string = 'SLL'): string {
  return new Intl.NumberFormat('en-SL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount)
}