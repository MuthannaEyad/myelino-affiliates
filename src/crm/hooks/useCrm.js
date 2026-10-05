import { useState, useCallback, useEffect } from 'react'
import {
  fetchReps, insertRep, deleteRep,
  fetchLeads, insertLead, updateLead as updateLeadRow, deleteLead,
} from '../services/crmService'

export function useCrm() {
  const [reps, setReps] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    return Promise.all([fetchReps(), fetchLeads()])
      .then(([r, l]) => {
        setReps(r)
        setLeads(l)
      })
      .catch((err) => setError(err.message ?? 'Failed to load CRM data'))
  }, [])

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [reload])

  const clearError = useCallback(() => setError(null), [])

  const addRep = useCallback(async (fullName, title) => {
    try {
      const rep = await insertRep(fullName, title)
      setReps((prev) => [...prev, rep])
      return rep
    } catch (err) {
      setError(err.message ?? 'Failed to add salesperson')
      return null
    }
  }, [])

  const removeRep = useCallback(async (id) => {
    try {
      await deleteRep(id)
      setReps((prev) => prev.filter((r) => r.id !== id))
      setLeads((prev) => prev.filter((l) => l.repId !== id))
      return true
    } catch (err) {
      setError(err.message ?? 'Failed to remove salesperson')
      reload()
      return false
    }
  }, [reload])

  const addLead = useCallback(async (repId, stage) => {
    try {
      const lead = await insertLead(repId, stage)
      setLeads((prev) => [lead, ...prev])
      return lead
    } catch (err) {
      setError(err.message ?? 'Failed to add lead')
      return null
    }
  }, [])

  const updateLead = useCallback(async (id, patch) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
    try {
      await updateLeadRow(id, patch)
    } catch (err) {
      setError(err.message ?? 'Failed to save lead')
      reload()
    }
  }, [reload])

  const removeLead = useCallback(async (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
    try {
      await deleteLead(id)
    } catch (err) {
      setError(err.message ?? 'Failed to delete lead')
      reload()
    }
  }, [reload])

  return {
    reps, leads, loading, error, clearError,
    addRep, removeRep, addLead, updateLead, removeLead,
  }
}
