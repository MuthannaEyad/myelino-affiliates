import { supabase } from '../../lib/supabaseClient'

function repFromDb(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    title: row.title ?? '',
  }
}

function leadFromDb(row) {
  return {
    id: row.id,
    repId: row.rep_id,
    companyName: row.company_name ?? '',
    contactName: row.contact_name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    instagram: row.instagram ?? '',
    nextAction: row.next_action ?? '',
    nextActionDue: row.next_action_due ?? '',
    notes: row.notes ?? '',
    meetingDate: row.meeting_date ?? '',
    meetingTime: row.meeting_time?.slice(0, 5) ?? '', // Postgres returns HH:MM:SS
    meetingMode: row.meeting_mode ?? '',
    meetingNotes: row.meeting_notes ?? '',
    stage: row.stage,
    createdAt: row.created_at,
  }
}

const LEAD_COLUMNS = {
  companyName: 'company_name',
  contactName: 'contact_name',
  email: 'email',
  phone: 'phone',
  instagram: 'instagram',
  nextAction: 'next_action',
  nextActionDue: 'next_action_due',
  notes: 'notes',
  meetingDate: 'meeting_date',
  meetingTime: 'meeting_time',
  meetingMode: 'meeting_mode',
  meetingNotes: 'meeting_notes',
  stage: 'stage',
}

// Empty strings are stored as NULL (company_name is NOT NULL, so it keeps '')
function leadToDb(patch) {
  const row = {}
  for (const [key, value] of Object.entries(patch)) {
    const column = LEAD_COLUMNS[key]
    if (!column) continue
    const trimmed = typeof value === 'string' ? value.trim() : value
    row[column] = trimmed === '' && column !== 'company_name' ? null : trimmed
  }
  return row
}

export async function fetchReps() {
  const { data, error } = await supabase
    .from('sales_reps')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data.map(repFromDb)
}

export async function insertRep(fullName, title) {
  const { data, error } = await supabase
    .from('sales_reps')
    .insert({ full_name: fullName.trim(), title: title.trim() || null })
    .select()
    .single()

  if (error) throw error
  return repFromDb(data)
}

// Leads reference the rep with ON DELETE RESTRICT, so remove them first
export async function deleteRep(id) {
  const { error: leadsError } = await supabase
    .from('crm_leads')
    .delete()
    .eq('rep_id', id)

  if (leadsError) throw leadsError

  const { error } = await supabase
    .from('sales_reps')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function fetchLeads() {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(leadFromDb)
}

export async function insertLead(repId, stage) {
  const { data, error } = await supabase
    .from('crm_leads')
    .insert({ rep_id: repId, stage })
    .select()
    .single()

  if (error) throw error
  return leadFromDb(data)
}

export async function updateLead(id, patch) {
  const { error } = await supabase
    .from('crm_leads')
    .update(leadToDb(patch))
    .eq('id', id)

  if (error) throw error
}

export async function deleteLead(id) {
  const { error } = await supabase
    .from('crm_leads')
    .delete()
    .eq('id', id)

  if (error) throw error
}
