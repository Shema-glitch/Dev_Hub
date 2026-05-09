'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Rocket,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react'

interface WelcomeDashboardProps {
  email: string
}

export function WelcomeDashboard({ email }: WelcomeDashboardProps) {
  const [showContent, setShowContent] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    setShowContent(true)
  }, [])

  const handleCompleteStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
  }

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Build and deploy in seconds',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Your data is always protected',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Rocket,
      title: 'Scale Instantly',
      description: 'From zero to millions of users',
      color: 'from-primary to-purple-500',
    },
  ]

  const quickStartSteps = [
    { id: 1, title: 'Complete your profile', description: 'Add your details' },
    { id: 2, title: 'Create your first project', description: 'Start building' },
    { id: 3, title: 'Invite team members', description: 'Collaborate together' },
  ]

  return (
    <div
      className={cn(
        'space-y-8 transition-all duration-700',
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <Star className="h-4 w-4 fill-primary" />
          <span>Welcome aboard!</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-100">
          {"You're all set, "}
          <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
            {email.split('@')[0]}
          </span>
          !
        </h1>
        <p className="text-zinc-400">
          Your account is ready. Let&apos;s get you started.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={cn(
              'group relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5',
              'hover:border-zinc-700/50 hover:bg-zinc-900/50',
              'transition-all duration-300',
              'animate-in fade-in slide-in-from-bottom-4'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                'mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg',
                'bg-gradient-to-br',
                feature.color
              )}
            >
              <feature.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-zinc-200">{feature.title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{feature.description}</p>
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300',
                feature.color,
                'group-hover:opacity-5'
              )}
            />
          </div>
        ))}
      </div>

      {/* Quick Start */}
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-zinc-200">Quick Start</h2>
        </div>
        <div className="space-y-3">
          {quickStartSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center justify-between rounded-lg border border-zinc-800/50 p-4',
                'transition-all duration-300',
                completedSteps.includes(step.id)
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-zinc-900/50 hover:bg-zinc-800/50'
              )}
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300',
                    completedSteps.includes(step.id)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  )}
                >
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      'font-medium transition-colors',
                      completedSteps.includes(step.id)
                        ? 'text-emerald-400'
                        : 'text-zinc-200'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-zinc-500">{step.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={completedSteps.includes(step.id) ? 'ghost' : 'outline'}
                onClick={() => handleCompleteStep(step.id)}
                disabled={completedSteps.includes(step.id)}
                className={cn(
                  'transition-all duration-300',
                  completedSteps.includes(step.id) && 'text-emerald-400'
                )}
              >
                {completedSteps.includes(step.id) ? 'Done' : 'Start'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button
        className={cn(
          'w-full h-12',
          'bg-gradient-to-r from-primary via-primary to-purple-500',
          'hover:from-primary/90 hover:via-primary hover:to-purple-500/90',
          'shadow-lg shadow-primary/20',
          'transition-all duration-300'
        )}
      >
        <span>Go to Dashboard</span>
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
