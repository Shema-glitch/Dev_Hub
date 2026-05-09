'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Clock, Target, Play, Pause, RotateCcw, Power, Settings2, Sparkles, X, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useDevHub } from '@/lib/devhub-context'
import { cn } from '@/lib/utils'

export function SessionHeader() {
  const { 
    isSessionActive, 
    sessionIntent, 
    sessionStartedAt, 
    endSession,
    setShowIntentDialog,
    currentProject,
  } = useDevHub()

  const [elapsedTime, setElapsedTime] = useState('00:00:00')
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0)
  const [pomodoroActive, setPomodoroActive] = useState(false)
  const [pomodoroDuration, setPomodoroDuration] = useState(25)
  const [customDuration, setCustomDuration] = useState([25])
  const [isExpanded, setIsExpanded] = useState(false)

  // Update session timer
  useEffect(() => {
    if (!sessionStartedAt || !isSessionActive) return

    const interval = setInterval(() => {
      const diff = Date.now() - sessionStartedAt.getTime()
      const hours = Math.floor(diff / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionStartedAt, isSessionActive])

  // Pomodoro logic
  useEffect(() => {
    let interval: any
    if (pomodoroActive) {
      interval = setInterval(() => {
        if (pomodoroSeconds > 0) {
          setPomodoroSeconds(s => s - 1)
        } else if (pomodoroMinutes > 0) {
          setPomodoroMinutes(m => m - 1)
          setPomodoroSeconds(59)
        } else {
          setPomodoroActive(false)
          clearInterval(interval)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [pomodoroActive, pomodoroMinutes, pomodoroSeconds])

  const startPomodoro = () => setPomodoroActive(true)
  const stopPomodoro = () => setPomodoroActive(false)
  const resetPomodoro = () => {
    setPomodoroActive(false)
    setPomodoroMinutes(pomodoroDuration)
    setPomodoroSeconds(0)
  }

  const handleApplyCustomDuration = () => {
    const mins = customDuration[0]
    setPomodoroDuration(mins)
    setPomodoroMinutes(mins)
    setPomodoroSeconds(0)
    setPomodoroActive(false)
  }

  const formatPomodoro = (m: number, s: number) => 
    `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`

  const progressPercentage = ((pomodoroDuration * 60 - (pomodoroMinutes * 60 + pomodoroSeconds)) / (pomodoroDuration * 60)) * 100

  if (!isSessionActive) return null

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
       {/* Dynamic Island Pill */}
       <div className={cn(
         "pointer-events-auto glass backdrop-blur-3xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out-expo overflow-hidden flex flex-col items-center",
         isExpanded ? "rounded-[32px] w-[500px] p-6" : "rounded-full w-auto min-w-[200px] h-12 px-6 flex-row justify-between"
       )}>
          
          {!isExpanded ? (
            /* ── Collapsed State ── */
            <>
              <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsExpanded(true)}>
                 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Image src="/favicon_io/favicon-32x32.png" alt="Logo" width={14} height={14} className="opacity-80" />
                 </div>
                 <span className="text-[11px] font-bold text-white uppercase tracking-widest whitespace-nowrap">{elapsedTime}</span>
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-4">
                 <div className="flex flex-col items-end">
                    <span className={cn("text-[10px] font-bold font-mono transition-colors", pomodoroActive ? "text-green-400" : "text-zinc-500")}>
                      {formatPomodoro(pomodoroMinutes, pomodoroSeconds)}
                    </span>
                 </div>
                 <button onClick={() => setIsExpanded(true)} className="p-1.5 rounded-full hover:bg-white/5 transition-all active-scale">
                    <ChevronDown className="h-3 w-3 text-zinc-600" />
                 </button>
              </div>
            </>
          ) : (
            /* ── Expanded State ── */
            <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">Active Mission</p>
                      <h4 className="text-sm font-bold text-white truncate max-w-[280px]">{sessionIntent}</h4>
                    </div>
                  </div>
                  <button onClick={() => setIsExpanded(false)} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all active-scale">
                    <X className="h-5 w-5" />
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-2xl p-4 flex flex-col gap-1">
                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Neural Uptime</span>
                     <span className="text-xl font-bold text-white font-mono">{elapsedTime}</span>
                  </div>
                  <div className="glass rounded-2xl p-4 relative overflow-hidden group">
                     {/* Progress fill */}
                     {pomodoroActive && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-green-500/10 transition-all duration-1000"
                          style={{ height: `${progressPercentage}%` }}
                        />
                     )}
                     <div className="relative z-10 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Mission Timer</span>
                        <div className="flex items-center justify-between">
                           <span className={cn("text-xl font-bold font-mono transition-colors", pomodoroActive ? "text-green-400" : "text-white")}>
                             {formatPomodoro(pomodoroMinutes, pomodoroSeconds)}
                           </span>
                           <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 active-scale"
                                onClick={pomodoroActive ? stopPomodoro : startPomodoro}
                              >
                                {pomodoroActive ? <Pause className="h-3.5 w-3.5" fill="currentColor" /> : <Play className="h-3.5 w-3.5" fill="currentColor" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 active-scale"
                                onClick={resetPomodoro}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-2">
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="outline" size="sm" className="glass border-white/5 text-[10px] font-bold uppercase tracking-widest h-9 px-4 rounded-xl active-scale">
                              <Settings2 className="h-3.5 w-3.5 mr-2" /> Adjust Cycle
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 glass border-white/10 p-5 shadow-2xl z-[110]">
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Duration</span>
                                <Badge className="bg-white/10 text-white border-white/5 text-[10px]">{customDuration[0]}m</Badge>
                              </div>
                              <Slider value={customDuration} onValueChange={setCustomDuration} min={5} max={60} step={5} className="[&_[role=slider]]:bg-amber-500" />
                              <Button onClick={handleApplyCustomDuration} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase tracking-widest h-9 rounded-xl active-scale">Apply</Button>
                           </div>
                        </PopoverContent>
                     </Popover>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={endSession}
                    className="h-9 px-4 rounded-xl text-red-400 hover:bg-red-500/10 active-scale font-bold text-[10px] uppercase tracking-widest border border-red-500/10"
                  >
                    End Sequence
                  </Button>
               </div>
            </div>
          )}
       </div>
    </div>
  )
}
