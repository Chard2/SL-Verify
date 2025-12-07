// ============================================================================
// FILE: src/lib/utils/qrcode.ts
// QR Code utility functions for business verification
// ============================================================================
import QRCode from 'qrcode'

/**
 * Generate a QR code data URL from a text string
 * @param text - The text to encode in the QR code
 * @param options - Optional QR code generation options
 * @returns Promise resolving to a data URL string (base64 image)
 */
export async function generateQRCode(
  text: string,
  options?: {
    width?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
  }
): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M' as const,
    type: 'image/png' as const
  }

  const qrOptions = {
    ...defaultOptions,
    ...options,
    color: {
      ...defaultOptions.color,
      ...options?.color
    }
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, qrOptions)
    return dataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate a QR code as a buffer (for server-side use)
 * @param text - The text to encode in the QR code
 * @param options - Optional QR code generation options
 * @returns Promise resolving to a Buffer
 */
export async function generateQRCodeBuffer(
  text: string,
  options?: {
    width?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
  }
): Promise<Buffer> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M' as const,
    type: 'image/png' as const
  }

  const qrOptions = {
    ...defaultOptions,
    ...options,
    color: {
      ...defaultOptions.color,
      ...options?.color
    }
  }

  try {
    const buffer = await QRCode.toBuffer(text, qrOptions)
    return buffer
  } catch (error) {
    console.error('Error generating QR code buffer:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Get the verification URL for a business
 * @param businessId - The UUID of the business
 * @returns The full URL to the business verification page
 */
export function getBusinessVerificationURL(businessId: string): string {
  // Prioritize environment variable for production/deployment
  // This ensures QR codes work when scanned from different devices/networks
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  
  return `${baseUrl}/business/${businessId}`
}

/**
 * Generate a QR code for a business verification URL
 * @param businessId - The UUID of the business
 * @param options - Optional QR code generation options
 * @returns Promise resolving to a data URL string
 */
export async function generateBusinessQRCode(
  businessId: string,
  options?: {
    width?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
  }
): Promise<string> {
  const url = getBusinessVerificationURL(businessId)
  return generateQRCode(url, options)
}

