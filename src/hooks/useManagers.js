import { useState, useCallback, useEffect } from 'react'
import { fetchManagers, insertManager, deleteManager } from '../services/managersService'

// Manager photos stay in localStorage (avoids needing Supabase Storage)
const photoKey = (id) => `myelino_mgr_photo_${id}`
const getPhoto = (id) => localStorage.getItem(photoKey(id)) || null
const savePhoto = (id, dataUrl) => {
  if (dataUrl) localStorage.setItem(photoKey(id), dataUrl)
  else localStorage.removeItem(photoKey(id))
}

export function useManagers() {
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(() =>
    fetchManagers().then((rows) =>
      setManagers(rows.map((r) => ({ ...r, photo: getPhoto(r.id) })))
    ), [])

  useEffect(() => {
    reload()
      .catch((err) => setError(err.message ?? 'Failed to load managers'))
      .finally(() => setLoading(false))
  }, [reload])

  const clearError = useCallback(() => setError(null), [])

  const addManager = useCallback(async (name, title, photo = null) => {
    try {
      const row = await insertManager(name, title)
      if (photo) savePhoto(row.id, photo)
      const manager = { ...row, photo: photo || null }
      setManagers((prev) => [...prev, manager])
      return manager
    } catch (err) {
      setError(err.message ?? 'Failed to add manager')
      return null
    }
  }, [])

  const removeManager = useCallback(async (id) => {
    setManagers((prev) => prev.filter((m) => m.id !== id))
    savePhoto(id, null)
    try {
      await deleteManager(id)
    } catch (err) {
      setError(err.message ?? 'Failed to remove manager')
      reload().catch(() => {})
    }
  }, [reload])

  const updateManagerPhoto = useCallback((id, photo) => {
    savePhoto(id, photo)
    setManagers((prev) => prev.map((m) => (m.id === id ? { ...m, photo } : m)))
  }, [])

  return { managers, loading, error, clearError, addManager, removeManager, updateManagerPhoto }
}
