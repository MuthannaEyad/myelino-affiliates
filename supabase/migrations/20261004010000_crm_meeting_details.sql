-- Sales CRM — meeting details (shown in the Meeting table)
-- Run once in the Supabase SQL editor after 20261004000000_crm_phase1.sql.

alter table public.crm_leads
  add column if not exists meeting_date  date,
  add column if not exists meeting_time  time,
  add column if not exists meeting_mode  text check (meeting_mode in ('in_person', 'online')),
  add column if not exists meeting_notes text;
