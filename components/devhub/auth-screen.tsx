'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  Mailbox,
  Lock,
  Eye,
  EyeSlash,
  ArrowRight,
  Check,
  X,
  User,
  WarningCircle,
  Code,
  ArrowUp,
  Sparkle,
  Activity,
} from '@phosphor-icons/react'
import { usePasswordStrength } from '@/hooks/use-password-strength'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

// Google Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

// GitHub Icon
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}


export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  const supabase = createClient()

  const strength = usePasswordStrength(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const newErrors: Record<string, string> = {}

      if (!validateEmail(email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (mode === 'signup') {
        if (!name.trim()) newErrors.name = 'Name is required'
        if (!passwordsMatch) newErrors.confirmPassword = 'Passwords do not match'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      setErrors({})
      setIsLoading(true)

      try {
        if (mode === 'signup') {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { display_name: name },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })
          if (error) throw error
          setIsVerificationSent(true)
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error) throw error
        }
      } catch (err: any) {
        setErrors({ form: err.message || 'An authentication error occurred' })
      } finally {
        setIsLoading(false)
      }
    },
    [email, password, confirmPassword, name, mode, passwordsMatch, supabase]
  )

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setErrors({ form: err.message })
      setIsLoading(false)
    }
  }

  const PasswordCheck = ({
    passed,
    label,
  }: {
    passed: boolean
    label: string
  }) => (
    <div
      className={cn(
        'flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300',
        passed ? 'text-green-400' : 'text-zinc-600'
      )}
    >
      <div
        className={cn(
          'flex h-3.5 w-3.5 items-center justify-center rounded-full transition-all duration-300',
          passed ? 'bg-green-500/20' : 'bg-white/5'
        )}
      >
        {passed ? <Check className="h-2 w-2" weight="bold" /> : <X className="h-2 w-2" weight="bold" />}
      </div>
      {label}
    </div>
  )

  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 overflow-hidden">
      
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <video 
          className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale-[0.5] contrast-[1.2]"
          src="/background_vid.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Main Auth Container */}
      <div className="relative z-10 w-full max-w-xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out-expo">
        
        {/* Branding Header */}
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-110">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Image 
                  src="/favicon_io/android-chrome-512x512.png" 
                  alt="DevHub Logo" 
                  width={64} 
                  height={64} 
                  className="relative z-10"
                />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              {mode === 'login' ? 'Initiate Linking Sequence' : 'Forge Neural Identity'}
            </h1>
            <p className="mt-4 text-zinc-500 font-medium text-lg">Synchronize with your digital development consciousness.</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-[40px] p-10 lg:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-white/10 relative overflow-hidden">
          {isVerificationSent ? (
            <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-2xl shadow-amber-500/10">
                <Mailbox className="h-12 w-12" weight="fill" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">Check your Neural Link</h2>
                <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                  We&apos;ve dispatched a synchronization key to <br/>
                  <span className="text-amber-500 font-bold">{email}</span>.
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full h-14 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all border border-transparent hover:border-white/5"
                onClick={() => setIsVerificationSent(false)}
              >
                Return to Sequence
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* SSO Strategy */}
              <div className="grid grid-cols-2 gap-6">
                <Button
                  type="button"
                  className="glass glass-hover h-14 rounded-2xl text-white font-bold text-[10px] uppercase tracking-widest active-scale transition-all"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <GoogleIcon className="mr-3 h-5 w-5" />
                  Google
                </Button>
                <Button
                  type="button"
                  className="glass glass-hover h-14 rounded-2xl text-white font-bold text-[10px] uppercase tracking-widest active-scale transition-all"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                >
                  <GitHubIcon className="mr-3 h-5 w-5" />
                  GitHub
                </Button>
              </div>

              {/* Protocol Splitter */}
              <div className="relative flex items-center gap-6">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Email Protocol</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {errors.form && (
                  <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-xs font-bold text-red-400 uppercase tracking-tight shadow-lg shadow-red-500/5">
                    <WarningCircle className="h-6 w-6 shrink-0" weight="fill" />
                    {errors.form}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Name Entry */}
                  {mode === 'signup' && (
                    <div className="space-y-3">
                      <label htmlFor="name" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Full Identifier</label>
                      <div className="relative group/field">
                        <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600 group-focus-within/field:text-amber-500 transition-colors" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="e.g. SATOSHI NAKAMOTO"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={cn(
                            'h-14 glass border-white/5 pl-12 text-white placeholder:text-zinc-700 rounded-2xl focus:ring-2 focus:ring-amber-500/20 transition-all text-base',
                            errors.name && 'border-red-500/40'
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Entry */}
                  <div className="space-y-3">
                    <label htmlFor="email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Neural Address</label>
                    <div className="relative group/field">
                      <Mailbox className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600 group-focus-within/field:text-amber-500 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="LINK@CORE.COM"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(
                          'h-14 glass border-white/5 pl-12 text-white placeholder:text-zinc-700 rounded-2xl focus:ring-2 focus:ring-amber-500/20 transition-all text-base',
                          errors.email && 'border-red-500/40'
                        )}
                      />
                    </div>
                  </div>

                  {/* Password Entry */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                       <label htmlFor="password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Access Key</label>
                       {mode === 'login' && (
                         <button type="button" className="text-[9px] font-bold text-amber-500/50 hover:text-amber-500 uppercase tracking-widest transition-colors">Recover?</button>
                       )}
                    </div>
                    <div className="relative group/field">
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600 group-focus-within/field:text-amber-500 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(
                          'h-14 glass border-white/5 pl-12 pr-12 text-white placeholder:text-zinc-700 rounded-2xl focus:ring-2 focus:ring-amber-500/20 transition-all text-base',
                          errors.password && 'border-red-500/40'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors p-2"
                      >
                        {showPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Complexity Gauge */}
                    {mode === 'signup' && password && (
                      <div className="space-y-4 pt-3 px-1 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center justify-between mb-1">
                           <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Entropy Level</span>
                           <span className={cn('text-[9px] font-bold uppercase tracking-widest', strength.score > 2 ? 'text-green-400' : 'text-amber-500')}>
                             {strength.label}
                           </span>
                        </div>
                        <div className="flex gap-2 h-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                'flex-1 rounded-full transition-all duration-700',
                                i < strength.score ? (strength.score > 2 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]') : 'bg-white/5'
                              )}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                          <PasswordCheck passed={strength.checks.length} label="Min 8 Chars" />
                          <PasswordCheck passed={strength.checks.lowercase} label="Lower Scale" />
                          <PasswordCheck passed={strength.checks.uppercase} label="Upper Scale" />
                          <PasswordCheck passed={strength.checks.number} label="Neural Digit" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verify Entry */}
                  {mode === 'signup' && (
                    <div className="space-y-3">
                      <label htmlFor="confirmPassword" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Checksum Key</label>
                      <div className="relative group/field">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-600 group-focus-within/field:text-amber-500 transition-colors" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={cn(
                            'h-14 glass border-white/5 pl-12 pr-12 text-white placeholder:text-zinc-700 rounded-2xl focus:ring-2 focus:ring-amber-500/20 transition-all text-base',
                            confirmPassword && !passwordsMatch && 'border-red-500/40',
                            passwordsMatch && 'border-green-500/40'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors p-2"
                        >
                          {showConfirmPassword ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Persistent Link toggle */}
                  {mode === 'login' && (
                    <div className="flex items-center gap-4 px-1 group cursor-pointer w-fit" onClick={() => setRememberMe(!rememberMe)}>
                      <div className={cn(
                        "h-6 w-6 rounded-xl border flex items-center justify-center transition-all duration-300",
                        rememberMe ? "bg-amber-500 border-amber-500 text-black shadow-xl shadow-amber-500/20" : "border-white/10 bg-white/5 group-hover:border-white/20"
                      )}>
                        {rememberMe && <Check weight="bold" className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">Persistent Neural Session</span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-16 w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] uppercase tracking-[0.4em] rounded-[24px] shadow-2xl shadow-amber-500/20 transition-all active-scale"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-4">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      <span>Synchronizing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 pl-4">
                      <span>{mode === 'login' ? 'Initiate Link' : 'Forge Identity'}</span>
                      <ArrowUp className="h-6 w-6 rotate-90" weight="bold" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Identity Switcher */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="group relative inline-flex flex-col items-center gap-2"
                >
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest transition-colors group-hover:text-zinc-400">
                    {mode === 'login' ? "New to the engine?" : "Already synchronized?"}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-[0.3em] pb-1 border-b border-amber-500/40 group-hover:border-amber-500 transition-all">
                    {mode === 'login' ? 'Create Neural ID' : 'Link Existing ID'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Integrity */}
        <div className="text-center space-y-4 opacity-40 hover:opacity-100 transition-opacity duration-1000">
          <div className="flex items-center justify-center gap-6">
             <Code weight="bold" className="h-4 w-4 text-zinc-500" />
             <div className="h-1 w-1 rounded-full bg-zinc-800" />
             <Sparkle weight="fill" className="h-4 w-4 text-zinc-500" />
             <div className="h-1 w-1 rounded-full bg-zinc-800" />
             <Activity weight="bold" className="h-4 w-4 text-zinc-500" />
          </div>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.5em]">System Integrity Secured · v1.5.0 Alpha</p>
        </div>
      </div>
    </div>
  )
}
