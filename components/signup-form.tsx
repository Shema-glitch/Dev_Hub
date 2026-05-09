'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePasswordStrength } from '@/hooks/use-password-strength'
import { cn } from '@/lib/utils'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowRight,
  Sparkles,
  User,
} from 'lucide-react'

interface SignupFormProps {
  onSuccess: (email: string) => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const strength = usePasswordStrength(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const newErrors: Record<string, string> = {}

      if (!name.trim()) {
        newErrors.name = 'Name is required'
      }

      if (!validateEmail(email)) {
        newErrors.email = 'Please enter a valid email'
      }

      if (strength.score < 2) {
        newErrors.password = 'Password is too weak'
      }

      if (!passwordsMatch) {
        newErrors.confirmPassword = 'Passwords do not match'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      setErrors({})
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsLoading(false)
      onSuccess(email)
    },
    [name, email, password, confirmPassword, strength.score, passwordsMatch, onSuccess]
  )

  const PasswordCheck = ({
    passed,
    label,
  }: {
    passed: boolean
    label: string
  }) => (
    <div
      className={cn(
        'flex items-center gap-2 text-xs transition-all duration-300',
        passed ? 'text-emerald-400' : 'text-zinc-500'
      )}
    >
      <div
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-full transition-all duration-300',
          passed ? 'bg-emerald-500/20' : 'bg-zinc-800'
        )}
      >
        {passed ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
      </div>
      {label}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-300">
          Full name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-zinc-100 placeholder:text-zinc-600',
              'focus-visible:border-primary/50 focus-visible:ring-primary/20',
              'transition-all duration-300',
              errors.name && 'border-red-500/50 focus-visible:border-red-500/50'
            )}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              'h-11 border-zinc-800 bg-zinc-900/50 pl-10 text-zinc-100 placeholder:text-zinc-600',
              'focus-visible:border-primary/50 focus-visible:ring-primary/20',
              'transition-all duration-300',
              errors.email && 'border-red-500/50 focus-visible:border-red-500/50'
            )}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-300">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              'h-11 border-zinc-800 bg-zinc-900/50 pl-10 pr-10 text-zinc-100 placeholder:text-zinc-600',
              'focus-visible:border-primary/50 focus-visible:ring-primary/20',
              'transition-all duration-300',
              errors.password && 'border-red-500/50 focus-visible:border-red-500/50'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-all duration-500',
                      i < strength.score ? strength.color : 'bg-zinc-800'
                    )}
                  />
                ))}
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300',
                  strength.score >= 3
                    ? 'text-emerald-400'
                    : strength.score >= 2
                      ? 'text-amber-400'
                      : 'text-red-400'
                )}
              >
                {strength.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <PasswordCheck passed={strength.checks.length} label="8+ characters" />
              <PasswordCheck passed={strength.checks.lowercase} label="Lowercase" />
              <PasswordCheck passed={strength.checks.uppercase} label="Uppercase" />
              <PasswordCheck passed={strength.checks.number} label="Number" />
              <PasswordCheck passed={strength.checks.special} label="Special char" />
            </div>
          </div>
        )}

        {errors.password && (
          <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-zinc-300"
        >
          Confirm password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={cn(
              'h-11 border-zinc-800 bg-zinc-900/50 pl-10 pr-10 text-zinc-100 placeholder:text-zinc-600',
              'focus-visible:border-primary/50 focus-visible:ring-primary/20',
              'transition-all duration-300',
              confirmPassword && !passwordsMatch && 'border-red-500/50',
              passwordsMatch && 'border-emerald-500/50'
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {confirmPassword && (
          <p
            className={cn(
              'text-xs animate-in fade-in slide-in-from-top-1',
              passwordsMatch ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {passwordsMatch ? 'Passwords match!' : 'Passwords do not match'}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className={cn(
          'relative h-11 w-full overflow-hidden',
          'bg-gradient-to-r from-primary via-primary to-primary/80',
          'hover:from-primary/90 hover:via-primary hover:to-primary',
          'transition-all duration-300',
          'shadow-lg shadow-primary/20',
          'disabled:opacity-70'
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Creating account...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Create account</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </Button>

      {/* Terms */}
      <p className="text-center text-xs text-zinc-500">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </form>
  )
}
