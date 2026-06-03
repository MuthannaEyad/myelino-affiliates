import { supabase } from '../lib/supabaseClient'

export async function fetchManagers() {
  const { data, error } = await supabase
    .from('managers')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function insertManager(name, title) {
  const { data, error } = await supabase
    .from('managers')
    .insert({ name, title: title || null })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteManager(id) {
  const { error } = await supabase
    .from('managers')
    .delete()
    .eq('id', id)

  if (error) throw error
}
