import React, { useState, useEffect, useRef } from 'react'
import { STAGES, NEXT_ACTIONS, MEETING_MODES, getAction, dueInfo } from '../constants'
import ContactInfo from './ContactInfo'
import styles from './LeadsTable.module.css'

const ACTION_GROUPS = [
  { tone: 'chase', label: 'Follow up' },
  { tone: 'meet',  label: 'Meetings' },
  { tone: 'close', label: 'Closing' },
  { tone: 'care',  label: 'Onboarding & accounts' },
]

// Columns shown per stage. Meeting swaps the contact details (available via
// the ⓘ popover) for the meeting's own date, time, mode and notes.
const DEFAULT_COLUMNS = ['company', 'stage', 'contactName', 'phone', 'email', 'instagram', 'nextAction', 'due', 'notes', 'delete']
const STAGE_COLUMNS = {
  meeting: ['company', 'meetingDate', 'meetingTime', 'meetingMode', 'nextAction', 'meetingNotes', 'stage', 'delete'],
}

const HEADERS = {
  company: 'Company',
  stage: 'Stage',
  contactName: 'Spoke to',
  phone: 'Phone',
  email: 'Email',
  instagram: 'Instagram',
  nextAction: 'Next step',
  due: 'Due',
  notes: 'Notes',
  meetingDate: 'Date',
  meetingTime: 'Time',
  meetingMode: 'Mode',
  meetingNotes: 'Meeting notes',
  delete: '',
}

function normalize(field, value) {
  const trimmed = value.trim()
  return field === 'instagram' ? trimmed.replace(/^@+/, '') : trimmed
}

function LeadRow({ lead, columns, onUpdate, onDelete, autoFocus, highlight }) {
  const [draft, setDraft] = useState(lead)
  const rowRef = useRef(null)
  const companyRef = useRef(null)

  useEffect(() => setDraft(lead), [lead])

  useEffect(() => {
    if (autoFocus) companyRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    if (highlight) rowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [highlight])

  function edit(field) {
    return (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))
  }

  // Reads the DOM value rather than `draft`, which may not have re-rendered yet
  function commit(field, raw) {
    const value = normalize(field, raw)
    if (value !== raw) setDraft((d) => ({ ...d, [field]: value }))
    if (value !== lead[field]) onUpdate(lead.id, { [field]: value })
  }

  function saveNow(patch) {
    setDraft((d) => ({ ...d, ...patch }))
    onUpdate(lead.id, patch)
  }

  function textInput(field, placeholder, props = {}) {
    return (
      <input
        className={styles.input}
        value={draft[field]}
        placeholder={placeholder}
        onChange={edit(field)}
        onBlur={(e) => commit(field, e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        {...props}
      />
    )
  }

  function notesInput(field, placeholder) {
    return (
      <textarea
        className={`${styles.input} ${styles.notes}`}
        rows={1}
        value={draft[field]}
        placeholder={placeholder}
        onChange={edit(field)}
        onBlur={(e) => commit(field, e.target.value)}
      />
    )
  }

  const action = getAction(draft.nextAction)
  const due = dueInfo(draft.nextActionDue)
  const meetingDue = dueInfo(draft.meetingDate)
  const showInfo = columns.includes('meetingDate')

  const cells = {
    company: (
      <td className={styles.companyCell}>
        <div className={styles.companyWrap}>
          {textInput('companyName', 'Restaurant name', { ref: companyRef, className: `${styles.input} ${styles.companyInput}` })}
          {showInfo && <ContactInfo lead={draft} />}
        </div>
      </td>
    ),
    stage: (
      <td>
        <select
          className={`${styles.select} ${styles.stageSelect} ${styles[`stage_${draft.stage}`]}`}
          value={draft.stage}
          onChange={(e) => saveNow({ stage: e.target.value })}
        >
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </td>
    ),
    contactName: <td className={styles.colContact}>{textInput('contactName', 'Name')}</td>,
    phone: <td className={styles.colPhone}>{textInput('phone', 'Phone', { type: 'tel' })}</td>,
    email: <td className={styles.colEmail}>{textInput('email', 'Email', { type: 'email' })}</td>,
    instagram: (
      <td className={styles.colInstagram}>
        <div className={styles.handle}>
          <span className={styles.at}>@</span>
          {textInput('instagram', 'handle')}
        </div>
      </td>
    ),
    nextAction: (
      <td>
        <div className={styles.actionCell}>
          <select
            className={`${styles.select} ${styles.actionSelect} ${action ? styles[action.tone] : ''}`}
            value={draft.nextAction}
            onChange={(e) => saveNow({ nextAction: e.target.value })}
          >
            <option value="">No next step</option>
            {ACTION_GROUPS.map((group) => (
              <optgroup key={group.tone} label={group.label}>
                {NEXT_ACTIONS.filter((a) => a.tone === group.tone).map((a) => (
                  <option key={a.key} value={a.key}>{a.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {action && (
            <button
              className={styles.doneBtn}
              title="Mark done"
              aria-label="Mark next step done"
              onClick={() => saveNow({ nextAction: '', nextActionDue: '' })}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          )}
        </div>
      </td>
    ),
    due: (
      <td>
        <input
          type="date"
          className={`${styles.input} ${styles.dateInput} ${action && due ? styles[`due_${due.state}`] : ''}`}
          value={draft.nextActionDue}
          onChange={(e) => saveNow({ nextActionDue: e.target.value })}
          title={due?.label}
        />
      </td>
    ),
    notes: <td className={styles.notesCell}>{notesInput('notes', 'Notes')}</td>,
    meetingDate: (
      <td>
        <input
          type="date"
          className={`${styles.input} ${styles.dateInput} ${meetingDue ? styles[`due_${meetingDue.state}`] : ''}`}
          value={draft.meetingDate}
          onChange={(e) => saveNow({ meetingDate: e.target.value })}
          title={meetingDue?.label}
        />
      </td>
    ),
    meetingTime: (
      <td>
        <input
          type="time"
          className={`${styles.input} ${styles.timeInput}`}
          value={draft.meetingTime}
          onChange={(e) => setDraft((d) => ({ ...d, meetingTime: e.target.value }))}
          onBlur={(e) => commit('meetingTime', e.target.value)}
        />
      </td>
    ),
    meetingMode: (
      <td>
        <select
          className={`${styles.select} ${styles.modeSelect} ${draft.meetingMode ? styles[`mode_${draft.meetingMode}`] : ''}`}
          value={draft.meetingMode}
          onChange={(e) => saveNow({ meetingMode: e.target.value })}
        >
          <option value="">Choose…</option>
          {MEETING_MODES.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </td>
    ),
    meetingNotes: <td className={styles.notesCell}>{notesInput('meetingNotes', 'Meeting notes')}</td>,
    delete: (
      <td className={styles.deleteCell}>
        <button className={styles.deleteBtn} onClick={() => onDelete(lead)} aria-label="Delete lead" title="Delete lead">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </td>
    ),
  }

  return (
    <tr ref={rowRef} className={highlight ? styles.highlight : undefined}>
      {columns.map((col) => <React.Fragment key={col}>{cells[col]}</React.Fragment>)}
    </tr>
  )
}

export default function LeadsTable({ stage, leads, filtered, onAdd, onUpdate, onDelete, focusId, highlightId }) {
  const columns = STAGE_COLUMNS[stage.key] ?? DEFAULT_COLUMNS

  return (
    <section id={`stage-${stage.key}`} className={styles.section}>
      <div className={styles.sectionHead}>
        <div className={styles.sectionTitle}>
          <span className={`${styles.dot} ${styles[`dot_${stage.key}`]}`} />
          <h2>{stage.label}</h2>
          <span className={styles.count}>{leads.length}</span>
          <span className={styles.hint}>{stage.hint}</span>
        </div>
        <button className={styles.addBtn} onClick={() => onAdd(stage.key)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add lead
        </button>
      </div>

      <div className={styles.scroller}>
        <table className={`${styles.table} ${STAGE_COLUMNS[stage.key] ? styles[`table_${stage.key}`] : ''}`}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={col === 'company' ? styles.companyCell : undefined}
                  aria-label={col === 'delete' ? 'Actions' : undefined}
                >
                  {HEADERS[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyRow}>
                  {filtered ? 'No matches in this stage.' : 'No leads in this stage yet.'}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  columns={columns}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  autoFocus={lead.id === focusId}
                  highlight={lead.id === highlightId}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
