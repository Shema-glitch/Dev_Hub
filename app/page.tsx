'use client'

import { DevHubShell } from '@/components/devhub/devhub-shell'
import { DevHubProvider, useDevHub } from '@/lib/devhub-context'
import { AuthScreen } from '@/components/devhub/auth-screen'

function AppContent() {
  const { isAuthenticated } = useDevHub()

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return <DevHubShell />
}

export default function Page() {
  return (
    <DevHubProvider>
      <AppContent />
    </DevHubProvider>
  )
}
