import { useState, useCallback, useEffect } from 'react'
import { fetchMembers, insertMember, updateMemberManager, deleteMember } from '../services/membersService'

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMembers()
      .then(setMembers)
      .catch((err) => setError(err.message ?? 'Failed to load members'))
      .finally(() => setLoading(false))
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const addMember = useCallback(async (memberData) => {
    try {
      const member = await insertMember(memberData)
      setMembers((prev) => [...prev, member])
      return member
    } catch (err) {
      setError(err.message ?? 'Failed to add member')
      return false
    }
  }, [])

  // managerId can be a UUID string or null (to unassign)
  const assignMember = useCallback(async (memberId, managerId) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, managerId: managerId ?? null } : m))
    )
    try {
      await updateMemberManager(memberId, managerId)
    } catch (err) {
      setError(err.message ?? 'Failed to update assignment')
      fetchMembers().then(setMembers).catch(() => {})
    }
  }, [])

  const removeMember = useCallback(async (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    try {
      await deleteMember(id)
    } catch (err) {
      setError(err.message ?? 'Failed to remove member')
      fetchMembers().then(setMembers).catch(() => {})
    }
  }, [])

  return { members, loading, error, clearError, addMember, assignMember, removeMember }
}
