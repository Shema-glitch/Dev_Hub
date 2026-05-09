'use client'

import { useState } from 'react'
import { Target, Rocket, Clock, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useDevHub } from '@/lib/devhub-context'
import { generateBriefing } from '@/lib/mock-data'

const intentSuggestions = [
  'Fixing the auth bug in login flow',
  'Implementing the new dashboard feature',
  'Refactoring the API handlers',
  'Writing tests for user service',
  'Debugging the payment integration',
]

export function IntentDialog() {
  const { showIntentDialog, setShowIntentDialog, startSession, currentProject } = useDevHub()
  const [intent, setIntent] = useState('')

  const briefing = currentProject ? generateBriefing(currentProject) : null

  const handleStartSession = () => {
    if (!intent.trim()) return
    startSession(intent.trim())
    setIntent('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setIntent(suggestion)
  }

  return (
    <Dialog open={showIntentDialog} onOpenChange={setShowIntentDialog}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-zinc-100">
                Declare Your Intent
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                What are you working on this session?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Briefing from last session */}
        {briefing && (
          <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-zinc-300">
                Where you left off
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{briefing}</p>
          </div>
        )}

        <div className="space-y-4 mt-2">
          {/* Intent Input */}
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">
              Today&apos;s Mission
            </label>
            <Textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="E.g., Fixing the ghost padding issue in RadarScreen..."
              className="min-h-[80px] bg-zinc-800/50 border-zinc-800 focus:border-zinc-600 text-zinc-200 placeholder:text-zinc-500 resize-none"
            />
          </div>

          {/* Suggestions */}
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block uppercase tracking-wider">
              Quick suggestions
            </label>
            <div className="flex flex-wrap gap-2">
              {intentSuggestions.slice(0, 3).map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer border-zinc-800 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Pomodoro Info */}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Clock className="h-4 w-4" />
            <span>A 25-minute focus timer will start automatically</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-400 hover:text-zinc-200"
              onClick={() => setShowIntentDialog(false)}
            >
              Skip for now
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
              onClick={handleStartSession}
              disabled={!intent.trim()}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
