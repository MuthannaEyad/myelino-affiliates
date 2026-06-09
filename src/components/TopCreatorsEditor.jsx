import React, { useState, useEffect } from 'react'
import { getMemberPhoto } from '../utils/memberPhotos'
import styles from './TopCreatorsEditor.module.css'

const RANK_LABELS = { 1: '1st Place', 2: '2nd Place', 3: '3rd Place' }
const RANK_COLORS = { 1: styles.gold, 2: styles.silver, 3: styles.bronze }
const MEDAL_ICONS = {
  1: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  2: <span style={{ fontSize: 16 }}>🥈</span>,
  3: <span style={{ fontSize: 16 }}>🥉</span>,
}

function SlotEditor({ slot, members, onChange }) {
  const selectedMember = members.find((m) => m.id === slot.member_id)

  return (
    <div className={`${styles.slot} ${RANK_COLORS[slot.rank]}`}>
      <div className={styles.slotRank}>
        <span className={styles.medalIcon}>{MEDAL_ICONS[slot.rank]}</span>
        <span className={styles.rankLabel}>{RANK_LABELS[slot.rank]}</span>
      </div>

      {/* Avatar preview */}
      <div className={styles.avatarPreview}>
        {selectedMember ? (
          getMemberPhoto(selectedMember.id)
            ? <img src={getMemberPhoto(selectedMember.id)} alt={selectedMember.fullName} className={styles.previewImg} />
            : <div className={styles.previewInitial}>{selectedMember.fullName.charAt(0).toUpperCase()}</div>
        ) : (
          <div className={styles.previewEmpty}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label}>Affiliate</label>
          <select
            className={styles.select}
            value={slot.member_id || ''}
            onChange={(e) => onChange({ ...slot, member_id: e.target.value || null })}
          >
            <option value="">— Select affiliate —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.fullName}</option>
            ))}
          </select>
        </div>

        <div className={styles.row3}>
          <div className={styles.field}>
            <label className={styles.label}>Views</label>
            <input
              type="number" min="0"
              className={styles.input}
              value={slot.views}
              onChange={(e) => onChange({ ...slot, views: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Downloads</label>
            <input
              type="number" min="0"
              className={styles.input}
              value={slot.downloads}
              onChange={(e) => onChange({ ...slot, downloads: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Payout (AED)</label>
            <input
              type="number" min="0" step="0.01"
              className={styles.input}
              value={slot.payout}
              onChange={(e) => onChange({ ...slot, payout: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TopCreatorsEditor({ topCreators, members, onSave }) {
  const [slots, setSlots] = useState(topCreators)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Keep in sync if parent reloads
  useEffect(() => { setSlots(topCreators) }, [topCreators])

  function updateSlot(updated) {
    setSlots((prev) => prev.map((s) => (s.rank === updated.rank ? updated : s)))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const ok = await onSave(slots)
    setSaving(false)
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h2 className={styles.title}>Top Creators of the Week</h2>
            <p className={styles.subtitle}>Select affiliates and enter their stats — reflected on the main page instantly</p>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.slotsGrid}>
        {slots.map((slot) => (
          <SlotEditor key={slot.rank} slot={slot} members={members} onChange={updateSlot} />
        ))}
      </div>

      <div className={styles.footer}>
        {saved && (
          <span className={styles.savedMsg}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved successfully
          </span>
        )}
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Top Creators'}
        </button>
      </div>
    </div>
  )
}
