'use client'

import { useState } from 'react'
import {
  X,
  FileCode,
  Plus,
  Minus,
  GitCommit,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface FileDiff {
  filename: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  patch: string
  previousFilename?: string
}

interface CommitDetails {
  hash: string
  message: string
  author: string
  date: Date
  files: FileDiff[]
}

// Mock diff data for demonstration
const mockDiffLines = [
  { type: 'context', lineOld: 1, lineNew: 1, content: 'package com.nodelink.utils' },
  { type: 'context', lineOld: 2, lineNew: 2, content: '' },
  { type: 'context', lineOld: 3, lineNew: 3, content: 'object SignalMath {' },
  { type: 'context', lineOld: 4, lineNew: 4, content: '    ' },
  { type: 'context', lineOld: 5, lineNew: 5, content: '    fun calculateDistance(rssi: Int, txPower: Int = -59): Double {' },
  { type: 'deletion', lineOld: 6, lineNew: null, content: '        val ratio = rssi.toDouble() / txPower' },
  { type: 'deletion', lineOld: 7, lineNew: null, content: '        return Math.pow(10.0, ratio)' },
  { type: 'addition', lineOld: null, lineNew: 6, content: '        // Clamp RSSI to prevent NaN from negative square roots' },
  { type: 'addition', lineOld: null, lineNew: 7, content: '        val clampedRssi = rssi.coerceIn(-100, 0)' },
  { type: 'addition', lineOld: null, lineNew: 8, content: '        val ratio = clampedRssi.toDouble() / txPower' },
  { type: 'addition', lineOld: null, lineNew: 9, content: '        return Math.pow(10.0, ratio).coerceAtLeast(0.0)' },
  { type: 'context', lineOld: 8, lineNew: 10, content: '    }' },
  { type: 'context', lineOld: 9, lineNew: 11, content: '' },
  { type: 'context', lineOld: 10, lineNew: 12, content: '    fun estimateAccuracy(rssi: Int): String {' },
]

interface FileDiffViewerProps {
  isOpen: boolean
  onClose: () => void
  commit?: CommitDetails
  file?: FileDiff
}

export function FileDiffViewer({ isOpen, onClose, commit, file }: FileDiffViewerProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedHunks, setExpandedHunks] = useState<Set<number>>(new Set([0]))

  const handleCopyHash = () => {
    if (commit?.hash) {
      navigator.clipboard.writeText(commit.hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleHunk = (index: number) => {
    const newExpanded = new Set(expandedHunks)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedHunks(newExpanded)
  }

  // Default mock data if none provided
  const displayCommit = commit || {
    hash: 'def456f',
    message: 'fix: clamp RSSI values to prevent NaN in distance calc',
    author: 'developer',
    date: new Date(),
    files: [
      {
        filename: 'src/utils/SignalMath.kt',
        status: 'modified' as const,
        additions: 4,
        deletions: 2,
        patch: '',
      },
      {
        filename: 'src/viewmodels/BleViewModel.kt',
        status: 'modified' as const,
        additions: 8,
        deletions: 1,
        patch: '',
      },
    ],
  }

  const displayFile = file || displayCommit.files[0]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          'bg-zinc-900 border-zinc-800 p-0 flex flex-col',
          isExpanded ? 'w-full sm:max-w-full' : 'w-full sm:max-w-2xl'
        )}
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <GitCommit className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <SheetTitle className="text-zinc-100 text-left">
                  {displayFile?.filename.split('/').pop()}
                </SheetTitle>
                <SheetDescription className="text-zinc-500 text-left">
                  {displayFile?.filename}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Commit Info */}
        <div className="p-4 border-b border-zinc-800 space-y-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyHash}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-mono hover:bg-zinc-700 transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {displayCommit.hash}
            </button>
            <span className="text-xs text-zinc-500">by {displayCommit.author}</span>
            <span className="text-xs text-zinc-500">{formatDate(displayCommit.date)}</span>
          </div>
          <p className="text-sm text-zinc-200">{displayCommit.message}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-400">{displayFile?.additions} additions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-400">{displayFile?.deletions} deletions</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs capitalize',
                displayFile?.status === 'added' && 'border-green-500/15 text-green-400',
                displayFile?.status === 'modified' && 'border-amber-500/15 text-amber-400',
                displayFile?.status === 'deleted' && 'border-red-500/15 text-red-400'
              )}
            >
              {displayFile?.status}
            </Badge>
          </div>
        </div>

        {/* File List (if multiple files) */}
        {displayCommit.files.length > 1 && (
          <div className="p-4 border-b border-zinc-800 shrink-0">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Changed Files ({displayCommit.files.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {displayCommit.files.map((f, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={cn(
                    'cursor-pointer font-mono text-xs',
                    displayFile?.filename === f.filename
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  )}
                >
                  <FileCode className="h-3 w-3 mr-1" />
                  {f.filename.split('/').pop()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Diff Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Hunk Header */}
            <button
              onClick={() => toggleHunk(0)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-left mb-2 hover:bg-zinc-800 transition-colors"
            >
              {expandedHunks.has(0) ? (
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              )}
              <code className="text-xs text-blue-400">
                @@ -5,4 +5,6 @@ fun calculateDistance
              </code>
            </button>

            {/* Diff Lines */}
            {expandedHunks.has(0) && (
              <div className="rounded-lg border border-zinc-800 overflow-hidden font-mono text-sm">
                {mockDiffLines.map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex',
                      line.type === 'addition' && 'bg-green-500/10',
                      line.type === 'deletion' && 'bg-red-500/10',
                      line.type === 'context' && 'bg-zinc-900'
                    )}
                  >
                    {/* Line Numbers */}
                    <div className="flex shrink-0 select-none border-r border-zinc-800">
                      <span className="w-10 px-2 py-0.5 text-right text-xs text-zinc-500">
                        {line.lineOld || ''}
                      </span>
                      <span className="w-10 px-2 py-0.5 text-right text-xs text-zinc-500">
                        {line.lineNew || ''}
                      </span>
                    </div>
                    {/* Line Content */}
                    <div className="flex-1 px-3 py-0.5 overflow-x-auto">
                      <span
                        className={cn(
                          'whitespace-pre text-xs',
                          line.type === 'addition' && 'text-green-300',
                          line.type === 'deletion' && 'text-red-300',
                          line.type === 'context' && 'text-zinc-300'
                        )}
                      >
                        <span className="select-none mr-2">
                          {line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' '}
                        </span>
                        {line.content}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 flex justify-between shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on GitHub
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
            >
              Previous File
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
            >
              Next File
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
