import { supabase } from '../lib/supabaseClient'

// Maps a Supabase row (snake_case) to the shape the UI expects (camelCase)
function fromDb(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    instagram: row.instagram,
    tiktok: row.tiktok ?? '',
    videoLink: row.video_link,
    submissionType: row.submission_type ?? 'social',
    status: row.status,
    rejectionNote: row.rejection_note ?? '',
    submittedAt: row.created_at,
  }
}

export async function fetchSubmissions() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(fromDb)
}

export async function insertSubmission(formData) {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      full_name: formData.fullName.trim(),
      phone: formData.phone.trim(),
      instagram: formData.instagram.trim().replace(/^@+/, ''),
      tiktok: formData.tiktok ? formData.tiktok.trim().replace(/^@+/, '') : null,
      video_link: formData.videoLink.trim(),
      submission_type: formData.submissionType ?? 'social',
      status: 'not_reviewed',
    })
    .select()
    .single()

  if (error) throw error
  return fromDb(data)
}

export async function updateSubmissionStatus(id, status) {
  const { error } = await supabase
    .from('submissions')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}

export async function updateSubmissionNote(id, rejectionNote) {
  const { error } = await supabase
    .from('submissions')
    .update({ rejection_note: rejectionNote })
    .eq('id', id)

  if (error) throw error
}

export async function deleteSubmission(id) {
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', id)

  if (error) throw error
}
