'use client'

import { useMemo } from 'react'

export interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
  checks: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    number: boolean
    special: boolean
  }
}

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }

    const passedChecks = Object.values(checks).filter(Boolean).length

    let score = 0
    let label = 'Too weak'
    let color = 'bg-red-500'

    if (passedChecks >= 5) {
      score = 4
      label = 'Very strong'
      color = 'bg-emerald-500'
    } else if (passedChecks >= 4) {
      score = 3
      label = 'Strong'
      color = 'bg-green-500'
    } else if (passedChecks >= 3) {
      score = 2
      label = 'Medium'
      color = 'bg-amber-500'
    } else if (passedChecks >= 2) {
      score = 1
      label = 'Weak'
      color = 'bg-orange-500'
    }

    return { score, label, color, checks }
  }, [password])
}
