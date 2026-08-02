-- Supabase SQL to allow the app to insert/read documents using authenticated users.
-- Run this in Supabase SQL Editor.

-- 1) Enable RLS on the relevant tables.
alter table public.documents_activitylog enable row level security;
alter table public.documents_signatory enable row level security;
alter table public.documents_noadocument enable row level security;
alter table public.documents_ntpdocument enable row level security;
alter table public.documents_resodirectacquisition enable row level security;
alter table public.documents_resoemergencysplit enable row level security;
alter table public.documents_resolov enable row level security;
alter table public.documents_resosvp enable row level security;
alter table public.auth_metadata enable row level security;

-- 2) Create policies if they do not already exist.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_activitylog' and policyname = 'Allow authenticated users to read activity logs'
  ) then
    create policy "Allow authenticated users to read activity logs"
      on public.documents_activitylog
      for select
      using (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_activitylog' and policyname = 'Allow authenticated users to insert activity logs'
  ) then
    create policy "Allow authenticated users to insert activity logs"
      on public.documents_activitylog
      for insert
      with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_signatory' and policyname = 'Allow authenticated users to read signatories'
  ) then
    create policy "Allow authenticated users to read signatories"
      on public.documents_signatory
      for select
      using (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_signatory' and policyname = 'Allow authenticated users to manage signatories'
  ) then
    create policy "Allow authenticated users to manage signatories"
      on public.documents_signatory
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_noadocument' and policyname = 'Allow authenticated users to manage noa documents'
  ) then
    create policy "Allow authenticated users to manage noa documents"
      on public.documents_noadocument
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_ntpdocument' and policyname = 'Allow authenticated users to manage ntp documents'
  ) then
    create policy "Allow authenticated users to manage ntp documents"
      on public.documents_ntpdocument
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_resodirectacquisition' and policyname = 'Allow authenticated users to manage reso direct acquisition documents'
  ) then
    create policy "Allow authenticated users to manage reso direct acquisition documents"
      on public.documents_resodirectacquisition
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_resoemergencysplit' and policyname = 'Allow authenticated users to manage emergency split documents'
  ) then
    create policy "Allow authenticated users to manage emergency split documents"
      on public.documents_resoemergencysplit
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_resolov' and policyname = 'Allow authenticated users to manage lov documents'
  ) then
    create policy "Allow authenticated users to manage lov documents"
      on public.documents_resolov
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'documents_resosvp' and policyname = 'Allow authenticated users to manage svp documents'
  ) then
    create policy "Allow authenticated users to manage svp documents"
      on public.documents_resosvp
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'auth_metadata' and policyname = 'Allow authenticated users to manage auth metadata'
  ) then
    create policy "Allow authenticated users to manage auth metadata"
      on public.auth_metadata
      for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end
$$;
