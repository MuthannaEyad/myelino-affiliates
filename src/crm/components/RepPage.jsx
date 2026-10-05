import React, { useState, useEffect, useCallback } from 'react'
import PasswordConfirmModal from '../../components/PasswordConfirmModal'
import { navigate } from '../../lib/router'
import { STAGES, getPriorities } from '../constants'
import { Avatar, StageSummary } from './Pills'
import LeadsTable from './LeadsTable'
import styles from './RepPage.module.css'

const SEARCH_FIELDS = ['companyName', 'contactName', 'email', 'phone', 'instagram', 'notes', 'meetingNotes']

function matches(lead, query) {
  const q = query.toLowerCase()
  return SEARCH_FIELDS.some((f) => lead[f].toLowerCase().includes(q))
}

export default function RepPage({ rep, leads, addLead, updateLead, removeLead, removeRep }) {
  const [query, setQuery] = useState('')
  const [focusId, setFocusId] = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const [leadToDelete, setLeadToDelete] = useState(null)
  const [confirmRemoveRep, setConfirmRemoveRep] = useState(false)

  useEffect(() => {
    if (!highlightId) return
    const timer = setTimeout(() => setHighlightId(null), 1800)
    return () => clearTimeout(timer)
  }, [highlightId])

  const priorities = getPriorities(leads)
  const visible = query.trim() ? leads.filter((l) => matches(l, query.trim())) : leads

  async function handleAdd(stage) {
    setQuery('')
    const lead = await addLead(rep.id, stage)
    if (lead) setFocusId(lead.id)
  }

  const handleUpdate = useCallback((id, patch) => {
    updateLead(id, patch)
    // Changing the stage moves the row to another table — flash it there
    if (patch.stage) setHighlightId(id)
  }, [updateLead])

  const handleDeleteLead = useCallback((lead) => setLeadToDelete(lead), [])
  const closeDeleteLead = useCallback(() => setLeadToDelete(null), [])
  const closeRemoveRep = useCallback(() => setConfirmRemoveRep(false), [])

  async function handleRemoveRep() {
    setConfirmRemoveRep(false)
    if (await removeRep(rep.id)) navigate('/crm')
  }

  function scrollToStage(key) {
    document.getElementById(`stage-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <button className={styles.backBtn} onClick={() => navigate('/crm')}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Sales team
      </button>

      <div className={styles.profile}>
        <Avatar name={rep.fullName} size={56} />
        <div className={styles.profileText}>
          <h1 className={styles.name}>{rep.fullName}</h1>
          <p className={styles.meta}>
            {rep.title && <>{rep.title} · </>}
            {leads.length} lead{leads.length !== 1 && 's'} · {priorities.length} open next step{priorities.length !== 1 && 's'}
          </p>
        </div>
        <button className={styles.removeBtn} onClick={() => setConfirmRemoveRep(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          <span>Delete salesperson</span>
        </button>
      </div>

      <StageSummary leads={leads} onSelect={scrollToStage} />

      <div className={styles.searchWrap}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by company, contact, phone, email, Instagram or notes"
        />
      </div>

      {STAGES.map((stage) => (
        <LeadsTable
          key={stage.key}
          stage={stage}
          leads={visible.filter((l) => l.stage === stage.key)}
          filtered={visible !== leads}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDeleteLead}
          focusId={focusId}
          highlightId={highlightId}
        />
      ))}

      <PasswordConfirmModal
        isOpen={leadToDelete !== null}
        title="Delete lead?"
        message={`${leadToDelete?.companyName || 'This lead'} and its notes will be permanently deleted. Enter the password to confirm.`}
        onConfirm={() => {
          removeLead(leadToDelete.id)
          setLeadToDelete(null)
        }}
        onCancel={closeDeleteLead}
      />

      <PasswordConfirmModal
        isOpen={confirmRemoveRep}
        title={`Delete ${rep.fullName}?`}
        message="They will be removed from the sales team. Enter the password to confirm."
        warning={leads.length > 0
          ? `This also permanently deletes their ${leads.length} lead${leads.length !== 1 ? 's' : ''}, including notes. This can't be undone.`
          : undefined}
        onConfirm={handleRemoveRep}
        onCancel={closeRemoveRep}
      />
    </>
  )
}
