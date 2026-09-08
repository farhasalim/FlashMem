-- FlashMem schema
-- Run this against your local Postgres: psql -U postgres -d flashmem -f schema.sql
-- (create the database first: createdb flashmem)

create extension if not exists "uuid-ossp";

-- Our own users table, since we're handling auth ourselves rather than using a
-- hosted provider. Passwords are stored as bcrypt hashes, never plain text.
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- One goal = one learning target with one uploaded document and one intensity tier.
create table goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,                     -- e.g. "Pass my thermodynamics midterm"
  description text,                        -- optional richer detail for better question targeting
  intensity text not null check (intensity in ('intense', 'moderate', 'easy')),
  end_date date not null,
  created_at timestamptz not null default now()
);

-- The source material for a goal (PDF, DOCX, or image). Text is extracted at upload time.
create table documents (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references goals(id) on delete cascade,
  file_name text not null,
  file_type text not null,                 -- 'pdf' | 'docx' | 'image'
  extracted_text text,                     -- raw parsed text, used as Claude's input
  created_at timestamptz not null default now()
);

-- AI-generated Q&A pairs derived from a document.
create table questions (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references goals(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

-- Every time a user answers a scheduled question, whether a daily quiz or a periodic pop quiz.
create table quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references goals(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  is_pop_quiz boolean not null default false,
  user_answer text,
  score numeric,                           -- 0-1, set by simple scoring logic (exact/fuzzy match) — TODO Week 2
  attempted_at timestamptz not null default now()
);

-- Tracks the current streak per goal. TODO Week 2: update via a trigger or app logic
-- whenever a quiz_attempt is inserted for that day.
create table streaks (
  goal_id uuid primary key references goals(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_completed_date date
);

 