'use client'

import { useState } from 'react'
import {
  GitCommit,
  FileCode,
  Plus,
  Minus,
  ExternalLink,
  MessageSquare,
  Sparkles,
  AlertCircle,
  History,
  CheckCircle2,
  XCircle,
  Activity,
  Archive,
  ChevronRight,
  Clock,
  Zap,
} from 'lucide-react'
import { 
  GitCommit as PhosphorGitCommit,
  FileCode as PhosphorFileCode,
  ClockCounterClockwise,
  CaretRight,
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDevHub } from '@/lib/devhub-context'
import { FileDiffViewer } from './file-diff-viewer'
import { cn } from '@/lib/utils'

// ─── Time helper ─────────────────────────────────────────────────────────────
function timeAgo(date: Date | string): string {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hrs > 0) return `${hrs}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}

// ─── Commit Card ─────────────────────────────────────────────────────────────
function CommitCard({
  commit,
  linkedLogs,
  onFileClick,
}: {
  commit: ReturnType<typeof useDevHub>['commits'][0]
  linkedLogs: ReturnType<typeof useDevHub>['logs']
  onFileClick: (path: string) => void
}) {
  return (
    <div className="glass rounded-3xl p-8 group relative overflow-hidden active-scale transition-all">
      <div className="flex items-start gap-6 relative z-10">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 group-hover:scale-110 transition-transform duration-500">
          <GitCommit className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <code className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-zinc-500 font-mono border border-white/5 uppercase tracking-widest">
              {commit.hash}
            </code>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{timeAgo(commit.pushedAt)}</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-green-400 transition-colors">
            {commit.message}
          </h3>

          {commit.aiSummary && (
            <div className="flex items-start gap-3 mb-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-zinc-300 leading-relaxed">{commit.aiSummary}</p>
            </div>
          )}

          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-500" />
              <span className="text-xs font-bold text-green-400">{commit.additions} insertions</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold text-red-400">{commit.deletions} deletions</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 px-1">Impacted Assets</p>
            <div className="flex flex-wrap gap-2">
              {commit.filesChanged.map(file => (
                <button
                  key={file}
                  onClick={() => onFileClick(file)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-zinc-400 hover:text-white hover:border-amber-500/30 transition-all active-scale"
                >
                  {file.split('/').pop()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Session Timeline Node ───────────────────────────────────────────────────
function SessionTimelineNode({ session }: { session: ReturnType<typeof useDevHub>['sessions'][0] }) {
  const isCompleted = session.outcome === 'completed'
  const isFailed = session.outcome === 'failed'

  return (
    <div className="relative pl-10 pb-12 last:pb-0 group">
      <div className="absolute left-[11px] top-4 bottom-0 w-[1px] bg-white/5 group-last:hidden" />
      
      <div className={cn(
        'absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-zinc-950 z-10 flex items-center justify-center transition-all duration-500 group-hover:scale-125',
        session.status === 'active' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse' :
        isCompleted ? 'bg-green-500' : 'bg-red-500'
      )}>
        {isCompleted ? <CheckCircle2 className="h-3 w-3 text-black" /> : 
         isFailed ? <XCircle className="h-3 w-3 text-black" /> : 
         <Activity className="h-3 w-3 text-black" />}
      </div>

      <div className="glass rounded-3xl p-6 group-hover:border-amber-500/20 transition-all duration-500 active-scale cursor-default">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{timeAgo(new Date(session.startedAt))}</span>
            <Badge variant="outline" className={cn(
              'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-white/5',
              isCompleted ? 'text-green-500 bg-green-500/5' :
              isFailed ? 'text-red-500 bg-red-500/5' :
              'text-amber-500 bg-amber-500/5'
            )}>
              {session.status === 'active' ? 'Active' : session.outcome}
            </Badge>
          </div>
        </div>
        
        <h4 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-amber-500 transition-colors">
          {session.intent || 'Unnamed Session'}
        </h4>
        
        {session.logs && session.logs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            {session.logs.slice(0, 2).map(log => (
              <div key={log.id} className="flex items-center gap-3">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-700" />
                <p className="text-xs text-zinc-400 line-clamp-1">{log.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main View ───────────────────────────────────────────────────────────────
export function ActivityView() {
  const { commits, sessions, logs, hotFiles } = useDevHub()
  const [isDiffOpen, setIsDiffOpen] = useState(false)
  const [selectedFilePath, setSelectedFilePath] = useState('')

  const handleFileClick = (path: string) => {
    setSelectedFilePath(path)
    setIsDiffOpen(true)
  }

  const getLinkedLogs = (logIds: string[]) => logs.filter(l => logIds.includes(l.id))

  const heatDot: Record<string, string> = {
    critical: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    high:     'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]',
    medium:   'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    low:      'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
      
      {/* Main Activity Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-12 space-y-12 pb-32">
          
          <div className="max-w-3xl space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Neural History</h2>
              <p className="text-sm text-zinc-500 font-medium mt-1">
                Historical record of your development consciousness.
              </p>
            </div>

            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="glass border-white/5 p-1 rounded-xl h-11 mb-8">
                <TabsTrigger 
                  value="sessions" 
                  className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all active-scale"
                >
                  <ClockCounterClockwise className="h-4 w-4 mr-2" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger 
                  value="commits" 
                  className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all active-scale"
                >
                  <GitCommit className="h-4 w-4 mr-2" />
                  Pushes
                </TabsTrigger>
                <TabsTrigger 
                  value="files" 
                  className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all active-scale"
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Volatility
                </TabsTrigger>
              </TabsList>

              <div className="mt-0 focus-visible:ring-0">
                <TabsContent value="sessions" className="space-y-0 mt-0 focus-visible:ring-0">
                  {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                      <Archive className="h-12 w-12 text-zinc-700 mb-4" />
                      <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No archival sessions found</p>
                    </div>
                  ) : (
                    <div className="relative pl-8 space-y-0">
                      <div className="absolute left-[11px] top-3 bottom-8 w-[1px] bg-white/5" />
                      {sessions.map((session) => (
                        <SessionTimelineNode key={session.id} session={session} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="commits" className="space-y-6 mt-0 focus-visible:ring-0">
                  {commits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                      <GitCommit className="h-12 w-12 text-zinc-700 mb-4" />
                      <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Awaiting first code push</p>
                    </div>
                  ) : (
                    commits.map(commit => (
                      <CommitCard
                        key={commit.id}
                        commit={commit}
                        linkedLogs={getLinkedLogs(commit.linkedLogIds)}
                        onFileClick={handleFileClick}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="files" className="mt-0 focus-visible:ring-0">
                  {hotFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                      <FileCode className="h-12 w-12 text-zinc-700 mb-4" />
                      <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No file volatility detected</p>
                    </div>
                  ) : (
                    <div className="glass rounded-3xl p-8 space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white tracking-tight">Volatility Heatmap</h3>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">By Modification Frequency</p>
                      </div>
                      <div className="space-y-2">
                        {hotFiles.map(file => (
                          <button
                            key={file.path}
                            onClick={() => handleFileClick(file.path)}
                            className="flex items-center gap-4 w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 hover:bg-white/[0.05] transition-all active-scale text-left group"
                          >
                            <div className={cn('h-3 w-3 rounded-full blur-[2px] animate-pulse', heatDot[file.heatLevel] || 'bg-zinc-500')} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-mono text-zinc-300 truncate group-hover:text-amber-200 transition-colors">
                                {file.path}
                              </p>
                              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                                {file.changeCount} modifications · {timeAgo(file.lastModified)}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Volumetric Stats */}
      <div className="w-80 shrink-0 border-l border-white/5 bg-zinc-950/50 p-8 space-y-10 hidden xl:flex flex-col overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <History className="h-4 w-4 text-amber-500" />
             <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Volumetric Metrics</h3>
          </div>
          
          <div className="space-y-4">
             <div className="glass rounded-2xl p-5 border-white/5 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Sequence Time</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-bold text-white">124</span>
                   <span className="text-sm font-bold text-zinc-600">HOURS</span>
                </div>
             </div>
             <div className="glass rounded-2xl p-5 border-white/5 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Neural Density</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-bold text-white">4.2</span>
                   <span className="text-sm font-bold text-zinc-600">LOGS/HR</span>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-3">
             <Zap className="h-4 w-4 text-zinc-500" />
             <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Archival Integrity</h3>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>Synchronization</span>
                <span className="text-green-500">100%</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] w-full" />
             </div>
             <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">All historical nodes are correctly mapped to current file structure.</p>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5">
           <Button className="w-full glass glass-hover h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest active-scale text-zinc-400 hover:text-white">
              <ExternalLink className="h-4 w-4 mr-2" /> Export Neural Data
           </Button>
        </div>
      </div>

      <FileDiffViewer isOpen={isDiffOpen} onClose={() => setIsDiffOpen(false)} />
    </div>
  )
}
