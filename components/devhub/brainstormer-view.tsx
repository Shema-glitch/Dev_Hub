'use client'

import { useState } from 'react'
import {
  Brain,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Rocket,
  FileCode,
  CheckCircle2,
  Loader2,
  X,
  ChevronRight,
  Zap,
  Layout,
  Network,
  Cpu,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useDevHub } from '@/lib/devhub-context'
import { cn } from '@/lib/utils'

interface BrainstormerViewProps {
  onNavigateToDashboard?: () => void
}

export function BrainstormerView({ onNavigateToDashboard }: BrainstormerViewProps) {
  const { featureIdeas, addFeatureIdea, validateIdea, promoteIdea, removeFeatureIdea } = useDevHub()
  const [newIdea, setNewIdea] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [promotedId, setPromotedId] = useState<string | null>(null)

  const handleSubmitIdea = async () => {
    if (!newIdea.trim()) return
    setIsAnalyzing(true)
    addFeatureIdea(newIdea.trim())
    await new Promise(resolve => setTimeout(resolve, 1800))
    setIsAnalyzing(false)
    setNewIdea('')
  }

  const handleValidate = async (id: string) => {
    setIsAnalyzing(true)
    validateIdea(id)
    setIsAnalyzing(false)
  }

  const handlePromote = (id: string, description: string) => {
    setPromotedId(id)
    setTimeout(() => {
      promoteIdea(id)
      setPromotedId(null)
      onNavigateToDashboard?.()
    }, 1200)
  }

  const statusConfig = {
    draft:       { label: 'Draft',         color: 'border-purple-500/15 text-purple-400', icon: Lightbulb, iconColor: 'text-purple-400', bg: 'bg-purple-500/10' },
    validated:   { label: 'Validated',     color: 'border-green-500/15 text-green-400',  icon: CheckCircle2,iconColor: 'text-green-400',  bg: 'bg-green-500/10' },
    'in-progress':{ label: 'Active Intent', color: 'border-amber-500/15 text-amber-400', icon: Rocket,     iconColor: 'text-amber-400',  bg: 'bg-amber-500/10' },
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
      
      {/* Main Brainstorming Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-12 space-y-12">
          
          <div className="max-w-3xl space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Idea Architect</h2>
                <p className="text-sm text-zinc-500 font-medium mt-1">
                  Visualize the future of your project and map out technical paths.
                </p>
              </div>
              {featureIdeas.length > 0 && (
                <Badge className="glass border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  {featureIdeas.length} Active Nodes
                </Badge>
              )}
            </div>

            {/* Idea Input */}
            <div className={cn(
              "relative rounded-3xl glass shadow-2xl shadow-black/60 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/40 transition-all duration-500 overflow-hidden flex flex-col group/brainstorm",
              isAnalyzing ? "opacity-70 pointer-events-none" : ""
            )}>
              {/* Header Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 text-[10px] font-bold tracking-widest uppercase group-focus-within/brainstorm:text-amber-500 group-focus-within/brainstorm:bg-amber-500/10 transition-all duration-300">
                  <Brain className="h-3 w-3" />
                  Synthesis Module
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">v1.5 Alpha</span>
                </div>
              </div>

              <Textarea
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder="Describe a new feature or architectural pivot..."
                className="min-h-[120px] max-h-[250px] resize-none border-0 bg-transparent text-zinc-100 placeholder:text-zinc-600 text-base p-5 leading-relaxed focus-visible:ring-0"
                disabled={isAnalyzing}
              />

              <div className="flex items-center justify-between px-4 pb-4 pt-1">
                <div className="flex items-center gap-2 pl-2">
                  <Sparkles className="h-4 w-4 text-amber-500/50" />
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    AI will map code impact zones
                  </p>
                </div>
                
                <button
                  onClick={handleSubmitIdea}
                  disabled={!newIdea.trim() || isAnalyzing}
                  className="group/btn flex items-center justify-center h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black transition-all active-scale shadow-xl shadow-amber-500/20"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <ArrowRight className="h-6 w-6 transition-transform group-hover/btn:translate-x-0.5" weight="bold" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Ideas Feed */}
          <div className="max-w-3xl space-y-8 pb-32">
            {featureIdeas.length === 0 && !isAnalyzing ? (
              <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-700 opacity-60">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl glass border-dashed border-white/10 mb-6 group hover:border-amber-500/30 transition-colors duration-500">
                  <Lightbulb className="h-10 w-10 text-zinc-700 group-hover:text-amber-500/50 transition-colors duration-500" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mb-2">The Canvas is Empty</h3>
                <p className="text-sm text-zinc-500 max-w-sm leading-relaxed font-medium">
                  Start describing your next big feature. The Architect will help you visualize the implementation path.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {featureIdeas.map((idea, index) => {
                  const cfg = statusConfig[idea.status]
                  const Icon = cfg.icon
                  const isPromoted = promotedId === idea.id

                  return (
                    <div 
                      key={idea.id} 
                      className={cn(
                        "glass rounded-3xl p-8 group relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo transition-all",
                        idea.status === 'in-progress' && 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]',
                        isPromoted && 'scale-[1.01] border-green-500/40 bg-green-500/10'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                        <Brain className="h-24 w-24 text-primary" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110", cfg.bg)}>
                              <Icon className={cn("h-5 w-5", cfg.iconColor)} />
                            </div>
                            <div className="flex flex-col">
                              <Badge variant="outline" className={cn('text-[10px] font-bold uppercase tracking-widest border-white/5 mb-1', cfg.color, cfg.bg)}>
                                {isPromoted ? '🚀 Promoted!' : cfg.label}
                              </Badge>
                              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                Registered {new Date(idea.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => removeFeatureIdea(idea.id)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-700 hover:text-red-400 transition-all active-scale">
                             <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <p className="text-lg text-white font-bold tracking-tight mb-4 group-hover:text-amber-500 transition-colors">
                          {idea.description.split('\n')[0].slice(0, 60)}...
                        </p>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-8 line-clamp-3">{idea.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-zinc-600" />
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Impact Zone</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {idea.affectedFiles.map(file => (
                                <span key={file} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-zinc-300 hover:border-amber-500/30 transition-colors">
                                  {file.split('/').pop()}
                                </span>
                              ))}
                              {idea.affectedFiles.length === 0 && (
                                <span className="text-xs text-zinc-600 italic">No files mapped yet</span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-zinc-600" />
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Complexity Rank</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Score</span>
                                <span className="text-[11px] font-bold text-white">74 / 100</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 w-[74%] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
                          <div className="flex gap-2">
                            {idea.status === 'draft' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleValidate(idea.id)}
                                className="glass border-white/5 text-[10px] font-bold uppercase tracking-widest h-10 px-6 rounded-xl active-scale hover:bg-white/10"
                              >
                                <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                                Synchronize Context
                              </Button>
                            )}
                            {idea.status !== 'in-progress' && (
                              <Button
                                size="sm"
                                onClick={() => handlePromote(idea.id, idea.description)}
                                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl active-scale"
                                disabled={isPromoted}
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Initiate Sequence
                              </Button>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            Node: #{idea.id.slice(0, 4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Cortex Signals */}
      <div className="w-80 shrink-0 border-l border-white/5 bg-zinc-950/50 p-8 space-y-10 hidden xl:flex flex-col overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <Network className="h-4 w-4 text-amber-500" />
             <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Cortex Topology</h3>
          </div>
          
          <div className="glass rounded-[32px] p-8 aspect-square relative flex items-center justify-center overflow-hidden border-white/5">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 24px' }} />
             <div className="relative">
                <div className="h-20 w-20 rounded-full glass border-amber-500/40 flex items-center justify-center">
                   <div className="h-10 w-10 rounded-full bg-amber-500 animate-pulse flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-black" />
                   </div>
                </div>
                {/* Simulated Nodes */}
                <div className="absolute -top-4 -left-4 h-6 w-6 rounded-full glass border-white/20" />
                <div className="absolute top-12 -right-8 h-8 w-8 rounded-full glass border-white/20" />
                <div className="absolute -bottom-8 left-4 h-10 w-10 rounded-full glass border-white/20" />
             </div>
          </div>
          <p className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Mapping brainstormed nodes to file structure</p>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-3">
             <Zap className="h-4 w-4 text-zinc-500" />
             <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Synthesis Power</h3>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>Memory usage</span>
                <span className="text-white">Low</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500/50 w-[24%]" />
             </div>
             <p className="text-[10px] text-zinc-600 leading-relaxed italic">The engine currently has high availability for new architectural synthesis.</p>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-white/5">
           <Button className="w-full glass glass-hover h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest active-scale text-zinc-400 hover:text-white">
              <ChevronRight className="h-4 w-4 mr-2" /> Neural Knowledge Base
           </Button>
        </div>
      </div>
    </div>
  )
}
