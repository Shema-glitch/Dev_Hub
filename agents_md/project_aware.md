You are a DevHub project-aware agent. Your task is to read and understand the entire codebase, then implement a specific feature without breaking existing functionality.

### STEP 1: Understand the Project

Read every file in the following directories (and any subdirectories):
- /components/
- /app/
- /hooks/
- /utils/
- /styles/
- Any other directory containing front-end code.

Also read these documentation files if they exist:
- universal_agent_prompt.md
- manual_audit_notes.md
- any audit_report_*.md
- the original PRD or technical architecture docs (if available)

Build a mental model of:
- The overall feature set (intent declaration, Weird Stuff Feed, session history, activity/commits, brainstormer, project switching)
- The navigation flow (Auth → Welcome → Dashboard / Active Session → End Session)
- State management (Zustand store, React Query, or whatever is used)
- How sessions are created, stored, and ended

### STEP 2: Identify the Gap

Currently, if a user starts a session (declares intent, maybe writes some logs) but does **not** click "End Session" — perhaps they close the browser, navigate away, or the app crashes — there is **no way to resume that unfinished session**. The Welcome screen always expects a new intent.

Your goal: Add a **"Continue where you left off"** button on the Welcome screen that appears **only if there is an unfinished session** (status = 'active' and not ended). Clicking it should:
- Resume that existing session exactly where the user left off
- Restore the timer (if one was running, continue from the remaining time, or just reset the Pomodoro if simpler)
- Load the previous logs, heatmap, and linked commits for that session
- Transition to the active Dashboard view with that session loaded

### STEP 3: Implementation Requirements

1. **Identify the data shape**: A session has a `status` field (active/ended). An unfinished session has status 'active' and no `ended_at` timestamp. Adjust / add to the Zustand store or React Query state to track the "current session" and whether there's an unfinished one.

2. **Fetch the unfinished session**: On app load (or when reaching the Welcome screen), check if there is a session with status 'active' for the current project. You can mock this with mock data if the backend isn't ready; ensure the logic is correct.

3. **Welcome screen UI**: Add a prominent button or card (same visual style as the existing "Quick Start" cards) with the text **"Continue where you left off"**. It should display the intent of the unfinished session as a subtitle (e.g., "Continuing: Fixing the auth bug in login flow").

4. **Button behavior**: On click, it should:
   - Set the active session in state to that unfinished session
   - Navigate to the Dashboard view (active session mode)
   - Optionally, restart the Pomodoro timer if desired (or resume from last known remaining)

5. **Edge cases**:
   - If no unfinished session exists, the button should not show at all.
   - If the user clicks "Start Session" with a new intent while an unfinished session exists, you may either silently end the old one or prompt them. For simplicity, automatically end the old session (set status 'ended' and `ended_at = now()`) before creating the new one.
   - Ensure project switching properly handles unfinished sessions across different projects (each project may have its own active session).

6. **Visual consistency**: Use the existing design system (Tailwind classes, color tokens). The button should match the "Quick Start" cards or the primary action button. Ensure dark-mode compatibility.

### STEP 4: Verification

After implementing, test the following flows:
- Log in, create a session, close browser, reopen → Welcome screen shows "Continue where you left off" → click it → resume session.
- Have an unfinished session, start a completely new session → old session is ended, new session begins.
- Switch projects → each project shows its own unfinished session (or none).
- No regression: existing session creation and ending still work.

Output a summary of changes made (files and lines) and a checklist verifying each edge case.