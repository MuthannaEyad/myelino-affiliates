import { supabase } from '../lib/supabaseClient'

function fromDb(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    instagram: row.instagram,
    tiktok: row.tiktok ?? '',
    phone: row.phone,
    managerId: row.manager_id ?? null,
  }
}

export async function fetchMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data.map(fromDb)
}

export async function insertMember(memberData) {
  const { data, error } = await supabase
    .from('members')
    .insert({
      full_name: memberData.fullName.trim(),
      instagram: memberData.instagram.trim().replace(/^@+/, ''),
      tiktok: memberData.tiktok.trim().replace(/^@+/, '') || null,
      phone: memberData.phone.trim(),
      manager_id: memberData.managerId || null,
    })
    .select()
    .single()

  if (error) throw error
  return fromDb(data)
}

export async function updateMemberManager(memberId, managerId) {
  const { error } = await supabase
    .from('members')
    .update({ manager_id: managerId ?? null })
    .eq('id', memberId)

  if (error) throw error
}

export async function deleteMember(id) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)

  if (error) throw error
}
