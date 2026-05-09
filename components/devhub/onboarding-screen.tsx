'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, GithubLogo, ArrowRight, Spinner, ArrowSquareOut, Folder, Sparkle, XCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDevHub } from '@/lib/devhub-context'
import { cn } from '@/lib/utils'

interface OnboardingScreenProps {
  onProjectCreated?: () => void
}

export function OnboardingScreen({ onProjectCreated }: OnboardingScreenProps) {
  const { addProject, userEmail } = useDevHub()
  const [mode, setMode] = useState<'choose' | 'create' | 'import'>('choose')
  const [projectName, setProjectName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const userName = userEmail?.split('@')[0] || 'Developer'

  const handleCreate = async () => {
    if (!projectName.trim()) {
      setError('Project name is required')
      return
    }
    setIsLoading(true)
    setError('')
    // Simulate async repo setup
    await new Promise(r => setTimeout(r, 1200))
    addProject(projectName.trim(), repoUrl.trim() || `https://github.com/${userName}/${projectName.toLowerCase().replace(/\s+/g, '-')}`)
    setIsLoading(false)
    onProjectCreated?.()
  }

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      setError('Repository URL is required')
      return
    }
    setIsLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 1500))
    // Derive project name from URL
    const name = repoUrl.trim().split('/').pop()?.replace(/-/g, ' ') || 'My Project'
    const formatted = name.charAt(0).toUpperCase() + name.slice(1)
    addProject(formatted, repoUrl.trim())
    setIsLoading(false)
    onProjectCreated?.()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
      <div className="w-full max-w-2xl space-y-12">

        {/* Hero */}
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image 
                  src="/favicon_io/android-chrome-192x192.png" 
                  alt="DevHub Logo" 
                  width={48} 
                  height={48} 
                  className="relative z-10 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
              Welcome to the <span className="text-amber-500 text-glow">Consciousness Engine</span>
            </h1>
            <p className="text-xl text-zinc-400 mt-6 max-w-xl mx-auto leading-relaxed font-medium">
              Initialize your first workspace to begin synchronization of sessions, thoughts, and code pushes.
            </p>
          </div>
        </div>

        {/* Mode: Choose */}
        {mode === 'choose' && (
          <div className="grid gap-4 w-full">
            <button
              onClick={() => setMode('create')}
              className="group flex items-center gap-6 w-full p-8 rounded-3xl glass glass-hover transition-all active-scale text-left"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                <Plus className="h-6 w-6" weight="bold" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-white tracking-tight">Create Fresh Workspace</p>
                <p className="text-sm text-zinc-500 font-medium mt-1">Start from zero and build your context manually.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" weight="bold" />
            </button>

            <button
              onClick={() => setMode('import')}
              className="group flex items-center gap-6 w-full p-8 rounded-3xl glass glass-hover transition-all active-scale text-left"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400 group-hover:bg-white/10 transition-colors">
                <GithubLogo className="h-6 w-6" weight="fill" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-white tracking-tight">Import from GitHub</p>
                <p className="text-sm text-zinc-500 font-medium mt-1">Connect an existing repository to bootstrap intelligence.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" weight="bold" />
            </button>
          </div>
        )}

        {/* Mode: Create */}
        {mode === 'create' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-xl mx-auto">
            <div className="glass rounded-3xl p-8 space-y-8 border-white/5">
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Folder className="h-5 w-5 text-amber-500" weight="duotone" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">New Workspace</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Workspace Name *</Label>
                  <Input
                    value={projectName}
                    onChange={e => { setProjectName(e.target.value); setError('') }}
                    placeholder="e.g. NodeLink SaaS"
                    className="glass border-white/5 h-12 rounded-xl focus:ring-amber-500/20 text-white placeholder:text-zinc-700"
                    disabled={isLoading}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                    Repository URL <span className="text-zinc-600">(Optional)</span>
                  </Label>
                  <Input
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="glass border-white/5 h-12 rounded-xl focus:ring-amber-500/20 text-white placeholder:text-zinc-700"
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="text-xs font-bold text-red-400 animate-in fade-in flex items-center gap-2">
                    <XCircle weight="fill" className="h-4 w-4" />
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => { setMode('choose'); setError('') }}
                  className="px-6 h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!projectName.trim() || isLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-widest h-12 rounded-xl shadow-xl shadow-amber-500/20 active-scale transition-all"
                >
                  {isLoading ? (
                    <><Spinner className="h-5 w-5 mr-3 animate-spin" />Configuring Engine…</>
                  ) : (
                    <><Plus className="h-5 w-5 mr-3" weight="bold" />Initialize Workspace</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mode: Import */}
        {mode === 'import' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-xl mx-auto">
            <div className="glass rounded-3xl p-8 space-y-8 border-white/5">
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <GithubLogo className="h-5 w-5 text-white" weight="fill" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">GitHub Import</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Repository URL *</Label>
                  <div className="relative">
                    <ArrowSquareOut className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      value={repoUrl}
                      onChange={e => { setRepoUrl(e.target.value); setError('') }}
                      placeholder="https://github.com/user/project"
                      className="pl-12 glass border-white/5 h-12 rounded-xl focus:ring-amber-500/20 text-white placeholder:text-zinc-700"
                      disabled={isLoading}
                      onKeyDown={e => e.key === 'Enter' && handleImport()}
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-xs font-bold text-red-400 animate-in fade-in flex items-center gap-2">
                    <XCircle weight="fill" className="h-4 w-4" />
                    {error}
                  </p>
                )}
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">
                  We'll automatically extract metadata and history.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => { setMode('choose'); setError('') }}
                  className="px-6 h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!repoUrl.trim() || isLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-widest h-12 rounded-xl shadow-xl shadow-amber-500/20 active-scale transition-all"
                >
                  {isLoading ? (
                    <><Spinner className="h-5 w-5 mr-3 animate-spin" />Extracting Context…</>
                  ) : (
                    <><GithubLogo className="h-5 w-5 mr-3" weight="fill" />Import Workspace</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
