'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mail, RefreshCw, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react'

interface EmailConfirmationProps {
  email: string
  onBack: () => void
  onVerified: () => void
}

export function EmailConfirmation({
  email,
  onBack,
  onVerified,
}: EmailConfirmationProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all digits are entered
    if (newCode.every((digit) => digit !== '') && newCode.join('').length === 6) {
      verifyCode(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
      verifyCode(pastedData)
    }
  }

  const verifyCode = async (fullCode: string) => {
    setIsVerifying(true)
    setError('')

    // Simulate API verification
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Demo: Accept "123456" as valid code
    if (fullCode === '123456') {
      setIsVerified(true)
      setTimeout(onVerified, 1500)
    } else {
      setError('Invalid verification code. Try 123456')
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setResendCooldown(60)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-zinc-100">Email Verified!</h2>
          <p className="text-zinc-400">
            Your account has been successfully created
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <Sparkles className="h-4 w-4" />
          <span>Redirecting to dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100">Check your email</h2>
        <p className="text-sm text-zinc-400">
          We sent a verification code to
        </p>
        <p className="font-medium text-zinc-200">{email}</p>
      </div>

      {/* Code Input */}
      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isVerifying}
              className={cn(
                'h-14 w-12 rounded-lg border-2 bg-zinc-900/50 text-center text-xl font-bold text-zinc-100',
                'outline-none transition-all duration-200',
                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                'disabled:opacity-50',
                error
                  ? 'border-red-500/50 animate-shake'
                  : digit
                    ? 'border-primary/50'
                    : 'border-zinc-800'
              )}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-red-400 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}

        {isVerifying && (
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-primary" />
            <span>Verifying...</span>
          </div>
        )}
      </div>

      {/* Resend */}
      <div className="text-center">
        <p className="text-sm text-zinc-500">
          {"Didn't receive the code?"}
        </p>
        <Button
          variant="ghost"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="mt-2 text-primary hover:text-primary/80"
        >
          <RefreshCw
            className={cn('mr-2 h-4 w-4', resendCooldown > 0 && 'animate-spin')}
          />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </Button>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="w-full text-zinc-400 hover:text-zinc-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to signup
      </Button>

      {/* Hint */}
      <p className="text-center text-xs text-zinc-600">
        Demo: Enter <span className="font-mono text-zinc-400">123456</span> to verify
      </p>
    </div>
  )
}
