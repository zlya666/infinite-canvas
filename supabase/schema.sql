-- Infinite Canvas — Supabase 小团队多用户 schema（MVP）
-- 在 Supabase SQL Editor 中整段执行。启用后前端需配置：
--   VITE_SUPABASE_URL
--   VITE_SUPABASE_ANON_KEY

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_updated_at_idx
  on public.projects (user_id, updated_at desc);

alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

create table if not exists public.assets (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  name text,
  storage_key text,
  meta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists assets_user_id_updated_at_idx
  on public.assets (user_id, updated_at desc);

alter table public.assets enable row level security;

create policy "assets_select_own"
  on public.assets for select
  using (auth.uid() = user_id);

create policy "assets_insert_own"
  on public.assets for insert
  with check (auth.uid() = user_id);

create policy "assets_update_own"
  on public.assets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "assets_delete_own"
  on public.assets for delete
  using (auth.uid() = user_id);

-- 媒体桶：路径约定 {user_id}/images|videos|audios/...
insert into storage.buckets (id, name, public)
values ('user-media', 'user-media', false)
on conflict (id) do nothing;

create policy "user_media_select_own"
  on storage.objects for select
  using (bucket_id = 'user-media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "user_media_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'user-media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "user_media_update_own"
  on storage.objects for update
  using (bucket_id = 'user-media' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'user-media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "user_media_delete_own"
  on storage.objects for delete
  using (bucket_id = 'user-media' and auth.uid()::text = (storage.foldername(name))[1]);

-- 注册时自动创建 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
