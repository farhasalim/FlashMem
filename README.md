# FlashMem

Turns your notes, PDFs, or document photos into a scheduled quiz plan matched to a specific learning goal, at an intensity you choose.
[This is a V1 product. Improvements will be added. Please note that Render may take a few seconds to load it on opening the application]

## Stack

- **Frontend:** React + Vite
- **Backend:** Node + Express
- **DB:** Local PostgreSQL
- **Auth:** Hand-rolled — bcrypt password hashing + JWT tokens, no third-party auth provider
- **Question generation:** Gemini API
- **Deploy target:** Render (frontend + backend), with a hosted Postgres like Neon DB-only tier for production 
## Project structure

```
flashmem/
  backend/
    src/
      db/schema.sql        # Postgres schema 
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
   npm run dev             
   ```

5. **Frontend setup:**
   ```bash
   cd frontend
   cp .env.example .env   # VITE_API_URL is the only thing to check here
   npm install
   npm run dev            
   ```


