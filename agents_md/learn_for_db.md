I want you to thoroughly analyze the entire Dev Hub frontend codebase. 
Your goal is to discover — not guess — the complete database structure 
needed to persist all user data in Supabase.

### WHAT TO DO

1. Read every file in:
   - /components/
   - /app/
   - /hooks/
   - /store/ (Zustand or any state management)
   - /utils/
   - Any configuration or type definition files

2. As you read, identify:
   - Every piece of data that must survive a page refresh or browser close.
   - Every relationship (user → project → session → log, etc.).
   - Every UI component that expects data from a backend.
   - Every mocked/stubbed value that represents real data.

3. For each data point, determine:
   - Does it need its own table?
   - Does it belong as a column in an existing table?
   - Is it ephemeral (timer seconds, UI toggles) and NOT stored?

4. Produce the output in three sections:

### SECTION A: Complete Supabase SQL Schema
- Raw SQL with CREATE TABLE statements.
- Include: table name, every column with type, primary keys (UUID), 
  foreign keys, indexes, constraints, defaults.
- Enable extensions: pgcrypto, vector.
- Use Supabase-compatible syntax.

### SECTION B: Database Relationship Map
- Plain English explanation of each table.
- What frontend feature it supports.
- How tables relate (one-to-many, many-to-many).
- Example: "One project has many sessions. The sidebar session list 
  queries SELECT * FROM sessions WHERE project_id = ..."

### SECTION C: API Endpoint Recommendations
- Based on the schema, what REST endpoints are needed?
- Format: METHOD /path → purpose (e.g., POST /sessions → create new session)

### AUTHENTICATION GUIDANCE
- Confirm that Supabase Auth handles email, Google, and GitHub.
- Explain how the developers table links to auth.users.
- Provide steps to obtain Google OAuth client ID (Google Cloud Console) 
  and GitHub OAuth client ID (GitHub Developer Settings).

### RULES
- Do NOT invent tables that aren't needed by the frontend.
- Do NOT skip any data that the UI expects.
- If you're unsure whether something is stored, flag it and explain why.