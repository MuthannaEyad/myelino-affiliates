-- Sales CRM — phase 1
-- Run once in the Supabase SQL editor (or `supabase db push`).

-- ── Sales reps ─────────────────────────────────────────────────────────────
create table if not exists public.sales_reps (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  title       text,
  created_at  timestamptz not null default now()
);

-- ── Leads (one row per restaurant / company) ───────────────────────────────
create table if not exists public.crm_leads (
  id                uuid primary key default gen_random_uuid(),
  -- restrict: a rep can't be deleted while they still own leads
  rep_id            uuid not null references public.sales_reps(id) on delete restrict,
  company_name      text not null default '',
  contact_name      text,
  email             text,
  phone             text,
  instagram         text,
  next_action       text,          -- tag key, see src/crm/constants.js
  next_action_due   date,
  notes             text,
  stage             text not null default 'contact'
                    check (stage in ('contact', 'meeting', 'signed_up', 'active')),
  stage_changed_at  timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists crm_leads_rep_id_idx on public.crm_leads (rep_id);

-- Keep updated_at / stage_changed_at accurate without trusting the client
create or replace function public.crm_leads_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.stage is distinct from old.stage then
    new.stage_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists crm_leads_touch on public.crm_leads;
create trigger crm_leads_touch
  before update on public.crm_leads
  for each row execute function public.crm_leads_touch();

-- ── Access ────────────────────────────────────────────────────────────────
-- Phase 1 matches the affiliates dashboard: the browser uses the public anon
-- key, so anyone with the site URL can read/write these tables. Once Supabase
-- Auth is added, replace these policies with `to authenticated` ones.
grant select, insert, update, delete on public.sales_reps to anon, authenticated;
grant select, insert, update, delete on public.crm_leads  to anon, authenticated;

alter table public.sales_reps enable row level security;
alter table public.crm_leads  enable row level security;

drop policy if exists "crm phase 1 open access" on public.sales_reps;
create policy "crm phase 1 open access" on public.sales_reps
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "crm phase 1 open access" on public.crm_leads;
create policy "crm phase 1 open access" on public.crm_leads
  for all to anon, authenticated using (true) with check (true);
