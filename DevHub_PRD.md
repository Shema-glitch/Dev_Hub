# Dev Hub — Product Requirements Document
### *The Developer Consciousness Engine*
**Version:** 0.1.0 — MVP Alpha  
**Last Updated:** 2025  
**Status:** Pre-Development  

---

## 1. The Problem We Are Solving

Every developer knows the feeling: you return to a project after a few days, or even just a few hours, and you've lost *context*. Your Git history tells you *what* changed but never *why* you made that decision at 2am, what dead-end you just escaped from, or what bug you had half-solved in your head. This erosion of working memory is called **Context Decay**, and it is the silent productivity killer for every solo developer and small team.

Existing tools fail here:
- **Git** logs code, not thought. Commits are sanitized artifacts.
- **Notion / Jira** are structured and sterile — they don't capture raw developer energy.
- **IDE comments** are buried inside files and don't survive context switches.
- **No tool** bridges the emotional, in-the-moment state of a developer to their code history.

**Dev Hub** solves this by creating a **Digital Dev-Twin** — a living, breathing record of what you did, why you did it, and exactly where you left off.

---

## 2. Vision Statement

> *"Returning to a project should feel like walking back into your own living room, exactly as you left it."*

Dev Hub is not a task manager, a to-do list, or a second IDE. It is a **memory anchor** — the bridge between the rigid, dry history of Git commits and the fluid, emotional, raw logic of the developer's brain.

---

## 3. Target Users

### Primary: The Solo Developer / Indie Hacker
- Works on multiple projects simultaneously
- Context-switches frequently
- Has no team to "re-brief" them when returning to a project
- Deep in a flow state and does not want to write documentation

### Secondary: Small Dev Teams (2–5 people)
- Async handoffs are common
- Onboarding to a feature mid-sprint requires understanding the *intent* behind recent commits
- PR reviews would benefit from the "why" alongside the "what"

### Out of Scope (v1)
- Enterprise teams (too much process overhead for this product's philosophy)
- Non-technical users

---

## 4. Core Philosophy

The Hub operates on **two synchronized layers**:

| Layer | Name | Purpose |
|---|---|---|
| Layer 1 | The Weird Stuff Feed | Captures raw, human thought — the *why* and the *vibe* |
| Layer 2 | The Tactical Brief | Hard data pulled from GitHub — the *what* and the *when* |

These two layers constantly talk to each other. AI connects them.

---

## 5. Feature Set — The 5 Vital Organs

### 5.1 The Intention Gate & Session Tracker
**What it does:**  
Every work session begins with a declaration. The developer types their intent for the session (e.g., "Today we're finishing the distance formula"). This is not a task; it is a *mission*. The Hub holds this as the active frame for the entire session.

A background Pomodoro timer runs silently. If the developer goes quiet too long, the Hub nudges them using their own declared intent to re-engage.

**Key behaviors:**
- Intent is mandatory to begin a session
- Timer is non-intrusive — it suggests, never demands
- Intent is matched against eventual commits to auto-assess "resolved" status

**User story:**  
*"As a developer, I want to declare what I'm working on so that when I get distracted, I can be nudged back on track with my own words."*

---

### 5.2 The Weird Stuff Feed
**What it does:**  
A low-friction, chat-like input where the developer logs raw thoughts, frustrations, breakthroughs, and questions *as they happen*. No structure. No templates. Just stream of consciousness.

Examples of valid inputs:
- "The GATT connection is returning null on the Sony Xperia"
- "Wait, the top bar is overlapping the Radar sweep"
- "I think the issue is in the signal strength variable — negative values"
- "Disabling scaffold padding for now, will revisit"

**Key behaviors:**
- Timestamps are automatic
- The feed is searchable via semantic similarity (vector search)
- AI reads these logs and links them to corresponding Git commits in real time
- Logs are preserved forever and surfaced at next session as part of the briefing

**User story:**  
*"As a developer, I want to log my raw thoughts without friction so I can focus on coding, not documentation."*

---

### 5.3 Semantic Commit Intelligence
**What it does:**  
The Hub listens to GitHub via webhooks. On every `git push`, the AI reads the code diff and automatically:
1. Links the changes to the most recent relevant logs in the Weird Stuff Feed
2. Generates a human-readable summary: *"You fixed the null GATT return by adding a null-check to the BLE state listener in BleViewModel.kt"*
3. Marks the session's declared intent as partially or fully "Resolved"

This means developers get automatic documentation without writing a single doc.

**Key behaviors:**
- GitHub webhook integration (real-time)
- AI-generated commit summaries paired with log entries
- Intent resolution status is updated automatically
- Feature Wire Map is updated to reflect new code paths

**User story:**  
*"As a developer, I want my commits to be automatically connected to my thought process so I never have to write after-the-fact documentation."*

---

### 5.4 The End-of-Session Handshake
**What it does:**  
Before a developer logs off, the Hub runs a session audit. It compares what the developer *said* they worked on (Weird Stuff Feed) vs. what they actually *committed* (GitHub). If there's a gap — a thought logged but no commit to match — the Hub intercepts:

> *"Yo, you mentioned the Radar sweep is fixed, but it's not in the biography (Git). Commit now so we don't lose the context."*

If the developer still doesn't commit, they can log it as "Unresolved" — and it will surface as the first thing they see next session.

**Key behaviors:**
- Session audit is triggered by the "End Session" action
- Discrepancy detection between logs and commits
- "Log as Unresolved" option preserves context for the next session
- No forced blocking — developer can always exit

**User story:**  
*"As a developer, I want to be warned if I've left work untracked so that future-me doesn't have to re-discover what I already solved."*

---

### 5.5 Smart Project Freezing & Resuming
**What it does:**  
When a developer switches to a different project, the Hub "freezes" the current project's state — packaging the active intent, the hot files, and the last unresolved thought. When they return, the Hub delivers a 3-sentence briefing:

> *"Welcome back. Last time, you left the RSSI math half-baked in the ViewModel. The files RadarScreen_2.kt and NodeMeshService_2.kt were most active, and your last unresolved thought was about GATT returning null."*

**Key behaviors:**
- State is frozen automatically on project switch
- Briefing is AI-generated and concise (3 sentences max)
- Hot file heatmap is preserved and restored
- Unresolved thoughts from the Feed are surfaced first

**User story:**  
*"As a developer who juggles multiple projects, I want to resume any project instantly without spending 20 minutes re-reading my own code to remember where I was."*

---

### 5.6 The Feature Brainstormer (Bonus — v1.5)
**What it does:**  
An interactive "pitch mode" where the developer can describe a new feature in natural language. The Hub logs the idea, validates it against the current codebase (identifying which files would be touched), and adds it to a living **Feature Wire Map** — a visual node-graph showing how big ideas connect to actual code.

**Key behaviors:**
- Ideas are never lost — they're versioned in the Feed
- AI analyzes codebase structure to estimate implementation paths
- Wire Map is visual and interactive
- Ideas can be promoted to "Active Intent" for a future session

---

## 6. Technical Architecture

### 6.1 Stack

| Layer | Technology | Reason |
|---|---|---|
| Front-End | Next.js (React) + Tailwind CSS | Fast, responsive, dark-mode native |
| Back-End | FastAPI (Python) | Complex AI routing, prompt management, webhook ingestion |
| Database | Supabase (PostgreSQL + pgvector) | Semantic search, developer log storage, vector embeddings |
| AI Provider | Gemini Pro API | Code diff analysis, log-to-commit linking, session briefing |
| Auth & Sync | GitHub OAuth + Webhooks | Real-time commit tracking, file change detection |
| Local Bridge | Protocol handlers (`vscode://`, `studio://`) | One-click "open in IDE" from the Hub UI |

### 6.2 Data Model (Core Tables)

```
sessions
  id, developer_id, project_id, declared_intent, started_at, ended_at, status

logs (weird_stuff_feed)
  id, session_id, content, embedding (vector), created_at, linked_commit_hash

commits
  id, project_id, hash, diff_summary, ai_summary, linked_log_ids, pushed_at

projects
  id, developer_id, repo_url, frozen_state (JSON), last_active_at

unresolved_threads
  id, session_id, log_id, description, surfaced_at_next_session
```

### 6.3 AI Prompt Flows

**Log-to-Commit Linking:**
> *Given this code diff [diff] and these recent developer logs [logs], identify which log entries are addressed by this commit, and generate a one-sentence human-readable summary of what changed and why.*

**Session Briefing:**
> *Given this project's frozen state [state], write a 3-sentence briefing for a developer returning to this project. Be specific. Reference actual file names and the developer's own words from their logs.*

**Unresolved Detection:**
> *Compare these session logs [logs] with these commits [commits]. Identify any log entries that describe a bug, fix, or decision for which no corresponding commit exists.*

---

## 7. User Flow (Full Session)

```
1. ENTER         → Hub loads. Delivers project briefing from last session.
2. DECLARE       → Developer types intent: "Finishing the distance formula."
3. EXECUTE       → Developer codes. Logs raw thoughts in the Weird Stuff Feed.
4. SYNC          → Developer pushes to GitHub. Hub auto-links commit to logs.
5. AUDIT         → Session ends. Hub detects unresolved logs vs. commits.
6. HANDSHAKE     → Developer chooses: commit now, log as unresolved, or exit.
7. FREEZE        → Hub packages the session state for next time.
```

---

## 8. MVP Scope (v1.0)

### In Scope
- [x] Welcome / Briefing Screen (returning session state)
- [x] Session Intent Declaration
- [x] Weird Stuff Feed (real-time text logging)
- [x] GitHub Webhook ingestion (commit tracking)
- [x] AI log-to-commit linking
- [x] Stability Heatmap (most modified files)
- [x] Pomodoro focus timer
- [x] End-of-Session Handshake (unresolved detection)
- [x] Project Freeze / Resume with AI briefing
- [x] Dark mode, responsive UI

### Out of Scope for v1.0
- [ ] Feature Wire Map / node-graph visualization
- [ ] Team / multi-user support
- [ ] Mobile app
- [ ] GitLab / Bitbucket integration (GitHub-only for MVP)
- [ ] IDE plugin (protocol handlers only)
- [ ] Offline mode

---

## 9. Design Principles

1. **Zero friction logging** — the Weird Stuff Feed must never feel like a form
2. **Non-intrusive intelligence** — AI surfaces insight, it doesn't interrupt flow
3. **Developer voice** — all AI-generated summaries should sound like *the developer*, not a product manager
4. **Dark mode native** — light mode is an afterthought, dark mode is the truth
5. **Speed over features** — a fast, reliable core beats a bloated feature set

---

## 10. Success Metrics (v1.0)

| Metric | Target |
|---|---|
| Sessions that end with a Handshake (vs. abrupt close) | > 60% |
| Logs per session (avg) | > 3 |
| AI commit summaries rated "accurate" (thumbs up) | > 75% |
| Time to resume a frozen project (briefing read time) | < 30 seconds |
| User retention (week 2) | > 40% |

---

## 11. Future Roadmap

### v1.5 — The Co-Architect
- Feature Brainstormer with Feature Wire Map
- Semantic search across all past logs ("What did I do last time this happened?")
- AI-suggested commit messages based on log entries

### v2.0 — The Team Hub
- Multi-developer support
- Async handoff briefings ("Here's where I left it, and why")
- Team Weird Stuff Feed with attribution
- PR reviews that include the intent and logs behind the code

### v2.5 — The IDE Layer
- VS Code extension for in-editor log capture
- Inline heatmap overlay within the IDE
- "Explain this code" that references the developer's own historical logs

---

## 12. Open Questions

1. **Privacy:** Logs contain raw developer thoughts — potentially sensitive. How do we handle encryption, data ownership, and deletion?
2. **Gemini vs. Claude vs. GPT:** AI provider choice impacts quality and cost. Should we support switching?
3. **Webhook security:** GitHub webhook validation needs HMAC signature verification from day one.
4. **Pricing model:** Freemium (3 projects free, unlimited paid)? Or usage-based on AI calls?
5. **Onboarding:** How do we get a developer from "signed up" to "first session completed" in < 5 minutes?

---

*"The best documentation is the one you never had to sit down and write."*  
*— Dev Hub Philosophy*
