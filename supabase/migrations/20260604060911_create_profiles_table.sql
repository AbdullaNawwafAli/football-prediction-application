-- Create the profiles table
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text unique not null,
  favorite_team text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Users can read any profile (needed for leaderboard display names/avatars)
create policy "profiles are publicly readable"
  on profiles for select
  using (true);

-- Users can only insert their own profile
create policy "users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Users can only update their own profile
create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id);