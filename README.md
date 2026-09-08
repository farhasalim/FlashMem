# FlashMem

Turns your notes, PDFs, or document photos into a scheduled quiz plan matched to a specific learning goal, at an intensity you choose.

This is the Week 1 scaffold: auth, goal creation, document upload, AI-generated Q&A, and a basic quiz-taking flow. Streaks, intensity-tier scheduling, and the progress dashboard are stubbed for Week 2–3 (see `TODO` comments throughout).

## Stack

- **Frontend:** React + Vite
- **Backend:** Node + Express
- **DB:** Local PostgreSQL
- **Auth:** Hand-rolled — bcrypt password hashing + JWT tokens, no third-party auth provider
- **Question generation:** Anthropic Claude API (Haiku 4.5)
- **Deploy target:** Vercel (frontend) + Render (backend), with a hosted Postgres like Render/Neon/Supabase's DB-only tier for production once you're ready to deploy

## Project structure

```
flashmem/
  backend/
    src/
      db/schema.sql        # Postgres schema — run this in Supabase's SQL editor
      db.js                # Postgres connection pool
      services/
        claudeService.js   # Calls Claude to generate Q&A from parsed text
        parseDocument.js   # Extracts text from PDF/DOCX/image uploads
      routes/
        goals.js
        documents.js
        quizzes.js
      index.js             # Express app entrypoint
    package.json
    .env.example
  frontend/
    src/
      lib/supabaseClient.js
      pages/
        Login.jsx
        Dashboard.jsx
        NewGoal.jsx
        Quiz.jsx
      components/
        Nav.jsx
        GoalCard.jsx
      App.jsx
      main.jsx
      styles/index.css
    package.json
```

## Setup — do this first

1. **Create the local database** (assumes Postgres is already installed and running):
   ```bash
   createdb flashmem
   psql -d flashmem -f backend/src/db/schema.sql
   ```

2. **Get an Anthropic API key** at console.anthropic.com if you don't already have one.
   Consider setting a spending cap (e.g. $5) in the console — this project costs
   cents per goal you create, so a small cap is plenty of headroom with zero risk
   of surprise charges.

3. **Generate a JWT secret** — any long random string works:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Backend setup:**
   ```bash
   cd backend
   cp .env.example .env   # fill in DATABASE_URL (adjust user/password if needed),
                           # JWT_SECRET, and ANTHROPIC_API_KEY
   npm install
   npm run dev             # starts on http://localhost:4000
   ```

5. **Frontend setup:**
   ```bash
   cd frontend
   cp .env.example .env   # VITE_API_URL is the only thing to check here
   npm install
   npm run dev             # starts on http://localhost:5173
   ```

## Week 1 build order (suggested)

1. Confirm Supabase auth works end to end (signup/login from the frontend).
2. Wire up "create goal" → saves a row in `goals`.
3. Wire up document upload → `parseDocument.js` extracts text → `claudeService.js` generates 5-10 Q&A pairs → saved to `questions` table.
4. Build the quiz-taking flow: pull due questions, show one at a time, capture + score answers into `quiz_attempts`.
5. Stop there for Week 1 — no streaks, no tiers, no charts yet. Get the core loop working end to end first.

## Notes on the scaffold

- Every file with a `// TODO` marks a deliberate simplification for Week 1 — read those before extending.
- Error handling is intentionally minimal in this scaffold — added as a stretch goal once the core loop works, since it's better learning to add it yourself than to have it handed to you.
