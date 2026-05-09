'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  SquaresFour,
  GitBranch,
  ChatTeardropDots,
  Brain,
  Gear,
  Sparkle,
  FolderSimpleUser,
  CaretDown,
  Plus,
  SignOut,
  CaretLeft,
  CaretRight,
  Bell,
  Question,
  Clock,
  CheckCircle,
  XCircle,
  ClockCounterClockwise,
  GitCommit,
  Kanban,
} from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useDevHub } from '@/lib/devhub-context'
import { useToast } from '@/hooks/use-toast'
import { type SessionRecord } from '@/lib/mock-data'
import { cn } from '@/lib/utils'


interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  onViewSession: (session: SessionRecord) => void
  onNewSession: () => void
}

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',       icon: SquaresFour },
  { id: 'projects',   label: 'Project Manager',  icon: Kanban          },
  { id: 'feed',       label: 'Weird Stuff Feed', icon: ChatTeardropDots },
  { id: 'activity',   label: 'Activity',         icon: GitBranch       },
  { id: 'brainstorm', label: 'Brainstormer',     icon: Brain           },
  { id: 'history',    label: 'Neural Archive',   icon: ClockCounterClockwise },
]

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

function NotificationsMenu({ children, side = 'right', align = 'start' }: { children: React.ReactNode, side?: 'top'|'right'|'bottom'|'left', align?: 'start'|'center'|'end' }) {
  const { notifications, clearNotifications } = useToast()
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="w-80 glass border-white/10 p-0 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Notifications</span>
          {notifications && notifications.length > 0 && (
            <button onClick={clearNotifications} className="text-[9px] font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest">Clear All</button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {(!notifications || notifications.length === 0) ? (
            <div className="p-8 text-center flex flex-col items-center gap-3 opacity-60">
              <Bell className="h-8 w-8 text-zinc-700" weight="duotone" />
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No new signals</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {notifications.map((n, i) => (
                <div key={n.id || i} className="p-4 hover:bg-white/[0.02] transition-colors text-left group cursor-default">
                   <div className="flex gap-3">
                     <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                     <div className="space-y-1">
                        {n.title && <p className="text-xs font-bold text-zinc-200 leading-relaxed group-hover:text-white transition-colors">{n.title}</p>}
                        {n.description && <p className="text-[11px] text-zinc-500 leading-relaxed">{n.description}</p>}
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{timeAgo(new Date(n.createdAt || Date.now()))}</p>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function AppSidebar({ activeView, onViewChange, onViewSession, onNewSession }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSessionHistoryExpanded, setIsSessionHistoryExpanded] = useState(false)
  const { notifications } = useToast()
  const {
    currentProject,
    projects,
    sessions,
    setCurrentProject,
    userEmail,
    logout,
    isSessionActive,
    sessionIntent,
    addProject,
    featureIdeas,
    pomodoroMinutes,
    pomodoroActive,
    settings,
  } = useDevHub()

  // ── Project quick-add ───────────────────────────────────────────────────────
  const handleQuickAddProject = () => {
    const name = prompt('Project name:')
    if (!name?.trim()) return
    const url = prompt('GitHub repo URL (optional):') || ''
    addProject(name.trim(), url.trim())
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-screen border-r border-white/5 bg-zinc-950 transition-all duration-500 ease-out-expo overflow-hidden shrink-0 z-50',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* ── Logo Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02] shrink-0 backdrop-blur-sm">
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center w-full')}>
            <div className="relative shrink-0 group">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                <Image 
                  src="/favicon_io/favicon-32x32.png" 
                  alt="DevHub Logo" 
                  width={24} 
                  height={24} 
                  className="relative z-10 opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            <div className={cn('flex flex-col min-w-0 transition-all duration-500 ease-out-expo', isCollapsed ? 'opacity-0 w-0 -translate-x-2' : 'opacity-100 translate-x-0')}>
              <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">Dev Hub</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Context Engine</span>
            </div>
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all active-scale"
            >
              <CaretLeft className="h-4 w-4" weight="bold" />
            </button>
          )}
        </div>

        {/* ── Expand Button (collapsed mode) ───────────────────────────────── */}
        {isCollapsed && (
          <div className="flex justify-center py-4 shrink-0">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all active-scale"
            >
              <CaretRight className="h-4 w-4" weight="bold" />
            </button>
          </div>
        )}

        {/* ── Project Selector ─────────────────────────────────────────────── */}
        {!isCollapsed && (
          <div className="p-4 border-b border-white/5 shrink-0">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-1">Active Project</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl glass glass-hover px-4 py-3 text-left transition-all active-scale">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <FolderSimpleUser className="h-5 w-5" weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {currentProject?.name || 'Select Project'}
                    </p>
                    {isSessionActive && sessionIntent ? (
                      <p className="text-[10px] font-medium text-amber-500/80 truncate mt-0.5">{sessionIntent}</p>
                    ) : currentProject?.unresolvedThreads ? (
                      <p className="text-[10px] font-medium text-zinc-500 mt-0.5">{currentProject.unresolvedThreads} unresolved</p>
                    ) : null}
                  </div>
                  {isSessionActive && (
                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse shrink-0" />
                  )}
                  <CaretDown className="h-4 w-4 text-zinc-600 shrink-0" weight="bold" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[236px] glass border-white/10 shadow-2xl">
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => setCurrentProject(project)}
                    className={cn('flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer', currentProject?.id === project.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5')}
                  >
                    <FolderSimpleUser className="h-4 w-4 shrink-0" weight="duotone" />
                    <span className="flex-1 truncate font-medium">{project.name}</span>
                    {project.unresolvedThreads > 0 && (
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">{project.unresolvedThreads}</Badge>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="text-zinc-400 hover:text-amber-500 p-2.5 cursor-pointer rounded-lg" onClick={handleQuickAddProject}>
                  <Plus className="h-4 w-4 mr-2" weight="bold" />
                  <span className="font-medium">Connect Repository</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* ── MAIN CONTENT AREA ────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto py-6">
            {/* Nav Items */}
            {!isCollapsed && <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-6">Navigation</p>}
            <nav className={cn('space-y-1.5', isCollapsed ? 'px-3' : 'px-4')}>
              {navItems
                .filter(item => {
                  if (item.id === 'activity' || item.id === 'feed' || item.id === 'brainstorm') {
                    return isSessionActive
                  }
                  if (item.id === 'history') {
                    return !isSessionActive
                  }
                  return true
                })
                .map((item) => {
                  const isActive = activeView === item.id && item.id !== 'history'
                  const label = item.label
                return isCollapsed ? (
                  <div key={item.id} className="flex flex-col items-center">
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (item.id === 'history') {
                              setIsCollapsed(false)
                              setIsSessionHistoryExpanded(true)
                            } else {
                              onViewChange(item.id)
                            }
                          }}
                          className={cn(
                            'flex items-center justify-center h-10 w-10 rounded-xl transition-all active-scale',
                            isActive
                              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                              : 'text-zinc-500 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <item.icon
                            className="h-5 w-5"
                            weight={isActive ? 'fill' : 'bold'}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="glass text-white text-[10px] font-bold tracking-widest uppercase border-white/10">{label}</TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  <div key={item.id} className="flex flex-col">
                    <button
                      onClick={() => {
                        if (item.id === 'history') {
                          setIsSessionHistoryExpanded(!isSessionHistoryExpanded)
                        } else {
                          onViewChange(item.id)
                        }
                      }}
                      className={cn(
                      'flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition-all active-scale group',
                      isActive
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <item.icon
                      className={cn('h-5 w-5 shrink-0 transition-colors', isActive ? 'text-amber-500' : 'group-hover:text-amber-500/70')}
                      weight={isActive ? 'fill' : 'bold'}
                    />
                    <span className="tracking-tight">{label}</span>
                    {item.id === 'feed' && isSessionActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                    )}
                    {item.id === 'brainstorm' && featureIdeas && featureIdeas.length > 0 && (
                      <span className="ml-auto text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {featureIdeas.length}
                      </span>
                    )}
                    {item.id === 'dashboard' && currentProject?.unresolvedThreads ? (
                      <Badge className="ml-auto text-[10px] font-bold bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 h-4">
                        {currentProject.unresolvedThreads}
                      </Badge>
                    ) : null}
                    {item.id === 'history' && (
                      <CaretDown className={cn(
                        "ml-auto h-4 w-4 text-zinc-600 transition-transform duration-500 ease-out-expo",
                        isSessionHistoryExpanded && "rotate-180"
                      )} />
                    )}
                  </button>
                  
                  {item.id === 'history' && (
                    <div className={cn(
                      "overflow-hidden transition-all duration-500 ease-out-expo",
                      isSessionHistoryExpanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="pt-2 pb-3 pl-10 pr-3 flex flex-col gap-1.5">
                        {sessions && sessions.slice(0, 3).map(session => (
                          <button
                             key={session.id}
                             onClick={() => {
                                onViewSession(session)
                             }}
                             className="flex items-center gap-3 w-full text-left p-2.5 rounded-xl hover:bg-white/5 transition-all active-scale group"
                          >
                             <div className={cn(
                               "h-2 w-2 rounded-full shrink-0 blur-[1px]",
                               session.status === 'active' ? "bg-amber-500 animate-pulse" : 
                               session.outcome === 'completed' ? "bg-green-500" : "bg-red-500"
                             )} />
                             <div className="flex-1 min-w-0">
                               <span className="text-[11px] text-zinc-400 font-bold truncate block group-hover:text-white transition-colors tracking-tight">
                                 {session.intent || "Unnamed session"}
                               </span>
                               <span className="text-[9px] font-bold text-zinc-600 mt-0.5 block uppercase tracking-widest">
                                 {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                               </span>
                             </div>
                          </button>
                        ))}
                        {sessions && sessions.length > 0 && (
                          <button
                            onClick={() => onViewChange('activity')}
                            className="w-full mt-2 py-2 text-center text-[10px] font-bold text-zinc-600 hover:text-amber-500 transition-colors border-t border-white/5 uppercase tracking-widest"
                          >
                            View All History
                          </button>
                        )}
                        {(!sessions || sessions.length === 0) && (
                          <div className="text-[10px] font-bold text-zinc-600 p-2 italic uppercase tracking-widest">No sessions yet</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                )
              })}
            </nav>

            {pomodoroActive && !isCollapsed && (
              <div className="mx-4 mt-8 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center justify-between group cursor-default shadow-lg shadow-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <Clock className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Focus Mode</p>
                    <p className="text-sm font-bold text-white font-mono">
                      {Math.floor(pomodoroMinutes)}:{(Math.floor((pomodoroMinutes % 1) * 60)).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isCollapsed && !isSessionActive && (
              <div className="mt-8 px-4">
                 <button
                  onClick={onNewSession}
                  className="group/new flex items-center justify-center gap-3 w-full rounded-2xl py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all active-scale shadow-xl shadow-amber-500/10"
                >
                  <Plus className="h-5 w-5 transition-transform group-hover/new:rotate-90 duration-500" weight="bold" />
                  New Session
                </button>
              </div>
            )}
            {isCollapsed && !isSessionActive && (
              <div className="mt-6 px-3">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onNewSession}
                      className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-all active-scale shadow-lg shadow-amber-500/10"
                    >
                      <Plus className="h-5 w-5" weight="bold" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="glass text-white text-[10px] font-bold tracking-widest uppercase border-white/10">New Session</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* ── BOTTOM UTILITY BAR ────────────────────────────────────────── */}
          <div className="shrink-0 mt-auto border-t border-white/5 bg-white/[0.01]">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2 p-3 pb-6">
                <NotificationsMenu side="right" align="center">
                  <button className="relative flex items-center justify-center h-10 w-10 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all active-scale">
                    <Bell className="h-5 w-5" weight="bold" />
                    {notifications && notifications.length > 0 && (
                      <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-zinc-950" />
                    )}
                  </button>
                </NotificationsMenu>
                
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button onClick={() => onViewChange('settings')} className="flex items-center justify-center h-10 w-10 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all active-scale">
                      <Gear className={cn('h-5 w-5', activeView === 'settings' && 'text-amber-500')} weight={activeView === 'settings' ? 'fill' : 'bold'} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="glass text-white text-[10px] font-bold tracking-widest uppercase border-white/10">Settings</TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button onClick={() => onViewChange('help')} className="flex items-center justify-center h-10 w-10 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all active-scale">
                      <Question className={cn('h-5 w-5', activeView === 'help' && 'text-amber-500')} weight={activeView === 'help' ? 'fill' : 'bold'} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="glass text-white text-[10px] font-bold tracking-widest uppercase border-white/10">Help</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="p-4 space-y-1.5">
                <NotificationsMenu side="top" align="start">
                  <button className="flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all active-scale group">
                    <div className="relative">
                      <Bell className="h-5 w-5 group-hover:text-amber-500/70 transition-colors" weight="bold" />
                      {notifications && notifications.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-zinc-950" />
                      )}
                    </div>
                    <span className="tracking-tight">Notifications</span>
                  </button>
                </NotificationsMenu>
                
                <button
                  onClick={() => onViewChange('settings')}
                  className={cn(
                    'flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition-all active-scale group',
                    activeView === 'settings' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Gear className={cn('h-5 w-5 transition-colors', activeView === 'settings' ? 'text-amber-500' : 'group-hover:text-amber-500/70')} weight={activeView === 'settings' ? 'fill' : 'bold'} />
                  <span className="tracking-tight">Settings</span>
                </button>

                <button
                  onClick={() => onViewChange('help')}
                  className={cn(
                    'flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition-all active-scale group',
                    activeView === 'help' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Question className={cn('h-5 w-5 transition-colors', activeView === 'help' ? 'text-amber-500' : 'group-hover:text-amber-500/70')} weight={activeView === 'help' ? 'fill' : 'bold'} />
                  <span className="tracking-tight">Help & Support</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── User Profile Footer ───────────────────────────────────────────── */}
        <div className="border-t border-white/5 p-4 shrink-0 bg-white/[0.02]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-3 w-full rounded-2xl p-2 text-left transition-all active-scale hover:bg-white/5',
                  isCollapsed && 'justify-center p-0'
                )}
              >
                <Avatar className="h-10 w-10 border border-white/10 shadow-lg shrink-0">
                  <AvatarFallback className="glass text-zinc-300 text-xs font-bold">
                    {userEmail?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate tracking-tight">
                        {settings.displayName || userEmail || 'Developer'}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Free Plan</p>
                    </div>
                    <CaretDown className="h-4 w-4 text-zinc-600 shrink-0" weight="bold" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isCollapsed ? 'center' : 'end'}
              side={isCollapsed ? 'right' : 'top'}
              className="w-[220px] glass border-white/10 shadow-2xl"
            >
              <DropdownMenuItem onClick={() => onViewChange('settings')} className="text-zinc-400 p-2.5 rounded-lg cursor-pointer">
                <Gear className="h-4 w-4 mr-2" weight="duotone" />
                <span className="font-medium">Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={logout} className="text-red-400 p-2.5 rounded-lg cursor-pointer">
                <SignOut className="h-4 w-4 mr-2" weight="bold" />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  )
}
