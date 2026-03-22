import { supabase } from '../lib/supabaseClient'

export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function fetchTrackingForDate(dateStr) {
  const { data, error } = await supabase
    .from('daily_tracking')
    .select('*')
    .eq('tracking_date', dateStr)

  if (error) throw error
  return data // array of { id, member_id, tracking_date, video_link, posted_on_myelino, myelino_count, posted_on_tiktok, tiktok_count }
}

export async function upsertTracking(memberId, dateStr, fields) {
  const { data, error } = await supabase
    .from('daily_tracking')
    .upsert(
      {
        member_id: memberId,
        tracking_date: dateStr,
        ...fields,
      },
      { onConflict: 'member_id,tracking_date' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

// Default shape for a tracking record with no DB row yet
export const TRACKING_DEFAULTS = {
  posted_on_myelino: false,
  myelino_count: 0,
  posted_on_instagram: false,
  instagram_count: 0,
  posted_on_tiktok: false,
  tiktok_count: 0,
}
