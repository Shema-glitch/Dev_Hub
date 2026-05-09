'use client'

import { useState } from 'react'
import {
  Brain,
  FileCode,
  GitCommit,
  MessageSquare,
  Flame,
  Clock,
  Zap,
  Plus,
  Loader2,
  TrendingUp,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDevHub } from '@/lib/devhub-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DashboardViewProps {
  onNavigateToFeed?: (id: string) => void
  onNavigateToActivity?: (path: string) => void
}

export function DashboardView({ onNavigateToFeed, onNavigateToActivity }: DashboardViewProps) {
  const { 
    isSessionActive, 
    sessionIntent, 
    briefing, 
    logs, 
    commits, 
    hotFiles,
    currentProject 
  } = useDevHub()

  const [isSimulating, setIsSimulating] = useState(false)

  const recentLogs = logs.slice(0, 3)
  const recentCommits = commits.slice(0, 3)

  const handleSimulate = async () => {
    setIsSimulating(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsSimulating(false)
    toast.success('Neural Synchronization Complete', {
      description: '3 files pushed and semantic logs generated.',
      icon: <CheckCircle2 className="h-4 w-4" />,
    })
  }

  const getHeatDotColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
      case 'high':     return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
      case 'medium':   return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
      case 'low':      return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
      default:         return 'bg-zinc-600'
    }
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
      {/* Main Content Area - Left Aligned */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 pb-32">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mission Control</h1>
          <p className="text-zinc-500 font-medium mt-1">Real-time synchronization of your development state.</p>
        </div>

        {/* ── AI Briefing Card ─────────────────────────────────────────────── */}
        <div className="glass rounded-3xl overflow-hidden relative group max-w-4xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
            <Brain className="h-32 w-32 text-primary" />
          </div>
          
          <div className="p-8">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                  <Brain className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Session Briefing</h2>
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mt-0.5">
                    AI-Generated Intelligence
                  </p>
                </div>
              </div>
              {isSessionActive && (
                <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  Active Session
                </div>
              )}
            </div>
            
            <div className="relative">
              {briefing ? (
                <p className="text-lg text-zinc-200 leading-relaxed font-medium">
                  {briefing}
                </p>
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full bg-white/5 rounded-full" />
                  <Skeleton className="h-5 w-4/5 bg-white/5 rounded-full" />
                </div>
              )}
            </div>

            {isSessionActive && sessionIntent && (
              <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group/mission hover:border-primary/30 transition-colors duration-500">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover/mission:bg-primary/20 transition-colors">
                  <Zap className="h-5 w-5" weight="fill" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">Current Mission</p>
                  <p className="text-base text-white font-semibold leading-tight">{sessionIntent}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-5xl">
          {[
            { icon: MessageSquare, value: logs.length, label: 'Thoughts Logged', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
            { icon: GitCommit, value: commits.length, label: 'Code Pushes', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
            { icon: Flame, value: hotFiles.length, label: 'Active Files', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
            { icon: Clock, value: currentProject?.unresolvedThreads ?? 0, label: 'Open Loops', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
          ].map(({ icon: Icon, value, label, color, bg, border }) => (
            <div key={label} className="glass glass-hover rounded-2xl p-6 active-scale group cursor-default">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110', bg, border)}>
                  <Icon className={cn('h-6 w-6', color)} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 group-hover:text-zinc-400 transition-colors">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Heatmap + Recent Thoughts ────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl">
          {/* Stability Heatmap */}
          <div className="glass rounded-3xl p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Stability Heatmap</h3>
                  <p className="text-xs text-zinc-500 font-medium">Core file activity</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              {hotFiles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-12">
                  <FileCode className="h-12 w-12 text-zinc-700 mb-4" />
                  <p className="text-sm font-medium text-zinc-400">Waiting for first commit</p>
                </div>
              ) : (
                hotFiles.slice(0, 5).map(file => (
                  <button
                    key={file.path}
                    onClick={() => onNavigateToActivity?.(file.path)}
                    className="w-full flex items-center gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all active-scale group text-left"
                  >
                    <div className={cn(
                      'h-3 w-3 rounded-full blur-[2px] animate-pulse',
                      getHeatDotColor(file.heatLevel)
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-zinc-300 truncate">{file.path.split('/').pop()}</p>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">{file.path.split('/').slice(-2, -1)[0] || 'root'}</p>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                      {file.changeCount}×
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Recent Thoughts */}
          <div className="glass rounded-3xl p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Recent Thoughts</h3>
                  <p className="text-xs text-zinc-500 font-medium">Weird Stuff Feed</p>
                </div>
              </div>
              <button onClick={() => onNavigateToFeed?.('')} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                View Feed
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              {recentLogs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-12">
                  <MessageSquare className="h-12 w-12 text-zinc-700 mb-4" />
                  <p className="text-sm font-medium text-zinc-400">No logs yet</p>
                </div>
              ) : (
                recentLogs.map(log => (
                  <button
                    key={log.id}
                    onClick={() => onNavigateToFeed?.(log.id)}
                    className="w-full p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all active-scale text-left group"
                  >
                    <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed mb-3 group-hover:text-white transition-colors">{log.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 uppercase tracking-widest">{log.type}</span>
                        {log.linkedCommitHash && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                            <GitCommit className="h-3 w-3" />
                            Linked
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Just now</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Contextual Signals */}
      <div className="w-80 shrink-0 border-l border-white/5 bg-zinc-950/50 p-8 space-y-10 hidden xl:flex flex-col overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <TrendingUp className="h-4 w-4 text-amber-500" />
             <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Intelligence Signals</h3>
          </div>
          
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 border-amber-500/10 space-y-3">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Engine Performance</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">94%</span>
                <span className="text-xs text-green-500 font-bold mb-1">+4.2%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-amber-500 w-[94%]" />
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border-white/5 space-y-3 group hover:border-white/10 transition-colors">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Neural Nodes</p>
              <div className="flex gap-1.5">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className={cn("h-4 w-1 rounded-full", i < 5 ? "bg-amber-500" : "bg-white/5")} />
                 ))}
              </div>
              <p className="text-xs text-zinc-400 font-medium">4 synchronized providers</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-3">
             <Activity className="h-4 w-4 text-zinc-500" />
             <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Live Pulse</h3>
          </div>
          <div className="space-y-4">
             {recentCommits.map(c => (
               <div key={c.id} className="flex gap-4 group cursor-default">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 group-hover:scale-150 transition-transform" />
                  <div className="space-y-1 min-w-0">
                     <p className="text-xs font-bold text-zinc-200 truncate">{c.message}</p>
                     <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Commit {c.hash.slice(0, 7)}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5">
           <Button 
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full glass glass-hover h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest active-scale text-zinc-400 hover:text-white"
           >
              {isSimulating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2 text-amber-500" />}
              {isSimulating ? 'Synchronizing…' : 'Initialize Sync'}
           </Button>
        </div>
      </div>
    </div>
  )
}
