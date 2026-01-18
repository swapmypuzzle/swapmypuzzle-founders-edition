-- SwapMyPuzzle: Founders Edition
-- Run this in Supabase SQL editor.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  country text not null default 'US',
  zip text,
  created_at timestamptz not null default now()
);

create table if not exists puzzles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  brand text,
  pieces int,
  theme text,
  condition text,
  missing_pieces text,
  notes text,
  cover_url text,
  created_at timestamptz not null default now()
);

create table if not exists puzzle_photos (
  id uuid primary key default gen_random_uuid(),
  puzzle_id uuid not null references puzzles(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create type trade_status as enum ('pending','accepted','declined','countered','shipped','delivered','completed');

create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  responder_id uuid not null references auth.users(id) on delete cascade,
  requested_puzzle_id uuid not null references puzzles(id) on delete cascade,
  offered_puzzle_id uuid not null references puzzles(id) on delete cascade,
  status trade_status not null default 'pending',
  requester_tracking text,
  responder_tracking text,
  ship_by timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references trades(id) on delete cascade,
  rater_id uuid not null references auth.users(id) on delete cascade,
  ratee_id uuid not null references auth.users(id) on delete cascade,
  cleanliness int not null check (cleanliness between 1 and 5),
  puzzle_ready int not null check (puzzle_ready between 1 and 5),
  pieces_included text not null,
  ship_speed int not null check (ship_speed between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(trade_id, rater_id)
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;
alter table puzzles enable row level security;
alter table puzzle_photos enable row level security;
alter table trades enable row level security;
alter table ratings enable row level security;
alter table posts enable row level security;

-- Profiles: users can read/update their own profile
create policy if not exists "profiles_read_own" on profiles for select using (auth.uid() = id);
create policy if not exists "profiles_upsert_own" on profiles for insert with check (auth.uid() = id);
create policy if not exists "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Puzzles: public read, owners write
create policy if not exists "puzzles_public_read" on puzzles for select using (true);
create policy if not exists "puzzles_owner_insert" on puzzles for insert with check (auth.uid() = owner_id);
create policy if not exists "puzzles_owner_update" on puzzles for update using (auth.uid() = owner_id);
create policy if not exists "puzzles_owner_delete" on puzzles for delete using (auth.uid() = owner_id);

-- Photos: public read, owners insert via join to puzzles
create policy if not exists "photos_public_read" on puzzle_photos for select using (true);
create policy if not exists "photos_owner_insert" on puzzle_photos for insert with check (
  exists (select 1 from puzzles p where p.id = puzzle_id and p.owner_id = auth.uid())
);
create policy if not exists "photos_owner_delete" on puzzle_photos for delete using (
  exists (select 1 from puzzles p where p.id = puzzle_id and p.owner_id = auth.uid())
);

-- Trades: only participants can read/write
create policy if not exists "trades_participant_read" on trades for select using (auth.uid() = requester_id or auth.uid() = responder_id);
create policy if not exists "trades_requester_insert" on trades for insert with check (auth.uid() = requester_id);
create policy if not exists "trades_participant_update" on trades for update using (auth.uid() = requester_id or auth.uid() = responder_id);

-- Ratings: participants can create once; public read (so puzzle people can trust)
create policy if not exists "ratings_public_read" on ratings for select using (true);
create policy if not exists "ratings_participant_insert" on ratings for insert with check (
  auth.uid() = rater_id
);

-- Posts: public read, authenticated write
create policy if not exists "posts_public_read" on posts for select using (true);
create policy if not exists "posts_auth_insert" on posts for insert with check (auth.uid() = user_id);

-- Storage bucket note:
-- Create bucket: puzzle-photos (public).
