-- Supabase Migration: Initial DevHub Schema
-- Created: 2024-05-05

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. TABLES

-- DEVELOPERS (PROFILES)
-- Maps 1:1 with auth.users
CREATE TABLE public.developers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    github_username TEXT,
    github_access_token TEXT, -- Encrypted or handled via separate integration table usually, but here for MVP
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER SETTINGS
CREATE TABLE public.settings (
    user_id UUID PRIMARY KEY REFERENCES public.developers(id) ON DELETE CASCADE,
    default_intent TEXT,
    -- Pomodoro
    pomodoro_focus_duration INTEGER DEFAULT 25 CHECK (pomodoro_focus_duration > 0),
    pomodoro_short_break INTEGER DEFAULT 5 CHECK (pomodoro_short_break > 0),
    pomodoro_long_break INTEGER DEFAULT 15 CHECK (pomodoro_long_break > 0),
    pomodoro_auto_start_breaks BOOLEAN DEFAULT TRUE,
    pomodoro_ai_suggestions BOOLEAN DEFAULT TRUE,
    -- Notifications
    notifications_session_reminders BOOLEAN DEFAULT TRUE,
    notifications_break_notifications BOOLEAN DEFAULT TRUE,
    notifications_commit_summaries BOOLEAN DEFAULT TRUE,
    notifications_sound_enabled BOOLEAN DEFAULT TRUE,
    notifications_sound_volume INTEGER DEFAULT 70 CHECK (notifications_sound_volume BETWEEN 0 AND 100),
    -- Appearance
    appearance_theme TEXT DEFAULT 'dark',
    appearance_accent_color TEXT DEFAULT 'amber',
    -- Voice
    voice_enabled BOOLEAN DEFAULT TRUE,
    voice_language TEXT DEFAULT 'en-US',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    repo_url TEXT,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    unresolved_threads_count INTEGER DEFAULT 0,
    frozen_briefing TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SESSIONS
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    intent TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    outcome TEXT CHECK (outcome IN ('completed', 'abandoned')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    log_count INTEGER DEFAULT 0,
    commit_count INTEGER DEFAULT 0,
    unresolved_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- LOGS (WEIRD STUFF FEED)
CREATE TABLE public.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('thought', 'bug', 'breakthrough', 'question', 'decision')),
    embedding VECTOR(1536), -- Dimension for OpenAI text-embedding-3-small or Gemini
    linked_commit_hash TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMITS (FROM GITHUB)
CREATE TABLE public.commits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    hash TEXT NOT NULL,
    message TEXT NOT NULL,
    ai_summary TEXT,
    pushed_at TIMESTAMPTZ NOT NULL,
    files_changed JSONB DEFAULT '[]'::JSONB,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOG_COMMIT_LINKS (M:M bridge for precision)
CREATE TABLE public.log_commit_links (
    log_id UUID REFERENCES public.logs(id) ON DELETE CASCADE,
    commit_id UUID REFERENCES public.commits(id) ON DELETE CASCADE,
    PRIMARY KEY (log_id, commit_id)
);

-- FEATURE IDEAS (BRAINSTORMER)
CREATE TABLE public.feature_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'in-progress')),
    affected_files JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    promoted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- HOT FILES (HEATMAP)
CREATE TABLE public.hot_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    change_count INTEGER DEFAULT 0,
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    heat_level TEXT DEFAULT 'low' CHECK (heat_level IN ('low', 'medium', 'high', 'critical')),
    UNIQUE(project_id, path)
);

-- 3. INDEXES
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_sessions_project_id ON public.sessions(project_id);
CREATE INDEX idx_logs_session_id ON public.logs(session_id);
CREATE INDEX idx_logs_project_id ON public.logs(project_id);
CREATE INDEX idx_commits_project_id ON public.commits(project_id);
CREATE INDEX idx_commits_session_id ON public.commits(session_id);
CREATE INDEX idx_feature_ideas_project_id ON public.feature_ideas(project_id);
CREATE INDEX idx_hot_files_project_id ON public.hot_files(project_id);

-- IVFFlat index for vector similarity search (adjust 'lists' as data grows)
CREATE INDEX idx_logs_embedding ON public.logs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 4. TRIGGER: AUTO-CREATE PROFILE & SETTINGS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.developers (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_commit_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_files ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Developers: Only user can see/edit their own profile
CREATE POLICY "Users can manage their own profile" ON public.developers
FOR ALL USING (auth.uid() = id);

-- Settings: Only user can see/edit their own settings
CREATE POLICY "Users can manage their own settings" ON public.settings
FOR ALL USING (auth.uid() = user_id);

-- Projects: Only user can see/edit their own projects
CREATE POLICY "Users can manage their own projects" ON public.projects
FOR ALL USING (auth.uid() = user_id);

-- Sessions: Access via project ownership
CREATE POLICY "Users can manage sessions of their projects" ON public.sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = public.sessions.project_id 
    AND public.projects.user_id = auth.uid()
  )
);

-- Logs: Access via project ownership
CREATE POLICY "Users can manage logs of their projects" ON public.logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = public.logs.project_id 
    AND public.projects.user_id = auth.uid()
  )
);

-- Commits: Access via project ownership
CREATE POLICY "Users can manage commits of their projects" ON public.commits
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = public.commits.project_id 
    AND public.projects.user_id = auth.uid()
  )
);

-- Log Commit Links: Access via project ownership of the log
CREATE POLICY "Users can manage log_commit_links of their projects" ON public.log_commit_links
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.logs
    JOIN public.projects ON public.logs.project_id = public.projects.id
    WHERE public.logs.id = public.log_commit_links.log_id
    AND public.projects.user_id = auth.uid()
  )
);

-- Feature Ideas: Access via project ownership
CREATE POLICY "Users can manage feature_ideas of their projects" ON public.feature_ideas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = public.feature_ideas.project_id 
    AND public.projects.user_id = auth.uid()
  )
);

-- Hot Files: Access via project ownership
CREATE POLICY "Users can manage hot_files of their projects" ON public.hot_files
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = public.hot_files.project_id 
    AND public.projects.user_id = auth.uid()
  )
);
