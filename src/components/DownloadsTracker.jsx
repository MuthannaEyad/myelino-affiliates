import React, { useState, useRef, useEffect } from 'react'
import { getMemberPhoto } from '../utils/memberPhotos'
import styles from './DownloadsTracker.module.css'

function Avatar({ memberId, name }) {
  const photo = getMemberPhoto(memberId)
  if (photo) return <img src={photo} alt={name} className={styles.avatar} />
  return <div className={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</div>
}

function MemberChip({ member, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(member.downloads))
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 30)
  }, [editing])

  useEffect(() => {
    if (!editing) setVal(String(member.downloads))
  }, [member.downloads, editing])

  function commit() {
    const n = Math.max(0, parseInt(val, 10) || 0)
    setVal(String(n))
    setEditing(false)
    if (n !== member.downloads) onSave(member.id, n)
  }

  function handleKey(e) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') { setVal(String(member.downloads)); setEditing(false) }
  }

  return (
    <div className={styles.chip}>
      <Avatar memberId={member.id} name={member.fullName} />
      <span className={styles.chipName}>{member.fullName}</span>
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min="0"
          className={styles.chipInput}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKey}
          onBlur={commit}
        />
      ) : (
        <button
          className={styles.chipCount}
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {member.downloads.toLocaleString()}
        </button>
      )}
    </div>
  )
}

export default function DownloadsTracker({ members, onSave }) {
  const total = members.reduce((sum, m) => sum + (m.downloads || 0), 0)

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div>
            <h2 className={styles.title}>Downloads Tracker</h2>
            <p className={styles.subtitle}>Click a number to edit — <strong>{total.toLocaleString()}</strong> total downloads</p>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {members.length === 0 ? (
        <p className={styles.empty}>No affiliates yet.</p>
      ) : (
        <div className={styles.grid}>
          {members.map((m) => (
            <MemberChip key={m.id} member={m} onSave={onSave} />
          ))}
        </div>
      )}
    </div>
  )
}
