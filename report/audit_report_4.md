# DevHub — Master UI/UX Audit Report v4
**Date:** 2026-05-02  
**Auditor Mode:** AUDIT (7-Pillar Framework)  
**Sources:** Full codebase inspection (12 components + context layer) · 5 live UI screenshots · `only_audit.md` manual notes  
**Total Issues:** 26

---

## ══════════════════════════════════════
## CRITICAL — Must fix before any backend integration
## ══════════════════════════════════════

---

[CRITICAL] – Global State / devhub-context.tsx  
**Location:** `lib/devhub-context.tsx` L90–108, `setCurrentProject()` L137–144  
**Issue (MY FINDING + IMAGE CONFIRMED):** Global state is a **single shared pool** — `logs`, `commits`, `hotFiles`, and `featureIdeas` are NOT scoped to `currentProject`. Switching projects in the sidebar leaves all data unchanged: same logs, same commits, same heatmap, same Brainstormer ideas persist across all projects. Images 2 and 3 confirm this: after switching from "NodeLink App" to "Portfolio Site", the Session Briefing text changes but the Stability Heatmap still shows NodeLink files (`RadarScreen.kt`, `BleViewModel.kt`) and Recent Thoughts shows NodeLink bugs. This is a **data integrity failure** — the app shows one project's data inside another project's context, which would cause catastrophic confusion in production.  
**Suggested Fix:**  
Refactor state to be keyed by `project.id`:
```ts
// In createInitialState():
projectData: {} as Record<string, {
  logs: LogEntry[]
  commits: Commit[]
  hotFiles: HotFile[]
  featureIdeas: FeatureIdea[]
  sessions: Session[]
}>

// setCurrentProject() should load/init that project's data slice:
const setCurrentProject = (project: Project) => {
  setState(prev => ({
    ...prev,
    currentProject: project,
    logs: prev.projectData[project.id]?.logs ?? [],
    commits: prev.projectData[project.id]?.commits ?? [],
    hotFiles: prev.projectData[project.id]?.hotFiles ?? [],
    featureIdeas: prev.projectData[project.id]?.featureIdeas ?? [],
  }))
}
```
Also: `unresolvedThreads` on the `Project` type must reflect actual per-project unresolved log count computed at runtime, not a hardcoded number.

---

[CRITICAL] – Navigation / devhub-shell.tsx + app-sidebar.tsx  
**Location:** `devhub-shell.tsx` L47–50 (`handleViewChange`) · `session-header.tsx` L118–122  
**Issue (MY FINDING + MANUAL NOTE #7/8):** Clicking any sidebar nav item calls `setShowWelcome(false)` unconditionally, hiding the Welcome screen forever. If `!isSessionActive`, the user lands on Dashboard with zero content and **no visible way to start a new session**. The SessionHeader only shows "No active session" text — no button. The sidebar has no "New Session" CTA. This traps the user in a dead-end screen, violating Pillar 7 (Coherent Narrative).  
**Suggested Fix:**  
1. In `devhub-shell.tsx`, route Dashboard to WelcomeScreen when no session:
```tsx
case 'dashboard':
  return !isSessionActive
    ? <WelcomeScreen onStartSession={handleStartSession} onBrainstorm={handleBrainstorm} onLogBug={handleLogBug} />
    : <DashboardView />
```
2. Add to SessionHeader when `!isSessionActive`:
```tsx
<button onClick={() => setShowIntentDialog(true)}
  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-600/10 border border-amber-500/20 text-amber-400 hover:bg-amber-600/20 transition-colors font-medium">
  <Plus className="h-3.5 w-3.5" /> New Session
</button>
```
3. Add "+ New Session" button at top of sidebar nav (always visible).

---

[CRITICAL] – Session History / app-sidebar.tsx + devhub-context.tsx  
**Location:** `lib/devhub-context.tsx` — no `sessions` array exists in state · `app-sidebar.tsx` — no session list UI  
**Issue (MANUAL NOTE #7 — Section B):** The `Session` type exists in `mock-data.ts` (L4–10) but is **never used anywhere** in the context or UI. There is zero session history. Users cannot browse past sessions, revisit their intent or logs from 2 days ago, or see what they accomplished. This is a core feature gap — the app has no memory between sessions beyond a single `frozenBriefing` string per project, which is never dynamically updated. Violates Pillar 7 (Coherent Narrative — the app must remember where you've been).  
**Suggested Fix:**  
- Add `sessions: Session[]` (per-project) to context state.  
- On `finaliseEndSession()`, push the completed session with intent, duration, log IDs, commit IDs.  
- In the sidebar (expanded mode), show a "Sessions" list below navigation:
```tsx
<div className="px-3 pt-2 pb-1">
  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Recent Sessions</p>
  {sessions.slice(0, 5).map(session => (
    <button key={session.id} onClick={() => loadSession(session.id)}
      className="w-full text-left px-2 py-1.5 rounded-md text-xs text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 truncate transition-colors">
      {session.declaredIntent}
    </button>
  ))}
</div>
```

---

## ══════════════════════════════════════
## HIGH
## ══════════════════════════════════════

---

[HIGH] – Global Layout / All main screens  
**Location:** `dashboard-view.tsx` L156 · `activity-view.tsx` L189 · `brainstormer-view.tsx` L79 · `settings-view.tsx` L120  
**Issue (MY FINDING + MANUAL NOTE #8):** Every content screen uses `max-w-*xl mx-auto` — a narrow centered column that creates vast dead space on both sides at 1440px+. The sidebar + fluid main area pattern is fully set up but squandered. The Dashboard two-column grid (`md:grid-cols-2`) is the right idea but the outer `max-w-5xl` container still artificially constrains it. The app feels like a mobile site stretched to desktop, not a native developer tool.  
**Suggested Fix:**  
Remove max-width constraints from all screens. Let content fill the available main area:
```tsx
// dashboard-view.tsx:
<div className="p-6 space-y-6">  // Remove max-w-5xl mx-auto

// For the stats grid, let it be fully fluid:
<div className="grid gap-4 grid-cols-2 xl:grid-cols-4">

// For heatmap + thoughts, two equal columns that fill width:
<div className="grid gap-6 xl:grid-cols-2">
```
Settings and Activity can use `max-w-5xl` but left-aligned (`mr-auto ml-0`), not centered.

---

[HIGH] – Project Creation / app-sidebar.tsx  
**Location:** `app-sidebar.tsx` L152–156 — "Connect Repository" `<DropdownMenuItem>` has no `onClick`  
**Issue (MY FINDING + MANUAL NOTE #16):** The "Connect Repository" menu item is a dead button — it has no handler and no modal behind it. Users cannot add a new project. The entire app is locked to 3 hardcoded mock projects. This breaks the first-time user flow entirely.  
**Suggested Fix:**  
Create a `NewProjectModal` component:
```tsx
<Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
  <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="text-zinc-100">Connect a Project</DialogTitle>
      <DialogDescription className="text-zinc-500">Link a GitHub repository to start tracking your work.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label className="text-zinc-300">Project Name</Label>
        <Input placeholder="My Awesome App" className="bg-zinc-800 border-zinc-800 focus:border-zinc-600 text-zinc-200" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-zinc-300">GitHub Repository URL</Label>
        <Input placeholder="https://github.com/user/repo" className="bg-zinc-800 border-zinc-800 focus:border-zinc-600 text-zinc-200" />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" className="border-zinc-700 text-zinc-400">Cancel</Button>
      <Button className="bg-amber-600 hover:bg-amber-500 text-white">Connect Repository</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

[HIGH] – Activity Page / activity-view.tsx  
**Location:** `activity-view.tsx` L188–301  
**Issue (MY FINDING + MANUAL NOTE #4):** The Activity page is single-column. In Image 4, the commit card occupies the left ~60% of the screen and the right ~40% is completely empty. On desktop this is a significant waste of premium screen real estate. The diff viewer (`FileDiffViewer`) opens as a modal overlay — it should open inline as a right panel to preserve context while reviewing commits.  
**Suggested Fix:**  
Convert to a two-column layout on `xl` screens:
```tsx
<div className="p-6 h-full">
  <div className="flex gap-6 h-full">
    {/* Left: commit timeline */}
    <div className="flex-1 overflow-y-auto space-y-4">
      <Tabs>...</Tabs>
    </div>
    {/* Right: diff panel or filter/stats (always visible on xl) */}
    <div className="hidden xl:flex w-[380px] shrink-0 flex-col gap-4">
      {selectedFile
        ? <InlineDiffViewer file={selectedFile} />
        : <CommitSearchPanel commits={commits} />
      }
    </div>
  </div>
</div>
```

---

[HIGH] – Settings / settings-view.tsx  
**Location:** `settings-view.tsx` — all `Input` and `VoiceInputField` components · `TabsList`  
**Issue (MY FINDING + MANUAL NOTE #12):** All input borders use `border-zinc-700` which renders as too-bright in dark mode (equivalent to `border-white/18`). Pillar 5 mandates resting borders at `border-zinc-800` / `border-white/10`. The `VoiceInputField` component exposes mic buttons that may silently do nothing on non-Chrome browsers. The "Save Changes" button at the bottom has no success state — clicking it gives zero feedback. Tab content changes are not persisted.  
**Suggested Fix:**
```tsx
// All inputs: border-zinc-700 → border-zinc-800
// Tabs trigger: data-[state=active]:bg-zinc-700 → data-[state=active]:bg-zinc-800
// Save button — add success state:
const [saved, setSaved] = useState(false)
const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
<Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-500 text-white min-w-[140px]">
  {saved ? <><Check className="h-4 w-4 mr-2" />Saved</> : 'Save Changes'}
</Button>
```

---

[HIGH] – Auth Screen / app/page.tsx  
**Location:** `app/page.tsx` L55–72 (sign-in validation) · password input area  
**Issue (MY FINDING):** Sign-in requires `password.length >= 6` to proceed but shows zero feedback when a user submits with a short password. `passwordTouched` state is set on submit but never rendered into a visible error message for sign-in mode. The user clicks "Log in" and nothing happens — no error, no shake, no message. This is a silent failure, violating Pillar 3 (Error state).  
**Suggested Fix:**
```tsx
{authMode === 'signin' && passwordTouched && password.length > 0 && password.length < 6 && (
  <p className="text-[11px] text-red-400 mt-1 animate-in fade-in duration-200">
    Password must be at least 6 characters
  </p>
)}
{authMode === 'signin' && emailTouched && email.length > 0 && !isEmailValid && (
  <p className="text-[11px] text-red-400 mt-1 animate-in fade-in duration-200">
    Please enter a valid email address
  </p>
)}
```

---

## ══════════════════════════════════════
## MEDIUM
## ══════════════════════════════════════

---

[MEDIUM] – Sidebar / app-sidebar.tsx  
**Location:** `app-sidebar.tsx` L78–84 (`!isCollapsed && <div>Dev Hub...</div>`) · L184 (`!isCollapsed && <span>`)  
**Issue (MY FINDING + MANUAL NOTE #10):** All text in the sidebar is toggled via `!isCollapsed && <element>` — React unmounts the DOM nodes instantly, before the `transition-all duration-300` width animation starts. Text disappears at frame 0, then the width animates alone — creating a jarring pop. Visible in any interaction with the collapse button.  
**Suggested Fix:**  
Replace conditional rendering with opacity/width transition on the text wrappers:
```tsx
<span className={cn(
  'overflow-hidden whitespace-nowrap transition-all duration-200',
  isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
)}>
  Dev Hub
</span>
```
Apply same pattern to all `!isCollapsed && <span>{item.label}</span>` in nav items.

---

[MEDIUM] – Sidebar / app-sidebar.tsx  
**Location:** `app-sidebar.tsx` L145–149 (unresolved badge in dropdown)  
**Issue (MY FINDING + MANUAL NOTE #6):** The sidebar's project dropdown shows an unresolved thread count badge per project, but the main sidebar nav link for "Dashboard" only shows a single badge from the currently active project (`currentProject?.unresolvedThreads`). When collapsed, no per-project unresolved count is visible. Each project in the switcher should show its own badge at all times.  
**Suggested Fix:**  
The dropdown already shows per-project badges correctly. Additionally, show the active project's count persistently in the sidebar trigger button, and show all projects' counts in the expanded list — this is already mostly done but ensure the badge uses `project.unresolvedThreads` dynamically from state (not the hardcoded mock value).

---

[MEDIUM] – Welcome Screen / welcome-screen.tsx  
**Location:** `welcome-screen.tsx` L139–172 (main input container)  
**Issue (MY FINDING + MANUAL NOTE #9):** The intent textarea container has `border border-zinc-700/50 bg-zinc-900/50` but the `<Textarea>` inside declares `focus-visible:ring-0`, removing all focus indication. The outer container gets no `focus-within` styles either. A developer typing cannot tell the field is focused, violating Pillar 3 (Focus state) and WCAG 2.1.  
**Suggested Fix:**
```tsx
<div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-1 shadow-xl
                focus-within:border-amber-500/40 focus-within:ring-2 focus-within:ring-amber-500/10
                transition-all duration-150">
```

---

[MEDIUM] – Voice Input / welcome-screen.tsx + weird-stuff-feed.tsx  
**Location:** `welcome-screen.tsx` L149–160 · `weird-stuff-feed.tsx` L341–353  
**Issue (MY FINDING + MANUAL NOTE #13):** Voice buttons are functionally dead on Firefox, Safari, and non-Chromium browsers — they silently do nothing. The feed's voice button has no way to manually stop recording (no Stop icon, no visual state change of the icon itself). The idle state is `text-zinc-400` but there's no tooltip explaining browser limitation.  
**Suggested Fix:**
```tsx
const isSpeechSupported = typeof window !== 'undefined' &&
  ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

<Tooltip>
  <TooltipTrigger asChild>
    <Button
      disabled={!isSpeechSupported}
      onClick={handleVoiceInput}
      className={cn('...', !isSpeechSupported && 'opacity-40 cursor-not-allowed')}
    >
      {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    {isSpeechSupported
      ? (isListening ? 'Click to stop recording' : 'Voice input')
      : 'Voice input — Chrome only'}
  </TooltipContent>
</Tooltip>
```

---

[MEDIUM] – Brainstormer / brainstormer-view.tsx  
**Location:** `brainstormer-view.tsx` L91 (Analyze button) · L79 (page container)  
**Issue (MY FINDING + IMAGE 5 + MANUAL NOTE #5 & #11):** Two issues:  
1. "Analyze with AI" button uses `bg-gradient-to-r from-purple-600 to-pink-600` — the only purple/pink element in the entire app. Every other primary action uses amber/orange. This makes Brainstormer feel like a completely different product, violating Pillar 5 (Color & Theme Integrity).  
2. As seen in Image 5, the Brainstormer page is mostly empty — it's a "lonely page" with just an input field and empty state. The page lacks density and purpose at first load. No AI-suggested ideas, no promoted idea history, no wire map preview.  
**Suggested Fix (1):**
```tsx
className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold"
```
**Suggested Fix (2):** Add an "AI may suggest" section below the input with 2–3 auto-generated idea prompts based on recent logs. Add a "Promoted Ideas" history panel when ideas exist.

---

[MEDIUM] – Dashboard / dashboard-view.tsx  
**Location:** `dashboard-view.tsx` L279–292 ("Recent Thoughts" `LogItem`)  
**Issue (MY FINDING + MANUAL NOTE #14):** `LogItem` is a `<div>` — not interactive. Clicking a thought does nothing. From Image 2, users can see their recent thoughts and naturally expect clicking them to navigate to the full log in the Weird Stuff Feed and highlight the specific entry. This cross-screen interaction is entirely absent.  
**Suggested Fix:**  
Convert `LogItem` to a navigable button. Pass a navigation handler from `DashboardView` down through props:
```tsx
// DashboardView needs an onNavigateToFeed prop or access to setActiveView
<button
  onClick={() => onNavigateToLog?.(log.id)}
  className="group p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30
             hover:border-amber-500/30 hover:bg-zinc-800/50 transition-colors text-left w-full"
>
```
The Weird Stuff Feed needs to accept and scroll-to + highlight a `focusedLogId`.

---

[MEDIUM] – Dashboard / dashboard-view.tsx  
**Location:** `dashboard-view.tsx` L248–265 (Stability Heatmap file rows)  
**Issue (MY FINDING + MANUAL NOTE #15):** In the Dashboard's Stability Heatmap card, file rows are `<div>` elements with no `onClick`. There is no navigation to the Activity → File Changes view. From the images, these rows look interactive (colored heat bars, file icons) but do nothing when clicked. The Activity view already has a working `handleFileClick` → `FileDiffViewer` chain — it just needs to be connected.  
**Suggested Fix:**  
Convert to buttons with a navigation callback:
```tsx
<button
  onClick={() => onNavigateToFile?.(file.path)}
  className="flex items-center gap-3 w-full p-2.5 rounded-lg border cursor-pointer
             hover:opacity-80 active:scale-[0.99] transition-all ..."
>
```

---

[MEDIUM] – Weird Stuff Feed / weird-stuff-feed.tsx  
**Location:** `weird-stuff-feed.tsx` L175–192 (search bar) · L329–361 (input area)  
**Issue (MY FINDING + IMAGE 1 + MANUAL NOTE #1):** Two layout issues visible in Image 1:  
1. The search bar spans the full width of the header, making it disproportionately large. On a 1024px+ screen this creates an awkward single giant input field.  
2. The bottom compose area (`flex gap-2 items-end`) has the textarea taking `flex-1` but the voice and send buttons are stacked vertically beside it, creating an unusually tall button column vs. the textarea width.  
**Suggested Fix (1):** Constrain search to `max-w-[360px]` or make it expandable on focus.  
**Suggested Fix (2):** Place voice and send buttons in a horizontal row beneath the textarea:
```tsx
<div className="space-y-2">
  <Textarea ... className="min-h-[72px] max-h-[140px] ..." />
  <div className="flex items-center justify-between">
    <div className="flex gap-1">{/* type selector pills */}</div>
    <div className="flex gap-1.5">
      <Button size="icon" className="h-8 w-8 ..."><Mic /></Button>
      <Button size="icon" className="h-8 w-8 ..."><Send /></Button>
    </div>
  </div>
</div>
```

---

[MEDIUM] – Session Header / session-header.tsx  
**Location:** `session-header.tsx` L87–89 (progress calculation)  
**Issue (MY FINDING):** The Pomodoro progress fill (`progressPercentage`) uses `customDuration[0]` (local component state, defaults to 25) but the context's `pomodoroMinutes` reflects `pomodoroDuration` (also 25 by default, but user-adjustable in Settings). These two values can drift apart — if the user changes duration in Settings, the progress bar percentage is calculated against the wrong total. Pillar 3 (State Completeness — data accuracy).  
**Suggested Fix:**
```tsx
// Replace customDuration[0] with the context value:
const progressPercentage =
  ((pomodoroDuration * 60 - (pomodoroMinutes * 60 + pomodoroSeconds)) /
  (pomodoroDuration * 60)) * 100
```
Remove local `customDuration` state and sync with `setPomodoroDuration` from context.

---

## ══════════════════════════════════════
## LOW
## ══════════════════════════════════════

---

[LOW] – Global / Multiple components  
**Location:** `activity-view.tsx` L163–167 (heatBadge) · `weird-stuff-feed.tsx` L36–41 (logTypeConfig) · `dashboard-view.tsx` L30–36 (typeColors) · `end-session-dialog.tsx` L186–188 (session badge)  
**Issue (MY FINDING + MANUAL NOTE #12):** Badge and card border opacities use `/30` across the codebase (`border-red-500/30`, `border-amber-500/30`, `border-green-500/30`). Per Pillar 5, resting borders in dark mode should not exceed `/15`–`/20`. At `/30` they read as harsh, bright lines that compete with content rather than framing it subtly.  
**Suggested Fix:** Global search-replace all `border-*-500/30` → `border-*-500/15` in component files. Exception: active/selected state borders may use `/40`.

---

[LOW] – Dashboard / dashboard-view.tsx  
**Location:** `dashboard-view.tsx` L307–313 ("Simulate Push" button)  
**Issue (MY FINDING):** "Simulate Push" has no loading/disabled state. Clicking it calls `simulateWebhook()` instantly and multiple rapid clicks generate multiple fake commits. No visual feedback confirms the action succeeded.  
**Suggested Fix:**
```tsx
const [isSimulating, setIsSimulating] = useState(false)
const handleSimulate = async () => {
  if (isSimulating) return
  setIsSimulating(true)
  simulateWebhook()
  await new Promise(r => setTimeout(r, 1200))
  setIsSimulating(false)
}
```

---

[LOW] – Activity View / activity-view.tsx  
**Location:** `activity-view.tsx` L140–147 ("View on GitHub" button)  
**Issue (MY FINDING):** Every commit card renders a "View on GitHub" button, but it has no `href` and would link to `#` in production. Commit hashes exist but are not assembled into a full GitHub URL. The button should either be disabled with a tooltip, or dynamically constructed from `project.repoUrl + '/commit/' + commit.hash`.  
**Suggested Fix:**
```tsx
<Button
  variant="outline" size="sm"
  asChild
  className="border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
>
  <a
    href={currentProject?.repoUrl ? `${currentProject.repoUrl}/commit/${commit.hash}` : '#'}
    target="_blank" rel="noopener noreferrer"
  >
    <ExternalLink className="h-4 w-4 mr-2" />View on GitHub
  </a>
</Button>
```

---

[LOW] – Auth Screen / app/page.tsx  
**Location:** `app/page.tsx` L112–119 (Google SSO button)  
**Issue (MY FINDING):** The Google SSO button is `bg-white text-black` — the only white element on the entirely dark auth screen. While Google brand guidelines technically require a white background option, this creates jarring contrast. The button has no hover state elevation or transition beyond `hover:bg-zinc-50`.  
**Suggested Fix:** Use Google's dark-mode approved variant: `bg-[#131314] border border-[#8E918F] text-[#E3E3E3]` with white circle behind the G logo. Add `transition-colors duration-150 hover:bg-[#1e1e1f]`.

---

[LOW] – End Session Dialog / end-session-dialog.tsx  
**Location:** `end-session-dialog.tsx` L207–229 (unresolved scroll area)  
**Issue (MY FINDING):** The unresolved thoughts scroll area (`max-h-[160px] overflow-y-auto`) has no scroll indicator — no visible scrollbar styling, no bottom fade mask. Users may not realize there are more entries below, missing important unresolved items.  
**Suggested Fix:**
```tsx
<div className="relative">
  <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2">
    {unresolvedLogs.slice(0, 4).map(...)}
  </div>
  {unresolvedLogs.length > 3 && (
    <div className="absolute bottom-0 left-0 right-0 h-8
                    bg-gradient-to-t from-zinc-900/80 to-transparent
                    pointer-events-none rounded-b-lg" />
  )}
</div>
```

---

[LOW] – Intent Dialog / intent-dialog.tsx  
**Location:** `intent-dialog.tsx` L84 (Textarea) · L97–103 (suggestion badges)  
**Issue (MY FINDING):** Dialog textarea border uses `border-zinc-700` — same over-bright border issue as Settings. Suggestion badges (`border-zinc-700`) compete visually with the textarea border. The dialog has no loading state for the "Start Session" button — it fires `startSession()` synchronously with no transition delay or feedback.  
**Suggested Fix:**
```tsx
// Textarea: border-zinc-700 → border-zinc-800
// Suggestion badges: border-zinc-700 → border-zinc-800, text-zinc-400 → text-zinc-500
// Start Session button: add brief loading flash
<Button onClick={async () => { setIsStarting(true); await new Promise(r=>setTimeout(r,400)); handleStartSession() }}>
  {isStarting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Rocket className="h-4 w-4 mr-2" />}
  Start Session
</Button>
```

---

[LOW] – Auth Screen / app/page.tsx  
**Location:** `app/page.tsx` L128–135 (Divider)  
**Issue (MY FINDING):** The "Or continue with email" divider has a JSX structural indentation error — the `</div>` at line 131 closes at the wrong nesting level relative to line 130's `<div className="absolute inset-0 flex items-center">`. While React renders this correctly, it is a maintainability defect and would fail linting in stricter configs.  
**Suggested Fix:** Correct the indentation so inner div closes before the relative container div.

---

## ══════════════════════════════════════
## SEVERITY SUMMARY
## ══════════════════════════════════════

| Severity | Count | Screens Affected |
|----------|-------|-----------------|
| CRITICAL | 3     | Global Context, Navigation Shell, Session History |
| HIGH     | 6     | Global Layout, Project Creation, Activity, Settings, Auth, Auth |
| MEDIUM   | 10    | Sidebar×2, Welcome, Voice, Brainstormer, Dashboard×2, Feed, Session Header, Timer |
| LOW      | 7     | Global Borders, Dashboard, Activity, Auth, End Session, Intent Dialog, Auth |
| **TOTAL**| **26**| |

---

Has the Fixer addressed all items? (YES/NO)
