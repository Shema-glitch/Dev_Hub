'use client'

import { useMemo } from 'react'
import {
  Clock,
  MessageSquare,
  GitCommit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Zap,
  Bug,
  Lightbulb,
  HelpCircle,
  GitBranch,
  FileCode,
  Plus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type SessionRecord, type LogEntry } from '@/lib/mock-data'
import { cn } from '@/lib/utils'


interface SessionDetailViewProps {
  session: SessionRecord
  onBack: () => void
  onNewSession: () => void
}

// ── Log type config ───────────────────────────────────────────────────────────
const LOG_CONFIG: Record<LogEntry['type'], { icon: React.ElementType; color: string; bg: string; label: string }> = {
  bug:          { icon: Bug,          color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Bug'          },
  thought:      { icon: MessageSquare,color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Thought'      },
  breakthrough: { icon: Zap,          color: 'text-amber-400',  bg: 'bg-amber-500/10',  label: 'Breakthrough' },
  question:     { icon: HelpCircle,   color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Question'     },
  decision:     { icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Decision'     },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hrs > 0) return `${hrs}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function SessionDetailView({ session, onBack, onNewSession }: SessionDetailViewProps) {
  const unresolved = useMemo(
    () => session.logs.filter(l => !l.linkedCommitHash),
    [session]
  )

  const isCompleted = session.outcome === 'completed'

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-950">
      {/* Archive Banner */}
      <div className="shrink-0 bg-zinc-900/50 border-b border-zinc-800 px-6 py-2 flex items-center gap-2">
        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <p className="text-xs text-zinc-500">
          Read-only archive — this session ended {timeAgo(session.endedAt)}
        </p>
        <div className="ml-auto">
          <Button
            onClick={onNewSession}
            size="sm"
            className="h-7 bg-amber-600 hover:bg-amber-500 text-white text-xs transition-colors duration-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            New Session
          </Button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 space-y-6">

        {/* Header */}
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to session history
          </button>

          <div className="flex items-start gap-4">
            <div className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              isCompleted ? 'bg-green-500/10' : 'bg-zinc-800'
            )}>
              {isCompleted
                ? <CheckCircle2 className="h-6 w-6 text-green-400" />
                : <XCircle className="h-6 w-6 text-zinc-500" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-zinc-100 leading-tight">{session.intent}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-xs text-zinc-500">
                  {formatDate(session.startedAt)} · {formatTime(session.startedAt)} → {formatTime(session.endedAt)}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs border/15',
                    isCompleted
                      ? 'border-green-500/15 text-green-400 bg-green-500/5'
                      : 'border-zinc-700/15 text-zinc-400 bg-zinc-800/30'
                  )}
                >
                  {isCompleted ? 'Completed' : 'Abandoned'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Duration',    value: formatDuration(session.durationMinutes), icon: Clock,        color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
            { label: 'Thoughts',    value: session.logCount,                        icon: MessageSquare,color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Commits',     value: session.commitCount,                     icon: GitCommit,    color: 'text-green-400',  bg: 'bg-green-500/10'  },
            { label: 'Unresolved',  value: session.unresolvedCount,                 icon: AlertCircle,  color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center">
              <div className={cn('inline-flex h-8 w-8 items-center justify-center rounded-lg mb-2', bg)}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <p className="text-2xl font-bold text-zinc-100">{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Logs */}
        {session.logs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-300">Session Log</h2>
              <span className="text-xs text-zinc-600">({session.logs.length} entries)</span>
            </div>
            <div className="space-y-2">
              {session.logs.map(log => {
                const cfg = LOG_CONFIG[log.type]
                const Icon = cfg.icon
                return (
                  <div
                    key={log.id}
                    className="flex gap-3 p-3.5 rounded-lg border border-zinc-800/50 bg-zinc-900/30"
                  >
                    <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md mt-0.5', cfg.bg)}>
                      <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 leading-relaxed">{log.content}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
                        <span className="text-xs text-zinc-600">
                          {timeAgo(log.createdAt)}
                        </span>
                        {log.linkedCommitHash && (
                          <Badge variant="outline" className="text-[10px] border-green-500/15 text-green-400 bg-green-500/5 h-4 px-1.5">
                            → {log.linkedCommitHash.slice(0, 6)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Commits */}
        {session.commits.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-300">Commits This Session</h2>
              <span className="text-xs text-zinc-600">({session.commits.length})</span>
            </div>
            <div className="space-y-2">
              {session.commits.map(commit => (
                <div key={commit.id} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-green-500/10 mt-0.5">
                      <GitCommit className="h-3.5 w-3.5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{commit.message}</p>
                      <p className="text-xs text-zinc-500 mt-1">{commit.aiSummary}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 font-mono text-xs border-zinc-700/15 text-zinc-400">
                      {commit.hash.slice(0, 6)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 pl-10">
                    <span className="text-xs text-green-400">+{commit.additions}</span>
                    <span className="text-xs text-red-400">−{commit.deletions}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {commit.filesChanged.map(f => (
                        <span key={f} className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-800/50 rounded px-1.5 py-0.5">
                          <FileCode className="h-2.5 w-2.5" />
                          {f.split('/').pop()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unresolved */}
        {unresolved.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-zinc-300">Unresolved at End of Session</h2>
            </div>
            <div className="space-y-2">
              {unresolved.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/10 bg-amber-500/5">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-300">{log.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {session.logs.length === 0 && session.commits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-zinc-700 mb-4" />
            <p className="text-sm font-medium text-zinc-400">No logs recorded for this session</p>
            <p className="text-xs text-zinc-600 mt-1">This session ended without any captured thoughts or commits.</p>
          </div>
        )}

      </div>
    </div>
  )
}
