'use client'

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'
import {
  mockProjects,
  mockProjectData,
  type Project,
  type LogEntry,
  type Commit,
  type HotFile,
  type SessionRecord,
  type ProjectDataSlice,
} from './mock-data'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'

// ─── Feature Idea Type ────────────────────────────────────────────────────────
export interface FeatureIdea {
  id: string
  description: string
  status: 'draft' | 'validated' | 'in-progress'
  affectedFiles: string[]
  createdAt: Date
  promotedAt?: Date
}

// ─── Extended Project Data Slice (adds featureIdeas) ─────────────────────────
interface FullProjectSlice extends ProjectDataSlice {
  featureIdeas: FeatureIdea[]
}

const emptySlice = (): FullProjectSlice => ({
  logs: [],
  commits: [],
  hotFiles: [],
  sessions: [],
  featureIdeas: [],
})

export interface UserSettings {
  displayName: string
  bio: string
  defaultIntent: string
  focusDuration: number
  shortBreak: number
  longBreak: number
  autoStartBreaks: boolean
  aiTimerSuggestions: boolean
  sessionReminders: boolean
  breakNotifications: boolean
  commitSummaries: boolean
  soundEnabled: boolean
  soundVolume: number
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  voiceEnabled: boolean
  voiceLanguage: string
}

const defaultSettings: UserSettings = {
  displayName: '',
  bio: '',
  defaultIntent: '',
  focusDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: true,
  aiTimerSuggestions: true,
  sessionReminders: true,
  breakNotifications: true,
  commitSummaries: true,
  soundEnabled: true,
  soundVolume: 70,
  theme: 'dark',
  accentColor: 'amber',
  voiceEnabled: true,
  voiceLanguage: 'en-US',
}

const ACCENT_COLORS: Record<string, string> = {
  amber: '#f59e0b',
  blue: '#3b82f6',
  green: '#10b981',
  purple: '#a855f7',
  rose: '#f43f5e',
}

// ─── State Shape ──────────────────────────────────────────────────────────────
interface DevHubState {
  // Auth
  isAuthenticated: boolean
  userEmail: string | null

  // Projects
  projects: Project[]
  currentProject: Project | null

  // Per-project data — keyed by project.id
  projectData: Record<string, FullProjectSlice>

  // Active session
  sessionIntent: string | null
  sessionStartedAt: Date | null
  isSessionActive: boolean
  currentSessionId: string | null

  // Viewed past session (read-only archive mode)
  viewedSessionId: string | null

  // Pomodoro
  pomodoroMinutes: number
  pomodoroActive: boolean
  pomodoroDuration: number
  pomodorosCompleted: number

  // Settings
  settings: UserSettings

  // UI State
  showEndSessionDialog: boolean
  showIntentDialog: boolean
  
  // Supabase User
  user: User | null
}

// ─── Context Type ─────────────────────────────────────────────────────────────
interface DevHubContextType extends DevHubState {
  // Derived — current project's data (backward-compat surface API)
  logs: LogEntry[]
  commits: Commit[]
  hotFiles: HotFile[]
  sessions: SessionRecord[]
  featureIdeas: FeatureIdea[]

  // Derived — the unfinished (status='active') session for the current project
  unfinishedSession: SessionRecord | null

  // Auth
  logout: () => Promise<void>

  // Projects
  setCurrentProject: (project: Project) => void
  addProject: (name: string, repoUrl: string) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Session
  startSession: (intent: string) => void
  endSession: () => void
  finaliseEndSession: (outcome: 'completed' | 'abandoned') => void
  resumeSession: (session: SessionRecord) => void
  setViewedSession: (sessionId: string | null) => void
  updateSession: (id: string, updates: Partial<SessionRecord>) => void
  deleteSession: (id: string) => void

  // Logs
  addLog: (content: string, type: LogEntry['type']) => void

  // Feature Ideas
  addFeatureIdea: (description: string) => void
  validateIdea: (id: string, files?: string[]) => void
  promoteIdea: (id: string) => void

  // Pomodoro
  startPomodoro: () => void
  stopPomodoro: () => void
  resetPomodoro: () => void
  tickPomodoro: () => void
  setPomodoroDuration: (minutes: number) => void

  // Settings
  updateSettings: (updates: Partial<UserSettings>) => void

  // UI
  setShowEndSessionDialog: (show: boolean) => void
  setShowIntentDialog: (show: boolean) => void
  simulateWebhook: () => void
}

// ─── Initial State ────────────────────────────────────────────────────────────
const buildInitialProjectData = (): Record<string, FullProjectSlice> => {
  const data: Record<string, FullProjectSlice> = {}
  for (const project of mockProjects) {
    data[project.id] = {
      ...(mockProjectData[project.id] ?? emptySlice()),
      featureIdeas: [],
    }
  }
  return data
}

const DevHubContext = createContext<DevHubContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DevHubProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  
  const [state, setState] = useState<DevHubState>({
    isAuthenticated: false,
    userEmail: null,
    user: null,
    projects: mockProjects,
    currentProject: mockProjects[0],
    projectData: buildInitialProjectData(),
    sessionIntent: null,
    sessionStartedAt: null,
    isSessionActive: false,
    currentSessionId: null,
    viewedSessionId: null,
    pomodoroMinutes: 25,
    pomodoroActive: false,
    pomodoroDuration: 25,
    pomodorosCompleted: 0,
    settings: defaultSettings,
    showEndSessionDialog: false,
    showIntentDialog: false,
  })

  // Auth State Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          userEmail: session.user.email ?? null,
          user: session.user
        }))
      } else {
        setUser(null)
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          userEmail: null,
          user: null
        }))
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // ── Apply Settings (Theme & Accent) ───────────────────────────────────────
  useEffect(() => {
    const { theme, accentColor } = state.settings
    const root = document.documentElement

    // 1. Handle Theme
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 2. Handle Accent Color
    const hex = ACCENT_COLORS[accentColor] || ACCENT_COLORS.amber
    root.style.setProperty('--primary', hex)
    root.style.setProperty('--ring', hex)
    root.style.setProperty('--sidebar-primary', hex)
    // Optional: add more variable overrides if needed
  }, [state.settings.theme, state.settings.accentColor])


  // ── Derived: current project's data slice ─────────────────────────────────
  const currentSlice = useMemo<FullProjectSlice>(() => {
    if (!state.currentProject) return emptySlice()
    return state.projectData[state.currentProject.id] ?? emptySlice()
  }, [state.currentProject, state.projectData])

  // ── Derived: unfinished session for current project ───────────────────────
  const unfinishedSession = useMemo<SessionRecord | null>(() => {
    return currentSlice.sessions.find(s => s.status === 'active') ?? null
  }, [currentSlice.sessions])

  // ── Helper to mutate current project's slice ──────────────────────────────
  const mutateSlice = (id: string, updater: (slice: FullProjectSlice) => Partial<FullProjectSlice>) => {
    setState(prev => ({
      ...prev,
      projectData: {
        ...prev.projectData,
        [id]: { ...(prev.projectData[id] ?? emptySlice()), ...updater(prev.projectData[id] ?? emptySlice()) },
      },
    }))
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut()
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  const setCurrentProject = (project: Project) => {
    setState(prev => {
      // Check if the new project has an active session
      const projectSlice = prev.projectData[project.id] ?? emptySlice()
      const hasActiveSession = projectSlice.sessions.some(s => s.status === 'active')
      const activeSession = projectSlice.sessions.find(s => s.status === 'active')

      return {
        ...prev,
        currentProject: project,
        viewedSessionId: null,
        isSessionActive: hasActiveSession,
        currentSessionId: activeSession?.id ?? null,
        sessionIntent: activeSession?.intent ?? null,
        sessionStartedAt: activeSession?.startedAt ?? null,
      }
    })
  }

  const addProject = (name: string, repoUrl: string) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      repoUrl,
      lastActiveAt: new Date(),
      unresolvedThreads: 0,
    }
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
      currentProject: newProject,
      projectData: {
        ...prev.projectData,
        [newProject.id]: emptySlice(),
      },
      showIntentDialog: false,
    }))
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p),
      currentProject: prev.currentProject?.id === id ? { ...prev.currentProject, ...updates } : prev.currentProject,
    }))
  }

  const deleteProject = (id: string) => {
    setState(prev => {
      const newProjects = prev.projects.filter(p => p.id !== id)
      const newProjectData = { ...prev.projectData }
      delete newProjectData[id]
      return {
        ...prev,
        projects: newProjects,
        projectData: newProjectData,
        currentProject: prev.currentProject?.id === id ? (newProjects[0] ?? null) : prev.currentProject,
        isSessionActive: prev.currentProject?.id === id ? false : prev.isSessionActive,
        currentSessionId: prev.currentProject?.id === id ? null : prev.currentSessionId,
      }
    })
  }

  // ── Session ───────────────────────────────────────────────────────────────
  const startSession = (intent: string) => {
    const sessionId = `session-${Date.now()}`
    setState(prev => {
      // If there's an unfinished session for the current project, silently end it first
      const projectId = prev.currentProject?.id
      let updatedProjectData = prev.projectData
      if (projectId) {
        const slice = prev.projectData[projectId] ?? emptySlice()
        const hasUnfinished = slice.sessions.some(s => s.status === 'active')
        if (hasUnfinished) {
          updatedProjectData = {
            ...prev.projectData,
            [projectId]: {
              ...slice,
              sessions: slice.sessions.map(s =>
                s.status === 'active'
                  ? { ...s, status: 'ended' as const, endedAt: new Date(), outcome: 'abandoned' as const }
                  : s
              ),
            },
          }
        }
      }
      return {
        ...prev,
        sessionIntent: intent,
        sessionStartedAt: new Date(),
        isSessionActive: true,
        currentSessionId: sessionId,
        viewedSessionId: null,
        showIntentDialog: false,
        pomodoroActive: true,
        pomodoroMinutes: prev.pomodoroDuration,
        pomodorosCompleted: 0,
        projectData: updatedProjectData,
      }
    })
  }

  const endSession = () => {
    setState(prev => ({ ...prev, showEndSessionDialog: true }))
  }

  /**
   * Resumes an unfinished (status='active') session — loading its logs into
   * the active dashboard without creating a new one.
   */
  const resumeSession = (session: SessionRecord) => {
    // Mark the unfinished session as 'ended' first if we're explicitly resuming
    // (in practice we keep it active in state and just navigate to it)
    setState(prev => ({
      ...prev,
      sessionIntent: session.intent,
      sessionStartedAt: session.startedAt,
      isSessionActive: true,
      currentSessionId: session.id,
      viewedSessionId: null,
      showIntentDialog: false,
      pomodoroActive: false,
      pomodoroMinutes: prev.pomodoroDuration,
      pomodorosCompleted: 0,
    }))
  }

  /**
   * Saves the session record to project history, then clears active session.
   */
  const finaliseEndSession = (outcome: 'completed' | 'abandoned' = 'completed') => {
    setState(prev => {
      if (!prev.currentProject || !prev.sessionIntent || !prev.sessionStartedAt) {
        return { ...prev, isSessionActive: false, showEndSessionDialog: false }
      }

      const projectId = prev.currentProject.id
      const slice = prev.projectData[projectId] ?? emptySlice()
      const endedAt = new Date()
      const durationMinutes = Math.round((endedAt.getTime() - prev.sessionStartedAt.getTime()) / 60000)

      const sessionLogs = slice.logs.filter(
        l => prev.sessionStartedAt && l.createdAt >= prev.sessionStartedAt
      )
      const sessionCommits = slice.commits.filter(
        c => prev.sessionStartedAt && c.pushedAt >= prev.sessionStartedAt
      )
      const unresolvedCount = sessionLogs.filter(l => !l.linkedCommitHash).length

      const newRecord: SessionRecord = {
        id: prev.currentSessionId ?? `session-${Date.now()}`,
        projectId,
        intent: prev.sessionIntent,
        startedAt: prev.sessionStartedAt,
        endedAt,
        durationMinutes,
        outcome,
        status: 'ended',
        logCount: sessionLogs.length,
        commitCount: sessionCommits.length,
        unresolvedCount,
        logs: sessionLogs,
        commits: sessionCommits,
      }

      return {
        ...prev,
        isSessionActive: false,
        sessionIntent: null,
        sessionStartedAt: null,
        currentSessionId: null,
        pomodoroActive: false,
        pomodoroMinutes: prev.pomodoroDuration,
        pomodorosCompleted: 0,
        showEndSessionDialog: false,
        projectData: {
          ...prev.projectData,
          [projectId]: {
            ...slice,
            sessions: [newRecord, ...slice.sessions.filter(s => s.id !== newRecord.id)],
          },
        },
      }
    })
  }

  const setViewedSession = (sessionId: string | null) => {
    setState(prev => ({ ...prev, viewedSessionId: sessionId }))
  }

  const updateSession = (id: string, updates: Partial<SessionRecord>) => {
    if (!state.currentProject) return
    mutateSlice(state.currentProject.id, slice => ({
      sessions: slice.sessions.map(s => s.id === id ? { ...s, ...updates } : s)
    }))
  }

  const deleteSession = (id: string) => {
    if (!state.currentProject) return
    mutateSlice(state.currentProject.id, slice => ({
      sessions: slice.sessions.filter(s => s.id !== id)
    }))
  }

  // ── Logs ──────────────────────────────────────────────────────────────────
  const addLog = (content: string, type: LogEntry['type']) => {
    if (!state.currentProject) return
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      sessionId: state.currentSessionId ?? 'no-session',
      content,
      createdAt: new Date(),
      type,
    }
    mutateSlice(state.currentProject.id, slice => ({
      logs: [newLog, ...slice.logs],
    }))
  }

  // ── Feature Ideas ─────────────────────────────────────────────────────────
  const addFeatureIdea = (description: string) => {
    if (!state.currentProject) return
    const idea: FeatureIdea = {
      id: `idea-${Date.now()}`,
      description,
      status: 'draft',
      affectedFiles: [],
      createdAt: new Date(),
    }
    mutateSlice(state.currentProject.id, slice => ({
      featureIdeas: [idea, ...slice.featureIdeas],
    }))
  }

  const validateIdea = (id: string, files?: string[]) => {
    if (!state.currentProject) return
    mutateSlice(state.currentProject.id, slice => ({
      featureIdeas: slice.featureIdeas.map(idea =>
        idea.id === id
          ? { ...idea, status: 'validated' as const, affectedFiles: files ?? ['NewFeature.kt', 'ViewModel.kt'] }
          : idea
      ),
    }))
  }

  const promoteIdea = (id: string) => {
    if (!state.currentProject) return
    const projectId = state.currentProject.id
    const idea = (state.projectData[projectId] ?? emptySlice()).featureIdeas.find(i => i.id === id)
    if (!idea) return

    mutateSlice(projectId, slice => ({
      featureIdeas: slice.featureIdeas.map(i =>
        i.id === id ? { ...i, status: 'in-progress' as const, promotedAt: new Date() } : i
      ),
    }))

    const sessionId = `session-${Date.now()}`
    setState(prev => ({
      ...prev,
      sessionIntent: idea.description,
      sessionStartedAt: new Date(),
      isSessionActive: true,
      currentSessionId: sessionId,
      showIntentDialog: false,
      pomodoroActive: true,
      pomodoroMinutes: prev.pomodoroDuration,
      pomodorosCompleted: 0,
    }))
  }

  // ── Pomodoro ──────────────────────────────────────────────────────────────
  const startPomodoro = () => setState(prev => ({ ...prev, pomodoroActive: true }))
  const stopPomodoro = () => setState(prev => ({ ...prev, pomodoroActive: false }))
  const resetPomodoro = () => setState(prev => ({
    ...prev,
    pomodoroMinutes: prev.pomodoroDuration,
    pomodoroActive: false,
  }))
  const setPomodoroDuration = (minutes: number) =>
    setState(prev => ({ ...prev, pomodoroDuration: minutes, pomodoroMinutes: minutes }))

  const tickPomodoro = () => {
    setState(prev => {
      if (prev.pomodoroMinutes <= 0) {
        return { ...prev, pomodoroActive: false, pomodoroMinutes: 0, pomodorosCompleted: prev.pomodorosCompleted + 1 }
      }
      return { ...prev, pomodoroMinutes: prev.pomodoroMinutes - 1 }
    })
  }

  // ── Simulated GitHub Webhook ───────────────────────────────────────────────
  const simulateWebhook = () => {
    if (!state.currentProject) return
    const projectId = state.currentProject.id

    setState(prev => {
      const slice = prev.projectData[projectId] ?? emptySlice()
      const newCommit: Commit = {
        id: `commit-${Date.now()}`,
        hash: Math.random().toString(16).slice(2, 8),
        message: 'fix: simulated webhook commit',
        aiSummary: 'Simulated: This commit was automatically linked to your most recent session log.',
        linkedLogIds: slice.logs.length > 0 ? [slice.logs[0].id] : [],
        pushedAt: new Date(),
        filesChanged: ['src/screens/RadarScreen.kt'],
        additions: Math.floor(Math.random() * 25) + 5,
        deletions: Math.floor(Math.random() * 10),
      }

      const updatedLogs = slice.logs.map(log =>
        newCommit.linkedLogIds.includes(log.id)
          ? { ...log, linkedCommitHash: newCommit.hash }
          : log
      )

      const updatedHotFiles = slice.hotFiles.map((f, i) =>
        i === 0 ? { ...f, changeCount: f.changeCount + 1, lastModified: new Date() } : f
      )

      return {
        ...prev,
        projectData: {
          ...prev.projectData,
          [projectId]: {
            ...slice,
            commits: [newCommit, ...slice.commits],
            logs: updatedLogs,
            hotFiles: updatedHotFiles,
          },
        },
      }
    })
  }

  // Settings ──────────────────────────────────────────────────────────────
  const updateSettings = (updates: Partial<UserSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
      // Sync pomodoroDuration if focusDuration changed
      ...(updates.focusDuration !== undefined && { 
        pomodoroDuration: updates.focusDuration,
        pomodoroMinutes: prev.pomodoroActive ? prev.pomodoroMinutes : updates.focusDuration 
      })
    }))
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  const setShowEndSessionDialog = (show: boolean) =>
    setState(prev => ({ ...prev, showEndSessionDialog: show }))
  const setShowIntentDialog = (show: boolean) =>
    setState(prev => ({ ...prev, showIntentDialog: show }))


  return (
    <DevHubContext.Provider
      value={{
        ...state,
        // Derived: current project's scoped data
        logs: currentSlice.logs,
        commits: currentSlice.commits,
        hotFiles: currentSlice.hotFiles,
        sessions: currentSlice.sessions,
        featureIdeas: currentSlice.featureIdeas,
        unfinishedSession,
        // Methods
        logout,
        setCurrentProject,
        addProject,
        updateProject,
        deleteProject,
        startSession,
        endSession,
        finaliseEndSession,
        resumeSession,
        setViewedSession,
        updateSession,
        deleteSession,
        addLog,
        addFeatureIdea,
        validateIdea,
        promoteIdea,
        startPomodoro,
        stopPomodoro,
        resetPomodoro,
        tickPomodoro,
        setPomodoroDuration,
        updateSettings,
        setShowEndSessionDialog,
        setShowIntentDialog,
        simulateWebhook,
      }}
    >
      {children}
    </DevHubContext.Provider>
  )
}

export function useDevHub() {
  const context = useContext(DevHubContext)
  if (!context) throw new Error('useDevHub must be used within a DevHubProvider')
  return context
}
