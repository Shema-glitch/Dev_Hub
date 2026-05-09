'use client'

import { useState, useRef } from 'react'
import {
  Bug,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  GitCommit,
  Search,
  Filter,
  Mic,
  X,
  ArrowUp,
  Zap,
  Bookmark,
  Hash,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDevHub } from '@/lib/devhub-context'
import { cn } from '@/lib/utils'
import type { LogEntry } from '@/lib/mock-data'

const logTypeConfig: Record<
  LogEntry['type'],
  { icon: React.ElementType; label: string; color: string; bgColor: string; borderColor: string }
> = {
  thought:      { icon: MessageSquare, label: 'Thought',      color: 'text-zinc-300',  bgColor: 'bg-zinc-500-10',  borderColor: 'border-zinc-500-10' },
  bug:          { icon: Bug,           label: 'Bug',          color: 'text-red-400',   bgColor: 'bg-red-500-10',   borderColor: 'border-red-500-10' },
  breakthrough: { icon: Lightbulb,     label: 'Breakthrough', color: 'text-green-400', bgColor: 'bg-green-500-10', borderColor: 'border-green-500-10' },
  question:     { icon: HelpCircle,    label: 'Question',     color: 'text-blue-400',  bgColor: 'bg-blue-500-10',  borderColor: 'border-blue-500-10' },
  decision:     { icon: Bookmark,      label: 'Decision',     color: 'text-primary',   bgColor: 'bg-primary-10',   borderColor: 'border-primary-10' },
}

const LOG_TYPES = Object.keys(logTypeConfig) as LogEntry['type'][]

function FeedLogItem({ log }: { log: LogEntry }) {
  const config = logTypeConfig[log.type]
  const Icon = config.icon

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className={cn(
        'group flex items-start gap-4 p-5 rounded-2xl glass transition-all active-scale cursor-default',
        'hover:bg-white-10 hover:border-white-20'
      )}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110', config.bgColor)}>
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed group-hover:text-white transition-colors">{log.content}</p>
        <div className="mt-3 flex items-center gap-2.5 flex-wrap">
          <Badge variant="outline" className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-white-5', config.color, config.bgColor)}>
            {config.label}
          </Badge>
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{formatTime(log.createdAt)}</span>
          {log.linkedCommitHash && (
            <Badge variant="outline" className="text-[10px] font-bold border-green-500-10 text-green-500 uppercase tracking-widest">
              <GitCommit className="h-3 w-3 mr-1" />
              {log.linkedCommitHash.slice(0, 7)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export function WeirdStuffFeed() {
  const { logs, addLog, isSessionActive } = useDevHub()
  const [input, setInput] = useState('')
  const [selectedType, setSelectedType] = useState<LogEntry['type']>('thought')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<LogEntry['type'] | 'all'>('all')
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || log.type === filterType
    return matchesSearch && matchesFilter
  })

  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const d = new Date(log.createdAt)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(log)
    return groups
  }, {} as Record<string, LogEntry[]>)

  const handleSubmit = () => {
    if (!input.trim()) return
    addLog(input.trim(), selectedType)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleVoiceInput = () => {
    // Safety mock
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-12 space-y-12">
          <div className="max-w-3xl space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Consciousness Feed</h2>
              <p className="text-sm text-zinc-500 font-medium mt-1">Capture every raw thought, bug, and breakthrough in real-time.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search your consciousness..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-11 glass border-white-5 text-zinc-100 placeholder:text-zinc-600 h-11 rounded-xl focus:ring-2 focus:ring-amber-500-20 focus:border-amber-500-40"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="glass border-white-5 text-zinc-400 h-11 rounded-xl px-4 font-bold text-[10px] uppercase tracking-widest transition-all active-scale hover:bg-white-5">
                    <Filter className="h-4 w-4 mr-2" />
                    {filterType === 'all' ? 'All Channels' : filterType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass border-white-10 shadow-2xl min-w-[180px]">
                  <DropdownMenuItem onClick={() => setFilterType('all')} className="text-[10px] font-bold uppercase tracking-widest p-3 rounded-lg cursor-pointer">All Channels</DropdownMenuItem>
                  {LOG_TYPES.map(type => (
                    <DropdownMenuItem key={type} onClick={() => setFilterType(type)} className="gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{type}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="max-w-3xl space-y-10 pb-32">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{date}</span>
                  <div className="h-px flex-1 bg-white-5" />
                </div>
                <div className="space-y-4">
                  {dateLogs.map(log => <FeedLogItem key={log.id} log={log} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0 p-8 border-t border-white-5 bg-zinc-950-80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto lg:mx-0">
            {!isSessionActive ? (
              <div className="flex items-center justify-center p-6 rounded-3xl glass border-dashed border-white-10 opacity-60">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Initialize session to record thoughts</span>
              </div>
            ) : (
              <div className={cn("relative rounded-3xl glass shadow-2xl shadow-black-60 focus-within:ring-2 focus-within:ring-amber-500-20 focus-within:border-amber-500-40 transition-all duration-500 overflow-hidden flex flex-col group-logger")}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-white-5 bg-white-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-800-80 text-zinc-400 text-[10px] font-bold tracking-widest uppercase">
                    <MessageSquare className="h-3 w-3" />
                    DevHub Logger
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {LOG_TYPES.map(type => (
                      <button key={type} onClick={() => setSelectedType(type)} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active-scale', selectedType === type ? 'bg-white-10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white-5')}>
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's your current breakthrough?"
                  className="min-h-[100px] max-h-[250px] resize-none border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 text-base p-5 leading-relaxed focus-visible:ring-0"
                />
                <div className="flex items-center justify-between px-4 pb-4 pt-1">
                  <p className="text-[10px] font-bold text-zinc-600 pl-2 uppercase tracking-widest">Press Enter to commit log</p>
                  <div className="flex items-center gap-3">
                    <button onClick={handleVoiceInput} className="p-3 rounded-full transition-all active-scale text-zinc-500 hover:text-white hover:bg-white-5">
                      <Mic className="h-5 w-5" />
                    </button>
                    <button onClick={handleSubmit} disabled={!input.trim()} className="group-btn flex items-center justify-center h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black transition-all active-scale shadow-xl shadow-amber-500-20">
                      <ArrowUp className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-80 shrink-0 border-l border-white-5 bg-zinc-950-50 p-8 space-y-10 hidden xl:flex flex-col overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <Hash className="h-4 w-4 text-amber-500" />
             <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Channel Breakdown</h3>
          </div>
          <div className="space-y-3">
             {LOG_TYPES.map(type => {
               const count = logs.filter(l => l.type === type).length
               const total = logs.length > 0 ? logs.length : 1
               const percentage = (count * 100) / total
               return (
                 <div key={type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-zinc-500">{type}</span>
                       <span className="text-zinc-300">{count}</span>
                    </div>
                    <div className="h-1 w-full bg-white-5 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500" style={{ width: percentage + "%" }} />
                    </div>
                 </div>
               )
             })}
          </div>
        </div>
        <div className="space-y-6">
           <div className="flex items-center gap-3">
             <Activity className="h-4 w-4 text-zinc-500" />
             <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Capture Velocity</h3>
          </div>
          <div className="glass rounded-2xl p-6 border-white-5 flex flex-col items-center gap-3 text-center">
             <p className="text-4xl font-bold text-white tracking-tight">1.4</p>
             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Thoughts per mission hour</p>
          </div>
        </div>
        <div className="mt-auto space-y-4">
           <Button className="w-full glass glass-hover h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest active-scale text-zinc-400 hover:text-white">
              <Bookmark className="h-4 w-4 mr-2" /> View Saved Context
           </Button>
        </div>
      </div>
    </div>
  )
}
