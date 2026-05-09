'use client'

import { useState } from 'react'
import {
  User,
  Bell,
  Clock,
  Github,
  Mic,
  Volume2,
  Moon,
  Sun,
  Palette,
  Shield,
  Check,
  Zap,
  Layout,
  Settings2,
  Globe,
  Monitor,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useDevHub } from '@/lib/devhub-context'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { cn } from '@/lib/utils'

interface VoiceInputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
}

function VoiceInputField({ label, value, onChange, placeholder, description }: VoiceInputFieldProps) {
  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    onResult: (transcript) => onChange(transcript),
  })

  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 glass border-white/5 focus-visible:ring-amber-500/20 text-white placeholder:text-zinc-600 h-12 rounded-xl"
        />
        {isSupported && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={isListening ? stopListening : startListening}
            className={cn(
              'shrink-0 glass border-white/5 h-12 w-12 rounded-xl transition-all active-scale',
              isListening && 'bg-amber-500/20 border-amber-500/40 text-amber-500'
            )}
          >
            <Mic className={cn('h-5 w-5', isListening && 'animate-pulse')} />
          </Button>
        )}
      </div>
      {description && <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-tight px-1">{description}</p>}
    </div>
  )
}

export function SettingsView() {
  const { userEmail, settings, updateSettings } = useDevHub()
  const { setTheme } = useTheme()
  
  // Local state for non-instant settings
  const [displayName, setDisplayName] = useState(settings.displayName)
  const [bio, setBio] = useState(settings.bio)
  const [defaultIntent, setDefaultIntent] = useState(settings.defaultIntent)
  const [saved, setSaved] = useState(false)
  
  // Timer settings
  const [focusDuration, setFocusDuration] = useState([settings.focusDuration])
  const [shortBreak, setShortBreak] = useState([settings.shortBreak])
  const [longBreak, setLongBreak] = useState([settings.longBreak])
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks)
  const [aiTimerSuggestions, setAiTimerSuggestions] = useState(settings.aiTimerSuggestions)
  
  // Notifications
  const [sessionReminders, setSessionReminders] = useState(settings.sessionReminders)
  const [breakNotifications, setBreakNotifications] = useState(settings.breakNotifications)
  const [commitSummaries, setCommitSummaries] = useState(settings.commitSummaries)
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled)
  const [soundVolume, setSoundVolume] = useState([settings.soundVolume])
  
  // Voice
  const [voiceEnabled, setVoiceEnabled] = useState(settings.voiceEnabled)
  const [voiceLanguage, setVoiceLanguage] = useState(settings.voiceLanguage)
  
  // Appearance (Instant)
  const { theme, accentColor } = settings

  const handleSave = () => {
    updateSettings({
      displayName,
      bio,
      defaultIntent,
      focusDuration: focusDuration[0],
      shortBreak: shortBreak[0],
      longBreak: longBreak[0],
      autoStartBreaks,
      aiTimerSuggestions,
      sessionReminders,
      breakNotifications,
      commitSummaries,
      soundEnabled,
      soundVolume: soundVolume[0],
      voiceEnabled,
      voiceLanguage,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const accentColors = [
    { id: 'amber', color: 'bg-amber-500', label: 'Amber' },
    { id: 'blue', color: 'bg-blue-500', label: 'Blue' },
    { id: 'green', color: 'bg-green-500', label: 'Green' },
    { id: 'purple', color: 'bg-purple-500', label: 'Purple' },
    { id: 'rose', color: 'bg-rose-500', label: 'Rose' },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
      {/* Premium Header - Static */}
      <div className="relative w-full h-[200px] shrink-0 border-b border-white/5 bg-zinc-900/20 overflow-hidden flex flex-col justify-end px-12 pb-8">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="absolute -top-24 left-1/4 w-[600px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-8">
          <Avatar className="h-16 w-16 border-2 border-white/10 shadow-2xl">
            <AvatarFallback className="glass text-white text-xl font-bold">
              {displayName?.slice(0, 2).toUpperCase() || userEmail?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">Settings</h1>
            <p className="text-zinc-500 font-medium text-sm">Configure your digital development consciousness.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Tabs defaultValue="general" className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs - Static */}
          <div className="w-72 shrink-0 border-r border-white/5 p-8 overflow-y-auto">
            <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-2 items-start w-full">
              <TabsTrigger value="general" className="w-full justify-start gap-4 px-5 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:glass data-[state=active]:text-amber-500 text-zinc-500 hover:text-white transition-all active-scale">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="flow" className="w-full justify-start gap-4 px-5 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:glass data-[state=active]:text-amber-500 text-zinc-500 hover:text-white transition-all active-scale">
                <Zap className="h-4 w-4" />
                Engine & Focus
              </TabsTrigger>
              <TabsTrigger value="appearance" className="w-full justify-start gap-4 px-5 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:glass data-[state=active]:text-amber-500 text-zinc-500 hover:text-white transition-all active-scale">
                <Palette className="h-4 w-4" />
                Interface
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Details Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-12 pb-32">
            <div className="max-w-3xl mx-auto lg:mx-0">
              <TabsContent value="general" className="mt-0 space-y-12 focus-visible:ring-0">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">Identity</h3>
                    <p className="text-sm text-zinc-500 font-medium">How you appear within the context engine.</p>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2">
                    <VoiceInputField
                      label="Alias"
                      value={displayName}
                      onChange={setDisplayName}
                      placeholder="Your developer handle"
                    />
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Primary Email</Label>
                      <Input
                        value={userEmail || ''}
                        disabled
                        className="glass border-white/5 text-zinc-500 h-12 rounded-xl cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <VoiceInputField
                    label="Mission Directive (Bio)"
                    value={bio}
                    onChange={setBio}
                    placeholder="Summarize your engineering philosophy..."
                  />
                </div>

                <div className="pt-12 border-t border-white/5 space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">System Connectors</h3>
                    <p className="text-sm text-zinc-500 font-medium">External data streams for semantic intelligence.</p>
                  </div>
                  <div className="glass rounded-3xl p-8 flex items-center justify-between group hover:border-amber-500/20 transition-all duration-500">
                    <div className="flex items-center gap-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform duration-500">
                        <Github className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">GitHub Forge</p>
                        <p className="text-sm text-zinc-500 font-medium">Sync issues, commits, and PR context.</p>
                      </div>
                    </div>
                    <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-11 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest active-scale transition-all">
                      Initialize
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="flow" className="mt-0 space-y-12 focus-visible:ring-0">
                <div className="space-y-10">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">Mission Timing</h3>
                    <p className="text-sm text-zinc-500 font-medium">Optimize your deep-work intervals.</p>
                  </div>

                  <div className="space-y-12 glass rounded-3xl p-8 border-white/5">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Focus Phase</Label>
                        <span className="text-xs font-bold font-mono text-amber-500 glass border-amber-500/20 px-3 py-1 rounded-lg">{focusDuration[0]}m</span>
                      </div>
                      <Slider
                        value={focusDuration}
                        onValueChange={setFocusDuration}
                        min={10} max={60} step={5}
                        className="[&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Short Recess</Label>
                          <span className="text-xs font-bold font-mono text-zinc-300">{shortBreak[0]}m</span>
                        </div>
                        <Slider value={shortBreak} onValueChange={setShortBreak} min={1} max={15} step={1} className="[&_[role=slider]]:bg-amber-500" />
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Deep Recess</Label>
                          <span className="text-xs font-bold font-mono text-zinc-300">{longBreak[0]}m</span>
                        </div>
                        <Slider value={longBreak} onValueChange={setLongBreak} min={5} max={30} step={5} className="[&_[role=slider]]:bg-amber-500" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 space-y-6">
                    <div className="glass rounded-2xl p-6 flex items-center justify-between active-scale transition-all">
                      <div className="space-y-1">
                        <Label className="text-sm font-bold text-white tracking-tight">AI Flow Predictions</Label>
                        <p className="text-xs text-zinc-500 font-medium">Suggest mission adjustments based on performance.</p>
                      </div>
                      <Switch checked={aiTimerSuggestions} onCheckedChange={setAiTimerSuggestions} className="data-[state=checked]:bg-amber-500" />
                    </div>
                    <div className="glass rounded-2xl p-6 flex items-center justify-between active-scale transition-all">
                      <div className="space-y-1">
                        <Label className="text-sm font-bold text-white tracking-tight">Automated Transitions</Label>
                        <p className="text-xs text-zinc-500 font-medium">Start break timers immediately after focus ends.</p>
                      </div>
                      <Switch checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} className="data-[state=checked]:bg-amber-500" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 space-y-12 focus-visible:ring-0">
                <div className="space-y-10">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">Visual Framework</h3>
                    <p className="text-sm text-zinc-500 font-medium">Customize the aesthetic of your workspace.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { id: 'light', icon: Sun, label: 'Standard' },
                      { id: 'dark', icon: Moon, label: 'Refined Dark' },
                      { id: 'system', icon: Monitor, label: 'Native OS' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          updateSettings({ theme: t.id as any })
                          setTheme(t.id)
                        }}
                        className={cn(
                          'relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border transition-all active-scale',
                          theme === t.id
                            ? 'glass border-amber-500/40 bg-amber-500/5 shadow-[0_0_40px_rgba(245,158,11,0.1)]'
                            : 'glass border-white/5 bg-white/[0.02] hover:bg-white/5'
                        )}
                      >
                        <t.icon className={cn('h-6 w-6 transition-colors', theme === t.id ? 'text-amber-500' : 'text-zinc-500')} />
                        <span className={cn('text-[10px] font-bold uppercase tracking-widest', theme === t.id ? 'text-white' : 'text-zinc-500')}>{t.label}</span>
                        {theme === t.id && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6 pt-10 border-t border-white/5">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Chromatic Accent</Label>
                    <div className="flex flex-wrap gap-6">
                      {accentColors.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => updateSettings({ accentColor: c.id })}
                          className={cn(
                            'h-12 w-12 rounded-2xl transition-all hover:scale-110 flex items-center justify-center relative active-scale',
                            c.color,
                            accentColor === c.id ? 'ring-2 ring-white ring-offset-8 ring-offset-background shadow-2xl' : 'opacity-40 grayscale-[0.5]'
                          )}
                        >
                          {accentColor === c.id && <Check className="h-5 w-5 text-white" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Save Bar - Fixed */}
      <div className="shrink-0 p-8 border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl flex justify-center">
        <div className="flex items-center gap-12">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:inline-block">Archival status: Synchronized</span>
          <Button 
            onClick={handleSave} 
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-widest px-10 h-12 rounded-2xl shadow-xl shadow-amber-500/20 transition-all active-scale"
          >
            {saved ? (
              <span className="flex items-center gap-3"><Check className="h-4 w-4" strokeWidth={3} /> Config Synchronized</span>
            ) : (
              'Commit Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
