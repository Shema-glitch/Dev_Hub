Read the file 'agents_md/agents_prompt.md'. Mode: AUDIT.

Before you begin, absorb these additional requirements from manual UI audits. 
These are NOT a replacement for your own audit — combine them with your 
7-Pillar findings into one comprehensive master report.

================================================================
SECTION A – IMAGE-BASED FINDINGS
================================================================

1. WEIRD STUFF FEED (Image 1):
   - Search bar is too wide; should be compact (max-w-[320px]) or collapsible.
   - Bottom input is too long, doesn't respect voice and send buttons.
     Fix: flex row, fixed button widths, balanced gap.

2. CROSS-PROJECT STATE LEAK (Images 2 & 3) – CRITICAL:
   - Same session intent and commit data appears across different projects.
   - All state must be scoped by project_id. Switching projects freezes
     current state and loads the new project’s independent session, commits, logs, briefing.
   - Stats (total logs, commits, hot files, unresolved) must be per-project.
   - Each project needs its own Welcome screen with its own intent.

3. MISSING ONBOARDING FLOW (Images 2 & 3):
   - No “Connect Repository” first-time setup. After connecting, fetch recent commits.
   - Add commit search (by message, hash, or code snippet).

4. ACTIVITY PAGE WASTED SPACE (Image 4):
   - Right side empty. Convert to two-column: left = commit timeline,
     right = search/filter/stats or diff viewer.

5. BRAINSTORMER LONELY PAGE (Image 5):
   - Too sparse for dedicated page. Either merge into Dashboard as panel/tab,
     or enrich with wire map, promoted idea history, AI-suggested ideas.

6. SIDEBAR UNRESOLVED BADGE (Images 2 & 3):
   - Show unresolved count per project (badge next to each project name).

================================================================
SECTION B – SESSION HISTORY & NAVIGATION (NEW)
================================================================

7. SESSION HISTORY – CRITICAL:
   - There is NO way to view past sessions for a project.
   - One project has many sessions; user must be able to browse them,
     revisit intent, logs, commits, and outcomes.
   - Sidebar should transform into a session list (like chat app histories)
     when a project is selected.
   - “+ New Session” button at top of sidebar to start a fresh session.
   - Clicking a past session loads its full context (briefing, logs, commits).

================================================================
SECTION C – EXISTING MANUAL NOTES (from previous audit)
================================================================

8. GLOBAL LAYOUT – "BOXED" FEELING:
   - Screens use centered max-w-* containers; feels like stretched mobile.
     Adopt sidebar + fluid main area with responsive grid.

9. WELCOME SCREEN – INPUT AESTHETICS:
   - Group intent input, voice button, Start Session into unified container.
   - Voice button must not be red when idle.

10. GLOBAL TRANSITIONS & ANIMATIONS:
    - Sidebar collapse: text disappears before width transition. Fix to synchronize.
    - Screen transitions: add fade+scale for smoothness.

11. BRAINSTORMER – INCONSISTENT THEME:
    - Standardize button styles and card styling with dashboard.

12. SETTINGS – HARSH WHITE BORDERS:
    - All resting borders must be border-white/10 or border-zinc-800.

13. VOICE-TO-TEXT:
    - Disable button, add tooltip "Voice input coming soon."

14. RECENT THOUGHTS – INTERACTIVITY:
    - Clicking a thought navigates to it in feed and highlights it.

15. STABILITY HEATMAP – INTERACTIVITY:
    - Clicking a file shows its details/changes.

16. PROJECT CREATION:
    - Add "+" button to create/import new projects.

================================================================

Now proceed with your full audit. For every finding — whether from these notes
or your own discovery — use the standard format:
[SEVERITY] – [Screen/Component]
Location: ...
Issue: ...
Suggested Fix: ...

When complete, output the master report with severity counts and ask:
"Has the Fixer addressed all items? (YES/NO)"