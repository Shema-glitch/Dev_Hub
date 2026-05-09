'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  GitCommit,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  WifiOff,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDevHub } from '@/lib/devhub-context'
import { cn } from '@/lib/utils'

type AuditState = 'idle' | 'auditing' | 'done' | 'error'

/**
 * EndSessionDialog — session audit modal.
 *
 * @expects DevHubContext:
 *  - showEndSessionDialog, setShowEndSessionDialog
 *  - sessionIntent, sessionStartedAt
 *  - logs (LogEntry[]), commits (Commit[])
 *  - finaliseEndSession() — clears session state
 */
export function EndSessionDialog() {
  const {
    showEndSessionDialog,
    setShowEndSessionDialog,
    sessionIntent,
    sessionStartedAt,
    logs,
    commits,
    finaliseEndSession,
  } = useDevHub()

  const [auditState, setAuditState] = useState<AuditState>('idle')

  // ── Stats ──────────────────────────────────────────────────────────────────
  const sessionLogs = logs.filter(
    log => sessionStartedAt && log.createdAt >= sessionStartedAt
  )
  const sessionCommits = commits.filter(
    commit => sessionStartedAt && commit.pushedAt >= sessionStartedAt
  )
  const unresolvedLogs = sessionLogs.filter(log => !log.linkedCommitHash)

  const formatDuration = () => {
    if (!sessionStartedAt) return '0m'
    const diff = Date.now() - sessionStartedAt.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogAsUnresolved = async () => {
    setAuditState('auditing')
    // Simulate API call: POST /sessions/{id}/audit
    await new Promise(resolve => setTimeout(resolve, 800))
    // 10% chance of simulated error to demonstrate error state
    if (Math.random() < 0.1) {
      setAuditState('error')
      return
    }
    setAuditState('done')
    await new Promise(resolve => setTimeout(resolve, 600))
    finaliseEndSession('completed')
    setAuditState('idle')
  }

  const handleEndAnyway = () => {
    finaliseEndSession('abandoned')
    setAuditState('idle')
  }

  const handleRetry = () => setAuditState('idle')

  const handleOpenChange = (open: boolean) => {
    if (!open) setAuditState('idle')
    setShowEndSessionDialog(open)
  }

  const allResolved = unresolvedLogs.length === 0

  return (
    <Dialog open={showEndSessionDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                auditState === 'error' ? 'bg-red-500/10' :
                allResolved ? 'bg-green-500/10' : 'bg-amber-500/10'
              )}
            >
              {auditState === 'auditing' ? (
                <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
              ) : auditState === 'error' ? (
                <WifiOff className="h-5 w-5 text-red-400" />
              ) : allResolved ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg text-zinc-100">
                {auditState === 'error' ? 'Audit Failed' :
                 auditState === 'auditing' ? 'Auditing session…' :
                 'End of Session Handshake'}
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-sm">
                {auditState === 'error'
                  ? 'Could not save unresolved items. Check your connection.'
                  : auditState === 'auditing'
                  ? 'Comparing your logs with commits…'
                  : allResolved
                  ? 'Great work! All thoughts are tracked'
                  : `${unresolvedLogs.length} thought${unresolvedLogs.length !== 1 ? 's' : ''} not linked to commits`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Error state */}
          {auditState === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <WifiOff className="h-10 w-10 text-red-400" />
              <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
                We couldn&apos;t save your unresolved items to the server. Your data is safe locally.
              </p>
              <Button
                variant="outline"
                onClick={handleRetry}
                className="border-zinc-700 text-zinc-300 mt-2"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Normal audit content */}
          {auditState !== 'error' && (
            <>
              {/* Session summary stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Clock,         value: formatDuration(), label: 'Duration',  color: 'text-zinc-400' },
                  { icon: MessageSquare, value: sessionLogs.length,    label: 'Logs',     color: 'text-blue-400' },
                  { icon: GitCommit,     value: sessionCommits.length, label: 'Commits',  color: 'text-green-400' },
                ].map(({ icon: Icon, value, label, color }) => (
                  <div key={label} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-center">
                    <Icon className={cn('h-5 w-5 mx-auto mb-1', color)} />
                    <p className="text-lg font-bold text-zinc-200 leading-none">{value}</p>
                    <p className="text-xs text-zinc-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Session intent status */}
              {sessionIntent && (
                <div className="p-3.5 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Session Intent
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        sessionCommits.length > 0
                          ? 'border-green-500/15 text-green-400'
                          : 'border-amber-500/15 text-amber-400'
                      )}
                    >
                      {sessionCommits.length > 0 ? 'Progress Made' : 'In Progress'}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-200 leading-snug">{sessionIntent}</p>
                </div>
              )}

              {/* Unresolved thoughts */}
              {unresolvedLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-400">
                      Untracked Thoughts ({unresolvedLogs.length})
                    </span>
                  </div>
                  <div 
                    className="space-y-2 max-h-[160px] overflow-y-auto pr-1 relative pb-4" 
                    style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}
                  >
                    {unresolvedLogs.slice(0, 4).map(log => (
                      <div
                        key={log.id}
                        className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                      >
                        <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                          {log.content}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                            {log.type}
                          </Badge>
                          <span className="text-xs text-zinc-500">No commit linked</span>
                        </div>
                      </div>
                    ))}
                    {unresolvedLogs.length > 4 && (
                      <p className="text-xs text-zinc-500 text-center">
                        +{unresolvedLogs.length - 4} more
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 italic leading-relaxed">
                    &ldquo;These thoughts weren&apos;t captured in a commit. Log them as unresolved so you remember next session.&rdquo;
                  </p>
                </div>
              )}

              {/* All resolved */}
              {allResolved && (
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-300 font-medium">
                    All your thoughts are linked to commits
                  </p>
                  <p className="text-xs text-green-400/70 mt-1">
                    Excellent session hygiene. Future-you will thank you.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
          {auditState === 'error' ? (
            <Button
              onClick={handleEndAnyway}
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
            >
              <XCircle className="h-4 w-4 mr-2" />
              End Without Saving
            </Button>
          ) : unresolvedLogs.length > 0 ? (
            <>
              <Button
                variant="outline"
                onClick={handleEndAnyway}
                className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
              >
                <XCircle className="h-4 w-4 mr-2" />
                End Anyway
              </Button>
              <Button
                variant="outline"
                onClick={handleLogAsUnresolved}
                disabled={auditState === 'auditing'}
                className="border-amber-500/15 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              >
                {auditState === 'auditing' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4 mr-2" />
                )}
                Log as Unresolved
              </Button>
            </>
          ) : (
              <Button
              onClick={() => finaliseEndSession('completed')}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                End Session
              </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
