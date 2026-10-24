-- Shared EGS Quiz Arena state. Public visitors can view; authenticated judges can edit.
create table if not exists public.quiz_state (
  id text primary key check (id = 'main'),
  state jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.quiz_state enable row level security;
revoke all on public.quiz_state from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.quiz_state to anon, authenticated;
grant insert, update on public.quiz_state to authenticated;
drop policy if exists quiz_state_public_read on public.quiz_state;
create policy quiz_state_public_read on public.quiz_state for select to anon, authenticated using (id = 'main');
drop policy if exists quiz_state_judge_insert on public.quiz_state;
create policy quiz_state_judge_insert on public.quiz_state for insert to authenticated with check (id = 'main');
drop policy if exists quiz_state_judge_update on public.quiz_state;
create policy quiz_state_judge_update on public.quiz_state for update to authenticated using (id = 'main') with check (id = 'main');
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'quiz_state') then
    alter publication supabase_realtime add table public.quiz_state;
  end if;
end $$;

-- Shared team logo assets. Public downloads let projector/viewer devices display logos;
-- only authenticated quiz judges can upload into this dedicated bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quiz-team-logos', 'quiz-team-logos', true, 4194304, array['image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists quiz_team_logos_judge_upload on storage.objects;
create policy quiz_team_logos_judge_upload
on storage.objects for insert to authenticated
with check (bucket_id = 'quiz-team-logos');
