import React, { useState, useEffect, useRef } from 'react'
import styles from './SubmitModal.module.css'

const EMPTY_FORM = { memberId: '', videoLink: '' }

function extractUrl(text) {
  const match = text.match(/(https?:\/\/[^\s]+)/i)
  return match ? match[1] : null
}

function isValidUrl(str) {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function SubmitModal({ isOpen, onClose, onSubmit, members, membersLoading, onOpenMembers }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const selectRef = useRef(null)

  const selectedMember = members.find((m) => m.id === form.memberId) ?? null

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM)
      setErrors({})
      setTimeout(() => selectRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  function validate() {
    const errs = {}
    if (!form.memberId) errs.memberId = 'Please select a member'
    const link = form.videoLink.trim()
    if (!link) {
      errs.videoLink = 'Video link is required'
    } else if (!isValidUrl(link)) {
      errs.videoLink = 'Please paste a valid link (must start with https://)'
    }
    return errs
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleLinkPaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const url = isValidUrl(pasted.trim()) ? pasted.trim() : extractUrl(pasted)
    const resolved = url ?? pasted.trim()
    setForm((prev) => ({ ...prev, videoLink: resolved }))
    setErrors((prev) => ({ ...prev, videoLink: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit({
      fullName: selectedMember.fullName,
      phone: selectedMember.phone,
      instagram: selectedMember.instagram,
      tiktok: selectedMember.tiktok || '',
      videoLink: form.videoLink.trim(),
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.title}>Add Submission</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Member selector */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="memberId">Who are you?</label>
            {membersLoading ? (
              <div className={styles.selectLoading}>Loading members…</div>
            ) : members.length === 0 ? (
              <div className={styles.selectEmpty}>
                No members yet — add yourself using the "Add new member" button.
              </div>
            ) : (
              <select
                ref={selectRef}
                id="memberId"
                name="memberId"
                value={form.memberId}
                onChange={handleChange}
                className={`${styles.select} ${errors.memberId ? styles.selectError : ''}`}
              >
                <option value="">Select your name…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            )}
            {errors.memberId && <span className={styles.error}>{errors.memberId}</span>}
            {!membersLoading && (
              <span className={styles.memberHint}>
                Not listed?{' '}
                <button type="button" className={styles.memberHintLink} onClick={() => { onClose(); onOpenMembers?.() }}>
                  Add yourself as a member →
                </button>
              </span>
            )}
          </div>

          {/* Auto-filled confirmation fields */}
          <div className={styles.autoFillRow}>
            <div className={styles.field}>
              <label className={styles.label}>Phone Number</label>
              <div className={`${styles.readonlyField} ${!selectedMember ? styles.readonlyEmpty : ''}`}>
                {selectedMember ? selectedMember.phone : 'Auto-filled on selection'}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Instagram</label>
              <div className={`${styles.readonlyField} ${!selectedMember ? styles.readonlyEmpty : ''}`}>
                {selectedMember ? `@${selectedMember.instagram}` : 'Auto-filled on selection'}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>TikTok</label>
              <div className={`${styles.readonlyField} ${!selectedMember || !selectedMember.tiktok ? styles.readonlyEmpty : ''}`}>
                {selectedMember && selectedMember.tiktok ? `@${selectedMember.tiktok}` : 'Auto-filled on selection'}
              </div>
            </div>
          </div>

          {/* Video link */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="videoLink">Video Link</label>
            <input
              id="videoLink"
              name="videoLink"
              type="text"
              placeholder="https://drive.google.com/… or any public link"
              value={form.videoLink}
              onChange={handleChange}
              onPaste={handleLinkPaste}
              className={`${styles.input} ${errors.videoLink ? styles.inputError : ''}`}
              autoComplete="off"
            />
            {!errors.videoLink && (
              <span className={styles.hint}>Paste any public video link — URL is extracted automatically</span>
            )}
            {errors.videoLink && <span className={styles.error}>{errors.videoLink}</span>}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={membersLoading || members.length === 0}
            >
              Submit Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
