import React, { useState, useEffect, useRef } from 'react'
import { navigate } from '../../lib/router'
import { getPriorities, dueInfo } from '../constants'
import { ActionPill, DueLabel, Avatar, StageSummary } from './Pills'
import styles from './RepGrid.module.css'

const MAX_PRIORITIES = 4

function RepCard({ rep, leads }) {
  const priorities = getPriorities(leads)
  const shown = priorities.slice(0, MAX_PRIORITIES)
  const overdue = priorities.filter((l) => dueInfo(l.nextActionDue)?.state === 'overdue').length

  return (
    <button className={styles.card} onClick={() => navigate(`/crm/${rep.id}`)}>
      <div className={styles.cardHead}>
        <Avatar name={rep.fullName} size={44} />
        <div className={styles.cardName}>
          <span className={styles.name}>{rep.fullName}</span>
          {rep.title && <span className={styles.title}>{rep.title}</span>}
        </div>
        {overdue > 0 && <span className={styles.overdueBadge}>{overdue} overdue</span>}
      </div>

      <div className={styles.cardBody}>
        <p className={styles.sectionLabel}>
          Priorities{priorities.length > 0 && <span className={styles.count}>{priorities.length}</span>}
        </p>
        {shown.length === 0 ? (
          <p className={styles.empty}>All caught up</p>
        ) : (
          <ul className={styles.priorityList}>
            {shown.map((lead) => (
              <li key={lead.id} className={styles.priority}>
                <ActionPill actionKey={lead.nextAction} />
                <span className={styles.company}>{lead.companyName || 'Untitled lead'}</span>
                <DueLabel date={lead.nextActionDue} />
              </li>
            ))}
          </ul>
        )}
        {priorities.length > MAX_PRIORITIES && (
          <p className={styles.more}>+{priorities.length - MAX_PRIORITIES} more</p>
        )}
      </div>

      <div className={styles.cardFoot}>
        <StageSummary leads={leads} compact />
      </div>
    </button>
  )
}

function AddRepModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    nameRef.current?.focus()
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    const rep = await onAdd(name, title)
    setSaving(false)
    if (rep) onClose()
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={styles.dialog} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="add-rep-title">
        <h3 id="add-rep-title" className={styles.dialogTitle}>Add salesperson</h3>
        <label className={styles.field}>
          <span>Full name</span>
          <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anas Alnobani" />
        </label>
        <label className={styles.field}>
          <span>Title <em>(optional)</em></span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Account Executive" />
        </label>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.primaryBtn} disabled={!name.trim() || saving}>
            {saving ? 'Adding…' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function RepGrid({ reps, leads, addRep }) {
  const [adding, setAdding] = useState(false)

  return (
    <>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.pageTitle}>Sales team</h1>
          <p className={styles.pageSubtitle}>Pick your name to open your pipeline.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setAdding(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add salesperson
        </button>
      </div>

      <StageSummary leads={leads} />

      {reps.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No salespeople yet</p>
          <p className={styles.emptyText}>Add the first person on the sales team to start tracking leads.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {reps.map((rep) => (
            <RepCard key={rep.id} rep={rep} leads={leads.filter((l) => l.repId === rep.id)} />
          ))}
        </div>
      )}

      {adding && <AddRepModal onClose={() => setAdding(false)} onAdd={addRep} />}
    </>
  )
}
