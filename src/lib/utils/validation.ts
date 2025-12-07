// ============================================================================
// FILE: src/lib/utils/validation.ts
// ============================================================================
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export const validatePhone = (phone: string): boolean => {
    // Sierra Leone phone format: +232 XX XXX XXX
    const phoneRegex = /^\+232\s?\d{2}\s?\d{3}\s?\d{3,4}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }
  
  export const validateRegistrationNumber = (regNum: string): boolean => {
    // Format: SL-YYYY-XXXXXX
    const regNumRegex = /^SL-\d{4}-\d{6}$/
    return regNumRegex.test(regNum)
  }
  
  export const validateWebsite = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  export interface ValidationError {
    field: string
    message: string
  }
  
  export function validateBusinessForm(data: any): ValidationError[] {
    const errors: ValidationError[] = []
  
    if (!data.name || data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Business name must be at least 2 characters' })
    }
  
    if (!validateRegistrationNumber(data.registration_number)) {
      errors.push({ field: 'registration_number', message: 'Invalid registration number format (SL-YYYY-XXXXXX)' })
    }
  
    if (!data.address || data.address.trim().length < 5) {
      errors.push({ field: 'address', message: 'Address must be at least 5 characters' })
    }
  
    if (data.email && !validateEmail(data.email)) {
      errors.push({ field: 'email', message: 'Invalid email address' })
    }
  
    if (data.phone && !validatePhone(data.phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format (+232 XX XXX XXX)' })
    }
  
    if (data.website && !validateWebsite(data.website)) {
      errors.push({ field: 'website', message: 'Invalid website URL' })
    }
  
    return errors
  }