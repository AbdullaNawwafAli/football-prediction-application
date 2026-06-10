-- Create a public bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can read avatars (for leaderboard display)
create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users can only upload/update their own avatar
-- The path must start with their user ID
create policy "users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );