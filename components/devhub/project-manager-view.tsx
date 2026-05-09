'use client'

import { useState } from 'react'
import {
  Plus,
  Trash,
  Clock,
  MagnifyingGlass,
  FolderOpen,
  Folder,
  DotsThreeVertical,
  PencilSimple,
  ChartLineUp,
  Files,
} from '@phosphor-icons/react'
import {
  Kanban,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowRight,
  MoreVertical,
  Zap,
  Globe,
} from 'lucide-react'
import { useDevHub } from '@/lib/devhub-context'
import { Project, SessionRecord } from '@/lib/mock-data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function ProjectManagerView() {
  const {
    projects,
    currentProject,
    setCurrentProject,
    addProject,
    updateProject,
    deleteProject,
    sessions,
    updateSession,
    deleteSession,
  } = useDevHub()

  // Project Modals
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectRepo, setProjectRepo] = useState('')

  // Session Modals
  const [isEditSessionOpen, setIsEditSessionOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionRecord | null>(null)
  const [sessionIntent, setSessionIntent] = useState('')

  // Kanban setup
  const activeSessions = sessions.filter(s => s.status === 'active')
  const completedSessions = sessions.filter(s => s.status === 'ended' && s.outcome === 'completed')
  const abandonedSessions = sessions.filter(s => s.status === 'ended' && s.outcome === 'abandoned')

  // Helpers
  const handleEditProjectClick = (p: Project) => {
    setEditingProject(p)
    setProjectName(p.name)
    setProjectRepo(p.repoUrl)
    setIsEditProjectOpen(true)
  }

  const handleSaveProject = () => {
    if (editingProject && projectName.trim()) {
      updateProject(editingProject.id, { name: projectName, repoUrl: projectRepo })
      setIsEditProjectOpen(false)
    }
  }

  const handleAddProject = () => {
    if (projectName.trim()) {
      addProject(projectName, projectRepo)
      setIsAddProjectOpen(false)
      setProjectName('')
      setProjectRepo('')
    }
  }

  const handleEditSessionClick = (s: SessionRecord) => {
    setEditingSession(s)
    setSessionIntent(s.intent)
    setIsEditSessionOpen(true)
  }

  const handleSaveSession = () => {
    if (editingSession && sessionIntent.trim()) {
      updateSession(editingSession.id, { intent: sessionIntent })
      setIsEditSessionOpen(false)
    }
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
      
      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-12 space-y-12">
          
          <div className="max-w-5xl flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Project Architect</h2>
              <p className="text-sm text-zinc-500 font-medium mt-1">
                Organize your workspaces and archival session history.
              </p>
            </div>
            <Button
              onClick={() => {
                setProjectName('')
                setProjectRepo('')
                setIsAddProjectOpen(true)
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl active-scale"
            >
              <Plus className="h-4 w-4 mr-2" weight="bold" />
              New Workspace
            </Button>
          </div>

          <div className="flex gap-8 h-[600px] min-h-[500px] max-w-[1400px]">
            {/* Project List Sidebar */}
            <div className="w-80 shrink-0 flex flex-col glass rounded-3xl overflow-hidden border-white/5">
              <div className="p-6 border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Workspaces</h3>
                  <Badge className="glass border-white/10 text-zinc-400 text-[10px]">{projects.length}</Badge>
                </div>
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <Input
                    placeholder="Search projects..."
                    className="h-10 pl-10 glass border-white/5 text-xs focus-visible:ring-1 focus-visible:ring-amber-500/50 rounded-xl"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all active-scale",
                      currentProject?.id === p.id 
                        ? "bg-white/10 text-white" 
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setCurrentProject(p)}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                        currentProject?.id === p.id ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-white/5 text-zinc-600"
                      )}>
                        {currentProject?.id === p.id ? <FolderOpen weight="fill" className="h-5 w-5" /> : <Folder weight="fill" className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate tracking-tight">
                          {p.name}
                        </p>
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">
                          {p.repoUrl ? 'Connected' : 'Local Only'}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-white/10 text-zinc-500 transition-all shrink-0">
                          <DotsThreeVertical className="h-4 w-4" weight="bold" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-white/10 shadow-2xl w-48">
                        <DropdownMenuItem onClick={() => handleEditProjectClick(p)} className="gap-3 p-3 rounded-lg cursor-pointer">
                          <PencilSimple className="h-4 w-4" /> 
                          <span className="text-[10px] font-bold uppercase tracking-widest">Edit Workspace</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem className="text-red-400 focus:text-red-400 gap-3 p-3 rounded-lg cursor-pointer" onClick={() => deleteProject(p.id)}>
                          <Trash className="h-4 w-4" /> 
                          <span className="text-[10px] font-bold uppercase tracking-widest">Delete forever</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 flex flex-col glass rounded-3xl border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                  Sequence History
                  <span className="text-[10px] px-3 py-1 rounded-full glass border-white/10 text-amber-500 font-bold uppercase tracking-widest">
                    {currentProject?.name || 'No Selection'}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Neural Link Sync</span>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-x-auto">
                {currentProject ? (
                  <div className="flex gap-8 h-full min-w-max pb-4">
                    <KanbanColumn 
                      title="In Progress" 
                      count={activeSessions.length} 
                      sessions={activeSessions}
                      color="text-amber-500"
                      dotColor="bg-amber-500"
                      icon={Activity}
                      onEdit={handleEditSessionClick}
                      onDelete={deleteSession}
                    />
                    <KanbanColumn 
                      title="Completed" 
                      count={completedSessions.length} 
                      sessions={completedSessions}
                      color="text-green-500"
                      dotColor="bg-green-500"
                      icon={CheckCircle2}
                      onEdit={handleEditSessionClick}
                      onDelete={deleteSession}
                    />
                    <KanbanColumn 
                      title="Abandoned" 
                      count={abandonedSessions.length} 
                      sessions={abandonedSessions}
                      color="text-red-400"
                      dotColor="bg-red-400"
                      icon={XCircle}
                      onEdit={handleEditSessionClick}
                      onDelete={deleteSession}
                    />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Kanban className="h-16 w-16 text-zinc-700 mb-4" />
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Select a workspace to view historical sequences</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Workspace Analytics */}
      <div className="w-80 shrink-0 border-l border-white/5 bg-zinc-950/50 p-8 space-y-10 hidden xl:flex flex-col overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <ChartLineUp className="h-4 w-4 text-amber-500" weight="bold" />
             <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Neural Analytics</h3>
          </div>
          
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 border-white/5 space-y-3">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Efficiency Rating</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">A+</span>
                <span className="text-xs text-amber-500 font-bold">TOP 5%</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border-white/5 space-y-4">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Outcome Ratios</p>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-green-500">Success</span>
                    <span className="text-zinc-300">82%</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-green-500 w-[82%]" />
                    <div className="h-full bg-red-400 w-[18%]" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-3">
             <Files className="h-4 w-4 text-zinc-500" weight="bold" />
             <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Asset Index</h3>
          </div>
          <div className="glass rounded-2xl p-6 border-white/5 text-center space-y-1">
             <p className="text-3xl font-bold text-white">412</p>
             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Synchronized Source Files</p>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5">
           <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3 mb-6">
              <div className="flex items-center gap-2 text-amber-500">
                 <Zap className="h-4 w-4" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Engine Tip</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                 Projects with a connected <span className="text-white">GitHub Forge</span> have 3x higher semantic linking accuracy.
              </p>
           </div>
           <Button className="w-full glass glass-hover h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest active-scale text-zinc-400 hover:text-white">
              <Globe className="h-4 w-4 mr-2" /> Global Explorer
           </Button>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="glass border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">Edit Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Workspace Name</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="glass border-white/5 h-12 rounded-xl focus:ring-amber-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Repository URL</Label>
              <Input
                value={projectRepo}
                onChange={(e) => setProjectRepo(e.target.value)}
                className="glass border-white/5 h-12 rounded-xl focus:ring-amber-500/20"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsEditProjectOpen(false)} className="text-[10px] font-bold uppercase tracking-widest rounded-xl">Cancel</Button>
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-widest h-11 px-8 rounded-xl active-scale" onClick={handleSaveProject}>Update Workspace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="glass border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Workspace Name *</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Acme SaaS"
                className="glass border-white/5 h-12 rounded-xl focus:ring-amber-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Repository URL</Label>
              <Input
                value={projectRepo}
                onChange={(e) => setProjectRepo(e.target.value)}
                placeholder="https://github.com/..."
                className="glass border-white/5 h-12 rounded-xl focus:ring-amber-500/20"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsAddProjectOpen(false)} className="text-[10px] font-bold uppercase tracking-widest rounded-xl">Cancel</Button>
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-widest h-11 px-8 rounded-xl active-scale" onClick={handleAddProject}>Create Workspace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditSessionOpen} onOpenChange={setIsEditSessionOpen}>
        <DialogContent className="glass border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">Edit Sequence</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mission Intent</Label>
              <Input
                value={sessionIntent}
                onChange={(e) => setSessionIntent(e.target.value)}
                className="glass border-white/5 h-12 rounded-xl focus:ring-amber-500/20"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsEditSessionOpen(false)} className="text-[10px] font-bold uppercase tracking-widest rounded-xl">Cancel</Button>
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-widest h-11 px-8 rounded-xl active-scale" onClick={handleSaveSession}>Update Intent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function KanbanColumn({ title, count, sessions, color, dotColor, icon: Icon, onEdit, onDelete }: any) {
  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-6 px-1">
        <h3 className={cn("text-[10px] font-bold uppercase tracking-widest flex items-center gap-2.5", color)}>
          <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse blur-[1px]", dotColor)} />
          {title}
        </h3>
        <Badge className="glass border-white/5 text-zinc-500 text-[10px] font-bold px-2 py-0.5">{count}</Badge>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pb-8 pr-2 -mr-2 custom-scrollbar">
        {sessions.map((s: SessionRecord) => (
          <SessionCard
            key={s.id}
            session={s}
            onEdit={() => onEdit(s)}
            onDelete={() => onDelete(s.id)}
          />
        ))}
        {sessions.length === 0 && (
          <div className="glass border-dashed border-white/5 rounded-2xl h-32 flex flex-col items-center justify-center text-center p-6 opacity-40 transition-all hover:opacity-60">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Empty Stage</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SessionCard({ session, onEdit, onDelete }: { session: SessionRecord, onEdit: () => void, onDelete: () => void }) {
  const isCompleted = session.status === 'ended' && session.outcome === 'completed'
  const isAbandoned = session.status === 'ended' && session.outcome === 'abandoned'
  const isActive = session.status === 'active'
  
  return (
    <div className="group glass glass-hover rounded-2xl p-6 transition-all active-scale cursor-default border-white/5 hover:border-white/10 relative overflow-hidden">
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <div className="flex gap-2">
            {isActive && <Badge className="bg-amber-500 text-black text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-none">Active</Badge>}
            {isCompleted && <Badge className="bg-green-500 text-black text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-none">Done</Badge>}
            {isAbandoned && <Badge className="bg-red-400 text-black text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border-none">Dropped</Badge>}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-600 hover:text-white transition-all">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass border-white/10 shadow-2xl w-40">
            <DropdownMenuItem onClick={onEdit} className="gap-3 p-3 rounded-lg cursor-pointer">
              <PencilSimple className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Edit Intent</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="text-red-400 focus:text-red-400 gap-3 p-3 rounded-lg cursor-pointer" onClick={() => onDelete()}>
              <Trash className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <p className="text-sm text-zinc-200 font-bold leading-relaxed mb-6 line-clamp-3 relative z-10 group-hover:text-white transition-colors">
        {session.intent}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-2 text-zinc-500">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {session.durationMinutes ? `${session.durationMinutes}m` : 'Running'}
          </span>
        </div>
        <div className="flex items-center gap-4">
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <div className="flex items-center gap-1.5">
                   <div className="h-1.5 w-1.5 rounded-full bg-amber-500/50" />
                   <span className="text-[10px] font-bold text-zinc-600">{(session as any).logCount || 0}</span>
                 </div>
               </TooltipTrigger>
               <TooltipContent className="glass text-white text-[10px] font-bold uppercase tracking-widest border-white/10">Logs recorded</TooltipContent>
             </Tooltip>
           </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
