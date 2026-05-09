'use client'

import { useState } from 'react'
import {
  Sparkle,
  ChatTeardropDots,
  Bug,
  GitBranch,
  Microphone,
  ArrowRight,
  CaretRight,
  ClockClockwise,
  ArrowCounterClockwise,
  SlidersHorizontal,
  Clock,
  Plus,
  Lightbulb,
  Globe,
  ArrowUp,
} from '@phosphor-icons/react'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDevHub } from '@/lib/devhub-context'
import { cn } from '@/lib/utils'

interface WelcomeScreenProps {
  onStartSession: (intent: string) => void
  onBrainstorm: () => void
  onLogBug: () => void
  onResumeSession?: () => void
}

const quickActions = [
  {
    id: 'brainstorm',
    icon: Sparkle,
    label: 'Brainstorm',
    description: 'Explore new ideas',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  {
    id: 'bug',
    icon: Bug,
    label: 'Fix a Bug',
    description: 'Squash that issue',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    id: 'continue',
    icon: GitBranch,
    label: 'Continue Work',
    description: 'Pick up where you left',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
]

const recentIssues = [
  { id: '1', title: 'GATT connection null on Sony Xperia', repo: 'nodelink-app', type: 'bug' },
  { id: '2', title: 'Add coroutine support to BLE service', repo: 'nodelink-app', type: 'enhancement' },
]

export function WelcomeScreen({ onStartSession, onBrainstorm, onLogBug, onResumeSession }: WelcomeScreenProps) {
  const { userEmail, currentProject, unfinishedSession, resumeSession, sessions, settings } = useDevHub()
  const [intent, setIntent] = useState('')
  const [recentIssuesState, setRecentIssues] = useState<typeof recentIssues>([])
  const [isListening, setIsListening] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<string[]>([])
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const lastSessionIntent = sessions?.[0]?.intent || ''

  const userName = settings.displayName || userEmail?.split('@')[0] || 'Developer'
  const greeting = getGreeting()

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const handleVoiceInput = () => {
    const SpeechRecognitionAPI =
      (typeof window !== 'undefined' &&
        ((window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition ||
          window.SpeechRecognition)) ||
      null

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
      }
      recognition.onend = () => {
        setIsListening(false)
      }
      recognition.onresult = (e: SpeechRecognitionEvent) => {
        const transcript = e.results[0][0].transcript
        setIntent((prev) => (prev ? prev + ' ' + transcript : transcript))
      }

      recognition.start()
    }
  }

  const handleAttachFile = () => {
    // Mock attaching a file
    const mockFiles = ['frontend/app.tsx', 'backend/api.py', 'styles/globals.css', 'README.md']
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)]
    if (!attachedFiles.includes(randomFile)) {
      setAttachedFiles(prev => [...prev, randomFile])
    }
  }

  const handleAddPrefix = (prefix: string) => {
    if (!intent.startsWith(`[${prefix}]`)) {
      setIntent(prev => `[${prefix}] ${prev.replace(/^\[.*?\]\s*/, '')}`)
    } else {
      setIntent(prev => prev.replace(/^\[.*?\]\s*/, ''))
    }
  }

  const handleQuickAction = (actionId: string) => {
    setSelectedAction(actionId)
    if (actionId === 'brainstorm') {
      onBrainstorm()
    } else if (actionId === 'bug') {
      onLogBug()
    }
  }

  const handleStartSession = () => {
    if (intent.trim()) {
      onStartSession(intent.trim())
    }
  }

  const handleResumeSession = () => {
    if (!unfinishedSession) return
    resumeSession(unfinishedSession)
    onResumeSession?.()
  }

  const handleIssueSelect = (issue: typeof recentIssues[0]) => {
    setIntent(`Fixing: ${issue.title}`)
    setSelectedAction('bug')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo and Greeting */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Sparkle className="h-10 w-10 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" weight="fill" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
              {greeting}, <span className="text-amber-500/90">{userName}</span>
            </h1>
            <p className="text-zinc-400 mt-3 max-w-md mx-auto leading-relaxed">
              Your digital dev-twin is ready. What's the mission for today's session?
            </p>
          </div>
        </div>

        {/* AI Suggestion Banner */}
        <div className="glass rounded-2xl p-5 shadow-2xl shadow-black/40 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <Sparkle className="h-16 w-16 text-amber-500" weight="fill" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
              <Brain className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Session Briefing</p>
                <div className="h-1 w-1 rounded-full bg-amber-500/40" />
                <span className="text-[10px] text-zinc-500 font-medium">Synced 2m ago</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Based on your recent activity, you might want to continue working on the{' '}
                <span className="text-amber-400 font-semibold underline underline-offset-4 decoration-amber-500/30">BLE service coroutine refactor</span>. Last session,
                you left a question about this unresolved.
              </p>
            </div>
          </div>
        </div>

        {/* ── Continue Where You Left Off ── */}
        {unfinishedSession && (
          <button
            onClick={handleResumeSession}
            className="glass glass-hover w-full flex items-center gap-4 rounded-2xl px-6 py-5 text-left active-scale group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 group-hover:border-green-500/40 transition-colors">
              <ArrowCounterClockwise className="h-6 w-6 text-green-400 group-hover:rotate-[-45deg] transition-transform duration-500" weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold text-green-400 uppercase tracking-widest">Resume Session</p>
                <span className="text-[10px] text-zinc-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Active 12h ago</span>
              </div>
              <p className="text-sm text-zinc-200 font-medium truncate group-hover:text-white transition-colors">
                {unfinishedSession.intent}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-green-500/50 group-hover:bg-green-500/10 transition-all duration-300">
              <CaretRight className="h-4 w-4 text-zinc-500 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" weight="bold" />
            </div>
          </button>
        )}

        {/* Minimal AI Prompt Input Area */}
        <div className="space-y-4">
          <div className={cn(
            "relative rounded-3xl glass shadow-2xl shadow-black/60 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/40 transition-all duration-500 overflow-hidden flex flex-col group/input",
            isListening ? "ring-2 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]" : ""
          )}>
            
            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300",
                  isListening ? "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-zinc-800/80 text-zinc-400 group-focus-within/input:text-amber-500 group-focus-within/input:bg-amber-500/10"
                )}>
                  <Sparkle className={cn("h-3 w-3", isListening ? "animate-pulse" : "")} weight="fill" />
                  {isListening ? "Listening..." : "DevHub Assistant"}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-all active-scale">
                        <SlidersHorizontal className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="glass text-white text-[10px] font-bold tracking-wider uppercase border-white/10">Settings</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-all active-scale">
                        <Clock className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="glass text-white text-[10px] font-bold tracking-wider uppercase border-white/10">Activity History</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Prompt Container */}
            <div className="flex flex-col min-h-[120px] max-h-[300px] overflow-y-auto p-5 space-y-4">
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map(file => (
                    <div key={file} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-3 pr-1.5 py-1 text-[11px] font-medium text-zinc-300 animate-in fade-in zoom-in-95 duration-300">
                      <span className="truncate max-w-[150px]">{file}</span>
                      <button 
                        onClick={() => setAttachedFiles(prev => prev.filter(f => f !== file))}
                        className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-red-400 transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder={lastSessionIntent ? `Last session: ${lastSessionIntent}\nDescribe your mission...` : "Describe your mission..."}
                className="resize-none border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 text-base p-0 leading-relaxed min-h-[80px]"
              />
            </div>
            
            {/* Auxiliary Actions Bar */}
            <div className="flex items-center justify-between px-4 pb-4 pt-1">
              <div className="flex items-center gap-1">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handleAttachFile} className="p-2.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-full transition-all active-scale">
                        <Plus className="h-5 w-5" weight="bold" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="glass text-white text-[10px] font-bold tracking-wider uppercase border-white/10">Attach context</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => handleAddPrefix('Brainstorming')}
                        className={cn(
                          "p-2.5 rounded-full transition-all active-scale",
                          intent.startsWith('[Brainstorming]') ? "text-amber-400 bg-amber-500/10" : "text-zinc-500 hover:text-amber-400 hover:bg-white/5"
                        )}
                      >
                        <Lightbulb className="h-5 w-5" weight="bold" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="glass text-white text-[10px] font-bold tracking-wider uppercase border-white/10">Brainstorming space</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => handleAddPrefix('Research')}
                        className={cn(
                          "p-2.5 rounded-full transition-all active-scale",
                          intent.startsWith('[Research]') ? "text-blue-400 bg-blue-500/10" : "text-zinc-500 hover:text-blue-400 hover:bg-white/5"
                        )}
                      >
                        <Globe className="h-5 w-5" weight="bold" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="glass text-white text-[10px] font-bold tracking-wider uppercase border-white/10">Deep research</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center gap-3">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={handleVoiceInput}
                        className={cn(
                          "p-3 rounded-full transition-all active-scale",
                          isListening ? "text-white bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse" : "text-zinc-500 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Microphone className="h-5 w-5" weight="bold" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="glass text-white text-[10px] font-bold tracking-wider uppercase border-white/10">Voice input</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <button
                  onClick={handleStartSession}
                  disabled={!intent.trim()}
                  className="group/btn flex items-center justify-center h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black transition-all active-scale shadow-xl shadow-amber-500/20"
                >
                  <ArrowUp className="h-6 w-6 transition-transform group-hover/btn:-translate-y-0.5" weight="bold" />
                </button>
              </div>
            </div>
          </div>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-2.5 px-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass glass-hover text-[11px] font-bold tracking-wider uppercase text-zinc-400 hover:text-white transition-all active-scale"
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Issues from GitHub */}
        {currentProject && (
          <div className="space-y-3 opacity-50 select-none pointer-events-none">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                Recent Issues from GitHub
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wide">Coming Soon</span>
              </p>
            </div>
            {/* 
              UI structure preserved for when real GitHub integration lands.
              Currently rendering empty placeholder to maintain layout intent.
            */}
            <div className="border border-dashed border-zinc-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <Bug className="h-6 w-6 text-zinc-600 mb-2" weight="duotone" />
              <p className="text-sm text-zinc-400">No active issues found</p>
              <p className="text-xs text-zinc-600 mt-1">Connect your repository to sync live issues here.</p>
            </div>
            
            {/* 
            <div className="space-y-2">
              {recentIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleIssueSelect(issue)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-800/30 transition-colors text-left group"
                >
                  <Bug className="h-4 w-4 text-red-400 shrink-0" weight="duotone" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{issue.title}</p>
                    <p className="text-xs text-zinc-500">{issue.repo}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs shrink-0',
                      issue.type === 'bug'
                        ? 'border-red-500/15 text-red-400'
                        : 'border-blue-500/15 text-blue-400'
                    )}
                  >
                    {issue.type}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" weight="bold" />
                </button>
              ))}
            </div>
            */}
          </div>
        )}
      </div>
    </div>
  )
}
