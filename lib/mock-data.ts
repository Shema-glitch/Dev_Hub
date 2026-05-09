// Mock data for DevHub demonstration
// In production, this would come from Supabase + GitHub API

// ─── Core Types ───────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string
  sessionId: string
  content: string
  createdAt: Date
  linkedCommitHash?: string
  type: 'thought' | 'bug' | 'breakthrough' | 'question' | 'decision'
}

export interface Commit {
  id: string
  hash: string
  message: string
  aiSummary: string
  linkedLogIds: string[]
  pushedAt: Date
  filesChanged: string[]
  additions: number
  deletions: number
}

export interface Project {
  id: string
  name: string
  repoUrl: string
  lastActiveAt: Date
  frozenBriefing?: string
  unresolvedThreads: number
}

export interface HotFile {
  path: string
  changeCount: number
  lastModified: Date
  heatLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface SessionRecord {
  id: string
  projectId: string
  intent: string
  startedAt: Date
  endedAt: Date
  durationMinutes: number
  outcome: 'completed' | 'abandoned'
  /** 'active' = unfinished/crashed session; 'ended' = properly closed */
  status?: 'active' | 'ended'
  logCount: number
  commitCount: number
  unresolvedCount: number
  logs: LogEntry[]
  commits: Commit[]
}

export interface ProjectDataSlice {
  logs: LogEntry[]
  commits: Commit[]
  hotFiles: HotFile[]
  sessions: SessionRecord[]
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'NodeLink App',
    repoUrl: 'https://github.com/user/nodelink',
    lastActiveAt: new Date(),
    unresolvedThreads: 2,
  },
  {
    id: '2',
    name: 'Portfolio Site',
    repoUrl: 'https://github.com/user/portfolio',
    lastActiveAt: new Date(Date.now() - 86400000 * 3),
    frozenBriefing: 'Last session you were updating the contact form validation. The FormValidator.tsx and api/contact.ts files were most active.',
    unresolvedThreads: 0,
  },
  {
    id: '3',
    name: 'E-Commerce API',
    repoUrl: 'https://github.com/user/ecommerce-api',
    lastActiveAt: new Date(Date.now() - 86400000 * 7),
    frozenBriefing: 'You left the payment integration half-complete. The Stripe webhook handler needs error handling added.',
    unresolvedThreads: 1,
  },
]

// ─── NodeLink App Data (Project 1) ────────────────────────────────────────────

const nodeLinkLogs: LogEntry[] = [
  {
    id: 'nl-log-1',
    sessionId: 'nl-session-active',
    content: 'The GATT connection is returning null on the Sony Xperia. Need to check if the callback is firing.',
    createdAt: new Date(Date.now() - 3600000 * 2),
    type: 'bug',
  },
  {
    id: 'nl-log-2',
    sessionId: 'nl-session-active',
    content: 'Wait - the top bar is overlapping the Radar sweep animation. Scaffold padding issue again.',
    createdAt: new Date(Date.now() - 3600000),
    type: 'bug',
    linkedCommitHash: 'abc123',
  },
  {
    id: 'nl-log-3',
    sessionId: 'nl-session-active',
    content: 'I think the issue is in the signal strength variable — it is returning negative values which breaks the distance formula.',
    createdAt: new Date(Date.now() - 1800000),
    type: 'thought',
  },
  {
    id: 'nl-log-4',
    sessionId: 'nl-session-active',
    content: 'BREAKTHROUGH: The RSSI needs to be clamped before calculation. Values below -100 were causing NaN.',
    createdAt: new Date(Date.now() - 900000),
    type: 'breakthrough',
    linkedCommitHash: 'def456',
  },
  {
    id: 'nl-log-5',
    sessionId: 'nl-session-active',
    content: 'Should I refactor the entire BLE service to use coroutines? Current callback hell is getting out of hand.',
    createdAt: new Date(Date.now() - 300000),
    type: 'question',
  },
]

const nodeLinkCommits: Commit[] = [
  {
    id: 'nl-commit-1',
    hash: 'def456',
    message: 'fix: clamp RSSI values to prevent NaN in distance calc',
    aiSummary: 'You fixed the distance calculation NaN issue by clamping RSSI values below -100 in SignalMath.kt.',
    linkedLogIds: ['nl-log-4'],
    pushedAt: new Date(Date.now() - 600000),
    filesChanged: ['src/utils/SignalMath.kt', 'src/viewmodels/BleViewModel.kt'],
    additions: 12,
    deletions: 3,
  },
  {
    id: 'nl-commit-2',
    hash: 'abc123',
    message: 'fix: disable scaffold top padding for radar screen',
    aiSummary: 'You resolved the Radar sweep overlap by disabling the default Scaffold top padding in RadarScreen.kt.',
    linkedLogIds: ['nl-log-2'],
    pushedAt: new Date(Date.now() - 3000000),
    filesChanged: ['src/screens/RadarScreen.kt'],
    additions: 4,
    deletions: 1,
  },
  {
    id: 'nl-commit-3',
    hash: '789ghi',
    message: 'feat: add device discovery timeout',
    aiSummary: 'Added a 30-second timeout to device discovery to prevent the scan from running indefinitely and draining battery.',
    linkedLogIds: [],
    pushedAt: new Date(Date.now() - 86400000),
    filesChanged: ['src/services/NodeMeshService.kt', 'src/viewmodels/BleViewModel.kt'],
    additions: 28,
    deletions: 5,
  },
]

const nodeLinkHotFiles: HotFile[] = [
  { path: 'src/screens/RadarScreen.kt', changeCount: 12, lastModified: new Date(), heatLevel: 'critical' },
  { path: 'src/viewmodels/BleViewModel.kt', changeCount: 8, lastModified: new Date(), heatLevel: 'high' },
  { path: 'src/services/NodeMeshService.kt', changeCount: 5, lastModified: new Date(Date.now() - 3600000), heatLevel: 'medium' },
  { path: 'src/utils/SignalMath.kt', changeCount: 4, lastModified: new Date(Date.now() - 7200000), heatLevel: 'medium' },
  { path: 'src/models/Device.kt', changeCount: 2, lastModified: new Date(Date.now() - 14400000), heatLevel: 'low' },
  { path: 'src/ui/components/DeviceCard.kt', changeCount: 1, lastModified: new Date(Date.now() - 28800000), heatLevel: 'low' },
]

const nodeLinkSessions: SessionRecord[] = [
  {
    id: 'nl-s-unfinished',
    projectId: '1',
    intent: 'Refactor BLE service to use Kotlin coroutines and Flow',
    startedAt: new Date(Date.now() - 3600000 * 1.5),
    endedAt: new Date(0), // sentinel — session never ended
    durationMinutes: 0,
    outcome: 'abandoned',
    status: 'active',
    logCount: 2,
    commitCount: 0,
    unresolvedCount: 2,
    logs: [
      { id: 'nl-uf-log-1', sessionId: 'nl-s-unfinished', content: 'Starting coroutine migration. Will move BleService callbacks to Flow first.', createdAt: new Date(Date.now() - 3600000 * 1.5), type: 'thought' },
      { id: 'nl-uf-log-2', sessionId: 'nl-s-unfinished', content: 'StateFlow vs SharedFlow — need to decide before rewriting the scan logic.', createdAt: new Date(Date.now() - 3600000), type: 'question' },
    ],
    commits: [],
  },
  {
    id: 'nl-s-1',
    projectId: '1',
    intent: 'Fix RSSI clamping to prevent NaN in distance calculation',
    startedAt: new Date(Date.now() - 86400000 * 2 - 7200000),
    endedAt: new Date(Date.now() - 86400000 * 2),
    durationMinutes: 120,
    outcome: 'completed',
    logCount: 4,
    commitCount: 2,
    unresolvedCount: 0,
    logs: [
      { id: 'nl-s1-log-1', sessionId: 'nl-s-1', content: 'RSSI values going below -100 causing NaN in sqrt operations.', createdAt: new Date(Date.now() - 86400000 * 2 - 6000000), type: 'bug' },
      { id: 'nl-s1-log-2', sessionId: 'nl-s-1', content: 'Need to clamp to [-100, 0] range before passing to distance formula.', createdAt: new Date(Date.now() - 86400000 * 2 - 4000000), type: 'thought' },
      { id: 'nl-s1-log-3', sessionId: 'nl-s-1', content: 'BREAKTHROUGH: Math.max(-100, rssi) solved it. All devices now connecting.', createdAt: new Date(Date.now() - 86400000 * 2 - 2000000), type: 'breakthrough', linkedCommitHash: 'def456' },
      { id: 'nl-s1-log-4', sessionId: 'nl-s-1', content: 'Decision: will add unit tests for edge cases next session.', createdAt: new Date(Date.now() - 86400000 * 2 - 1000000), type: 'decision' },
    ],
    commits: [
      { id: 'nl-s1-c1', hash: 'def456', message: 'fix: clamp RSSI values', aiSummary: 'Clamped RSSI to -100 minimum.', linkedLogIds: ['nl-s1-log-3'], pushedAt: new Date(Date.now() - 86400000 * 2 - 1500000), filesChanged: ['src/utils/SignalMath.kt'], additions: 12, deletions: 3 },
    ],
  },
  {
    id: 'nl-s-2',
    projectId: '1',
    intent: 'Investigate BLE service refactor to coroutines',
    startedAt: new Date(Date.now() - 86400000 * 5 - 3600000),
    endedAt: new Date(Date.now() - 86400000 * 5),
    durationMinutes: 60,
    outcome: 'abandoned',
    logCount: 3,
    commitCount: 0,
    unresolvedCount: 2,
    logs: [
      { id: 'nl-s2-log-1', sessionId: 'nl-s-2', content: 'Callback hell in BleService is becoming unmanageable. Coroutines would clean this up.', createdAt: new Date(Date.now() - 86400000 * 5 - 3000000), type: 'thought' },
      { id: 'nl-s2-log-2', sessionId: 'nl-s-2', content: 'Question: Should I use Flow or StateFlow for the device list updates?', createdAt: new Date(Date.now() - 86400000 * 5 - 2000000), type: 'question' },
      { id: 'nl-s2-log-3', sessionId: 'nl-s-2', content: 'The scope management is tricky — need to cancel coroutines when Bluetooth disconnects.', createdAt: new Date(Date.now() - 86400000 * 5 - 1000000), type: 'bug' },
    ],
    commits: [],
  },
  {
    id: 'nl-s-3',
    projectId: '1',
    intent: 'Add device discovery timeout feature',
    startedAt: new Date(Date.now() - 86400000 * 10 - 5400000),
    endedAt: new Date(Date.now() - 86400000 * 10),
    durationMinutes: 90,
    outcome: 'completed',
    logCount: 2,
    commitCount: 1,
    unresolvedCount: 0,
    logs: [
      { id: 'nl-s3-log-1', sessionId: 'nl-s-3', content: 'Users reporting battery drain when scanning runs forever. Need a hard timeout.', createdAt: new Date(Date.now() - 86400000 * 10 - 4500000), type: 'bug' },
      { id: 'nl-s3-log-2', sessionId: 'nl-s-3', content: '30 seconds feels right based on UX research. Configurable in settings later.', createdAt: new Date(Date.now() - 86400000 * 10 - 2000000), type: 'decision' },
    ],
    commits: [
      { id: 'nl-s3-c1', hash: '789ghi', message: 'feat: add device discovery timeout', aiSummary: 'Added 30s timeout.', linkedLogIds: ['nl-s3-log-2'], pushedAt: new Date(Date.now() - 86400000 * 10 - 1000000), filesChanged: ['src/services/NodeMeshService.kt'], additions: 28, deletions: 5 },
    ],
  },
]

// ─── Portfolio Site Data (Project 2) ──────────────────────────────────────────

const portfolioLogs: LogEntry[] = [
  {
    id: 'pf-log-1',
    sessionId: 'pf-session-active',
    content: 'Contact form validation not firing on mobile Safari. Works fine on Chrome.',
    createdAt: new Date(Date.now() - 86400000 * 3 - 3600000),
    type: 'bug',
  },
  {
    id: 'pf-log-2',
    sessionId: 'pf-session-active',
    content: 'The email regex is too strict — rejecting valid addresses with + sign.',
    createdAt: new Date(Date.now() - 86400000 * 3 - 1800000),
    type: 'breakthrough',
    linkedCommitHash: 'pf-c1',
  },
  {
    id: 'pf-log-3',
    sessionId: 'pf-session-active',
    content: 'Should I add reCAPTCHA to the contact form? Getting some spam submissions.',
    createdAt: new Date(Date.now() - 86400000 * 3 - 900000),
    type: 'question',
  },
]

const portfolioCommits: Commit[] = [
  {
    id: 'pf-commit-1',
    hash: 'pf-c1',
    message: 'fix: update email regex to allow + characters',
    aiSummary: 'Fixed email validation that was incorrectly rejecting addresses with + sign (e.g. user+tag@gmail.com).',
    linkedLogIds: ['pf-log-2'],
    pushedAt: new Date(Date.now() - 86400000 * 3 - 1200000),
    filesChanged: ['src/components/FormValidator.tsx', 'src/api/contact.ts'],
    additions: 8,
    deletions: 3,
  },
  {
    id: 'pf-commit-2',
    hash: 'pf-c2',
    message: 'style: fix mobile layout overflow on hero section',
    aiSummary: 'Resolved horizontal scroll on mobile caused by hero section overflow.',
    linkedLogIds: [],
    pushedAt: new Date(Date.now() - 86400000 * 6),
    filesChanged: ['src/styles/hero.css', 'src/components/HeroSection.tsx'],
    additions: 14,
    deletions: 6,
  },
]

const portfolioHotFiles: HotFile[] = [
  { path: 'src/components/FormValidator.tsx', changeCount: 7, lastModified: new Date(Date.now() - 86400000 * 3), heatLevel: 'high' },
  { path: 'src/api/contact.ts', changeCount: 5, lastModified: new Date(Date.now() - 86400000 * 3), heatLevel: 'medium' },
  { path: 'src/styles/hero.css', changeCount: 4, lastModified: new Date(Date.now() - 86400000 * 6), heatLevel: 'medium' },
  { path: 'src/components/HeroSection.tsx', changeCount: 3, lastModified: new Date(Date.now() - 86400000 * 6), heatLevel: 'low' },
  { path: 'src/pages/index.tsx', changeCount: 2, lastModified: new Date(Date.now() - 86400000 * 10), heatLevel: 'low' },
]

const portfolioSessions: SessionRecord[] = [
  {
    id: 'pf-s-1',
    projectId: '2',
    intent: 'Fix contact form email validation and mobile layout bugs',
    startedAt: new Date(Date.now() - 86400000 * 3 - 5400000),
    endedAt: new Date(Date.now() - 86400000 * 3),
    durationMinutes: 90,
    outcome: 'completed',
    logCount: 3,
    commitCount: 1,
    unresolvedCount: 0,
    logs: portfolioLogs,
    commits: [portfolioCommits[0]],
  },
  {
    id: 'pf-s-2',
    projectId: '2',
    intent: 'Fix mobile hero section overflow and responsive layout',
    startedAt: new Date(Date.now() - 86400000 * 6 - 3600000),
    endedAt: new Date(Date.now() - 86400000 * 6),
    durationMinutes: 60,
    outcome: 'completed',
    logCount: 1,
    commitCount: 1,
    unresolvedCount: 0,
    logs: [
      { id: 'pf-s2-log-1', sessionId: 'pf-s-2', content: 'Hero section has overflow-x on mobile. min-w-0 on the flex child should fix it.', createdAt: new Date(Date.now() - 86400000 * 6 - 2000000), type: 'breakthrough', linkedCommitHash: 'pf-c2' },
    ],
    commits: [portfolioCommits[1]],
  },
]

// ─── E-Commerce API Data (Project 3) ──────────────────────────────────────────

const ecommerceLogs: LogEntry[] = [
  {
    id: 'ec-log-1',
    sessionId: 'ec-session-active',
    content: 'Stripe webhook failing silently — no error returned, but payment status not updating.',
    createdAt: new Date(Date.now() - 86400000 * 7 - 5400000),
    type: 'bug',
  },
  {
    id: 'ec-log-2',
    sessionId: 'ec-session-active',
    content: 'Think I found it — need to return 200 even on handled errors, otherwise Stripe retries.',
    createdAt: new Date(Date.now() - 86400000 * 7 - 3600000),
    type: 'breakthrough',
  },
  {
    id: 'ec-log-3',
    sessionId: 'ec-session-active',
    content: 'What happens if the DB write fails after we return 200 to Stripe? Need idempotency key.',
    createdAt: new Date(Date.now() - 86400000 * 7 - 1800000),
    type: 'question',
  },
]

const ecommerceCommits: Commit[] = [
  {
    id: 'ec-commit-1',
    hash: 'ec-c1',
    message: 'fix: return 200 on all handled webhook events',
    aiSummary: 'Fixed Stripe webhook to always return 200 on handled events to prevent retry loops. Unhandled events still return 400.',
    linkedLogIds: ['ec-log-2'],
    pushedAt: new Date(Date.now() - 86400000 * 7 - 3000000),
    filesChanged: ['src/api/stripe-webhook.ts'],
    additions: 18,
    deletions: 7,
  },
  {
    id: 'ec-commit-2',
    hash: 'ec-c2',
    message: 'feat: add order status endpoint',
    aiSummary: 'Added GET /orders/:id/status endpoint for the frontend to poll payment status.',
    linkedLogIds: [],
    pushedAt: new Date(Date.now() - 86400000 * 14),
    filesChanged: ['src/routes/orders.ts', 'src/models/Order.ts'],
    additions: 45,
    deletions: 2,
  },
]

const ecommerceHotFiles: HotFile[] = [
  { path: 'src/api/stripe-webhook.ts', changeCount: 9, lastModified: new Date(Date.now() - 86400000 * 7), heatLevel: 'critical' },
  { path: 'src/routes/orders.ts', changeCount: 6, lastModified: new Date(Date.now() - 86400000 * 14), heatLevel: 'high' },
  { path: 'src/models/Order.ts', changeCount: 4, lastModified: new Date(Date.now() - 86400000 * 14), heatLevel: 'medium' },
  { path: 'src/middleware/auth.ts', changeCount: 2, lastModified: new Date(Date.now() - 86400000 * 20), heatLevel: 'low' },
]

const ecommerceSessions: SessionRecord[] = [
  {
    id: 'ec-s-1',
    projectId: '3',
    intent: 'Debug Stripe webhook silent failures and payment status updates',
    startedAt: new Date(Date.now() - 86400000 * 7 - 7200000),
    endedAt: new Date(Date.now() - 86400000 * 7),
    durationMinutes: 120,
    outcome: 'abandoned',
    logCount: 3,
    commitCount: 1,
    unresolvedCount: 1,
    logs: ecommerceLogs,
    commits: [ecommerceCommits[0]],
  },
]

// ─── Aggregated Per-Project Data ──────────────────────────────────────────────

export const mockProjectData: Record<string, ProjectDataSlice> = {
  '1': {
    logs: nodeLinkLogs,
    commits: nodeLinkCommits,
    hotFiles: nodeLinkHotFiles,
    sessions: nodeLinkSessions,
  },
  '2': {
    logs: portfolioLogs,
    commits: portfolioCommits,
    hotFiles: portfolioHotFiles,
    sessions: portfolioSessions,
  },
  '3': {
    logs: ecommerceLogs,
    commits: ecommerceCommits,
    hotFiles: ecommerceHotFiles,
    sessions: ecommerceSessions,
  },
}

// ─── AI-Generated Session Briefing ────────────────────────────────────────────

export const generateBriefing = (project: Project): string => {
  if (project.frozenBriefing) return project.frozenBriefing
  return `Welcome back to ${project.name}. Last session, you were working on the RSSI distance formula and fixed a NaN issue caused by unclamped signal values. The files RadarScreen.kt and SignalMath.kt were most active, and your last unresolved thought was about refactoring the BLE service to use coroutines.`
}

// ─── Unresolved Items ─────────────────────────────────────────────────────────

export const mockUnresolvedItems = [
  { id: '1', logId: 'nl-log-1', description: 'GATT connection null issue on Sony Xperia', surfacedAt: new Date() },
  { id: '2', logId: 'nl-log-5', description: 'Decision pending: BLE service coroutine refactor', surfacedAt: new Date() },
]

// Legacy aliases (for backward compat during migration)
export const mockLogs = nodeLinkLogs
export const mockCommits = nodeLinkCommits
export const mockHotFiles = nodeLinkHotFiles
