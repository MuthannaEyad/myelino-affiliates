import { supabase } from '../lib/supabaseClient'

export async function fetchTopCreators() {
  const { data, error } = await supabase
    .from('top_creators')
    .select('*')
    .order('rank', { ascending: true })
  if (error) throw error
  return data
}

export async function saveTopCreator(rank, memberId, views, downloads, payout) {
  const { error } = await supabase
    .from('top_creators')
    .upsert({
      rank,
      member_id: memberId || null,
      views: views || 0,
      downloads: downloads || 0,
      payout: payout || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'rank' })
  if (error) throw error
}
