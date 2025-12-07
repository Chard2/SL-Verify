// ============================================================================
// FILE: src/lib/constants.ts
// ============================================================================
export const BUSINESS_STATUSES = {
    verified: { label: 'Verified', color: 'green' },
    provisionally_verified: { label: 'Provisionally Verified', color: 'yellow' },
    unverified: { label: 'Unverified', color: 'gray' },
    under_review: { label: 'Under Review', color: 'blue' }
  } as const
  
  export const REGIONS = [
    'Western Area',
    'Northern Province',
    'Southern Province',
    'Eastern Province',
    'North West Province'
  ] as const
  
  export const SECTORS = [
    'Agriculture',
    'Mining',
    'Manufacturing',
    'Construction',
    'Trade & Commerce',
    'Transport',
    'Hospitality',
    'Technology',
    'Healthcare',
    'Education',
    'Financial Services',
    'Professional Services',
    'Import/Export',
    'Real Estate',
    'Other'
  ] as const
  
  export const ITEMS_PER_PAGE = 20
  
  export const SIMILARITY_THRESHOLD = 0.70
  
  export const BADGE_SIZES = {
    small: { width: 150, height: 50 },
    medium: { width: 200, height: 65 },
    large: { width: 250, height: 80 }
  } as const