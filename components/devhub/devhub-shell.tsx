'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from './app-sidebar'
import { SessionHeader } from './session-header'
import { DashboardView } from './dashboard-view'
import { WeirdStuffFeed } from './weird-stuff-feed'
import { ActivityView } from './activity-view'
import { BrainstormerView } from './brainstormer-view'
import { SettingsView } from './settings-view'
import { WelcomeScreen } from './welcome-screen'
import { OnboardingScreen } from './onboarding-screen'
import { SessionDetailView } from './session-detail-view'
import { EndSessionDialog } from './end-session-dialog'
import { IntentDialog } from './intent-dialog'
import { HelpSupportView } from './help-support-view'
import { ProjectManagerView } from './project-manager-view'
import { useDevHub } from '@/lib/devhub-context'
import { type SessionRecord } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type ActiveView = 'dashboard' | 'projects' | 'feed' | 'activity' | 'brainstorm' | 'settings' | 'help'

export function DevHubShell() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [viewedSession, setViewedSession] = useState<SessionRecord | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const {
    isSessionActive,
    projects,
    currentProject,
    startSession,
    resumeSession,
    setViewedSession: setContextViewedSession,
    setShowIntentDialog,
  } = useDevHub()

  // Determine what the main area shows
  const isOnboarding = projects.length === 0

  // When session ends, clear any viewed session so we go to welcome/history mode
  useEffect(() => {
    if (isSessionActive) {
      setViewedSession(null)
      setContextViewedSession(null)
    }
  }, [isSessionActive])

  // Transition helper — fades between views
  const transition = (fn: () => void) => {
    setIsTransitioning(true)
    setTimeout(() => {
      fn()
      setIsTransitioning(false)
    }, 300)
  }

  const handleViewChange = (view: string) => {
    transition(() => {
      setViewedSession(null)
      setContextViewedSession(null)
      setActiveView(view as ActiveView)
    })
  }

  const handleStartSession = (intent: string) => {
    setViewedSession(null)
    setContextViewedSession(null)
    startSession(intent)
    transition(() => setActiveView('dashboard'))
  }

  // Called by sidebar "+ New Session" button
  const handleNewSession = () => {
    transition(() => {
      setViewedSession(null)
      setContextViewedSession(null)
      setShowIntentDialog(true)
    })
  }

  // Called when clicking a past session in sidebar or welcome screen
  const handleViewSession = (session: SessionRecord) => {
    if (session.status === 'active') {
      // Resume unfinished session directly
      resumeSession(session.projectId, session.id)
      transition(() => setActiveView('dashboard'))
    } else {
      transition(() => {
        setViewedSession(session)
        setContextViewedSession(session.id)
        setActiveView('dashboard')
      })
    }
  }

  // Back from session detail → welcome / history view
  const handleBackFromSession = () => {
    transition(() => {
      setViewedSession(null)
      setContextViewedSession(null)
    })
  }

  // ── Main content renderer ─────────────────────────────────────────────────
  const renderMain = () => {
    // Global views that do not require session and should bypass onboarding
    if (activeView === 'settings') return <SettingsView />
    if (activeView === 'help') return <HelpSupportView />

    // 1. Onboarding — new user with zero projects
    if (isOnboarding) {
      return <OnboardingScreen onProjectCreated={() => setShowIntentDialog(true)} />
    }

    // Handle dashboard specifically
    if (activeView === 'dashboard') {
      // 2. Session detail — viewing a past session (read-only archive)
      if (viewedSession) {
        return (
          <SessionDetailView
            session={viewedSession}
            onBack={handleBackFromSession}
            onNewSession={handleNewSession}
          />
        )
      }
      
      // 3. Welcome screen — idle, no session
      if (!isSessionActive) {
        return (
          <WelcomeScreen
            onStartSession={handleStartSession}
            onBrainstorm={() => { startSession('Brainstorming ideas'); transition(() => setActiveView('brainstorm')) }}
            onLogBug={() => { startSession('Logging a bug'); transition(() => setActiveView('feed')) }}
            onResumeSession={() => transition(() => setActiveView('dashboard'))}
          />
        )
      }

      // Active Dashboard
      return (
        <DashboardView
          onNavigateToFeed={() => setActiveView('feed')}
          onNavigateToActivity={() => setActiveView('activity')}
        />
      )
    }

    // 4. Other global/project views
    switch (activeView) {
      case 'projects':   return <ProjectManagerView />
      case 'feed':       return <WeirdStuffFeed />
      case 'activity':   return <ActivityView />
      case 'brainstorm': return <BrainstormerView onNavigateToDashboard={() => setActiveView('dashboard')} />
      default:           return <DashboardView />
    }
  }

  // Compute sidebar's activeView indicator
  const sidebarActiveView = activeView

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <AppSidebar
        activeView={sidebarActiveView}
        onViewChange={handleViewChange}
        onViewSession={handleViewSession}
        onNewSession={handleNewSession}
      />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Session header only shows during active session */}
        {isSessionActive && <SessionHeader />}

        <div
          className={cn(
            'flex-1 overflow-auto transition-all duration-500 transform ease-out-expo',
            isTransitioning
              ? 'opacity-0 scale-[0.99] translate-y-1'
              : 'opacity-100 scale-100 translate-y-0 animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out-expo'
          )}
          key={
            isOnboarding ? 'onboarding'
            : viewedSession ? `session-${viewedSession.id}`
            : (!isSessionActive && activeView === 'dashboard') ? 'welcome'
            : activeView
          }
        >
          {renderMain()}
        </div>
      </main>

      {/* Global Dialogs */}
      <IntentDialog />
      <EndSessionDialog />
    </div>
  )
}
