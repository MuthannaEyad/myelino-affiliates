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
    submittedAt: row.created_at,
    postedOnMyelino: row.posted_on_myelino ?? false,
    myelinoCount: row.myelino_count ?? 0,
    postedOnTiktok: row.posted_on_tiktok ?? false,
    tiktokCount: row.tiktok_count ?? 0,
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
      status: 'not_reviewed', // kept for DB compatibility
    })
    .select()
    .single()

  if (error) throw error
  return fromDb(data)
}

export async function updateMyelinoPosted(id, posted, count) {
  const { error } = await supabase
    .from('submissions')
    .update({
      posted_on_myelino: posted,
      myelino_count: posted ? (count || 0) : 0,
    })
    .eq('id', id)

  if (error) throw error
}

export async function updateTiktokPosted(id, posted, count) {
  const { error } = await supabase
    .from('submissions')
    .update({
      posted_on_tiktok: posted,
      tiktok_count: posted ? (count || 0) : 0,
    })
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
