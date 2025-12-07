// ============================================================================
// FILE: src/lib/utils/similarity.ts
// ============================================================================
export function calculateLevenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length
    const matrix: number[][] = []
  
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i]
    }
  
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }
  
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
      }
    }
  
    return matrix[len1][len2]
  }
  
  export function calculateSimilarityScore(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim()
    const s2 = str2.toLowerCase().trim()
    
    const maxLen = Math.max(s1.length, s2.length)
    if (maxLen === 0) return 100
    
    const distance = calculateLevenshteinDistance(s1, s2)
    return Math.round(((maxLen - distance) / maxLen) * 100)
  }
  
  export function normalizeBusinessName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(ltd|limited|inc|incorporated|corp|corporation|llc|plc)\b/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  export interface SimilarityMatch {
    name: string
    registration_number: string
    similarity_score: number
    risk_level: 'high' | 'medium' | 'low'
  }
  
  export function getRiskLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 85) return 'high'
    if (score >= 70) return 'medium'
    return 'low'
  }