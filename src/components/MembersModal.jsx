import React, { useState, useEffect, useRef } from 'react'
import styles from './MembersModal.module.css'

const EMPTY_MEMBER = { fullName: '', instagram: '', tiktok: '', phone: '' }

export default function MembersModal({
  isOpen,
  onClose,
  members,
  loading,
  error,
  clearError,
  addMember,
  removeMember,
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState(EMPTY_MEMBER)
  const [addErrors, setAddErrors] = useState({})
  const [adding, setAdding] = useState(false)
  const firstFieldRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setShowAddForm(false)
      setAddForm(EMPTY_MEMBER)
      setAddErrors({})
    }
  }, [isOpen])

  useEffect(() => {
    if (showAddForm) {
      setTimeout(() => firstFieldRef.current?.focus(), 50)
    }
  }, [showAddForm])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  function handleAddChange(e) {
    const { name, value } = e.target
    setAddForm((prev) => ({ ...prev, [name]: value }))
    if (addErrors[name]) setAddErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleAddSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!addForm.fullName.trim()) errs.fullName = 'Required'
    if (!addForm.instagram.trim()) errs.instagram = 'Required'
    if (!addForm.phone.trim()) errs.phone = 'Required'
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return }

    setAdding(true)
    const success = await addMember(addForm)
    setAdding(false)
    if (success) {
      setShowAddForm(false)
      setAddForm(EMPTY_MEMBER)
      setAddErrors({})
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="members-title">
        <div className={styles.modalHeader}>
          <h2 id="members-title" className={styles.title}>Affiliate Members</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {error && (
            <div className={styles.inlineError}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
              <button className={styles.errorDismiss} onClick={clearError} aria-label="Dismiss">×</button>
            </div>
          )}

          <div className={styles.addSection}>
            {!showAddForm ? (
              <button className={styles.addBtn} onClick={() => setShowAddForm(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Member
              </button>
            ) : (
              <form className={styles.addForm} onSubmit={handleAddSubmit} noValidate>
                <p className={styles.addFormTitle}>New Member</p>
                <div className={styles.addGrid}>
                  <AddField
                    ref={firstFieldRef}
                    label="Full Name"
                    name="fullName"
                    placeholder="Jane Doe"
                    value={addForm.fullName}
                    onChange={handleAddChange}
                    error={addErrors.fullName}
                  />
                  <AddField
                    label="Instagram Handle"
                    name="instagram"
                    placeholder="@handle"
                    value={addForm.instagram}
                    onChange={handleAddChange}
                    error={addErrors.instagram}
                  />
                  <AddField
                    label="TikTok Username"
                    name="tiktok"
                    placeholder="@tiktok"
                    value={addForm.tiktok}
                    onChange={handleAddChange}
                    error={addErrors.tiktok}
                    optional
                  />
                  <AddField
                    label="Phone Number"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={addForm.phone}
                    onChange={handleAddChange}
                    error={addErrors.phone}
                  />
                </div>
                <div className={styles.addFormActions}>
                  <button
                    type="button"
                    className={styles.cancelAddBtn}
                    onClick={() => { setShowAddForm(false); setAddErrors({}) }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={adding}>
                    {adding ? 'Saving…' : 'Save Member'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className={styles.listSection}>
            {loading ? (
              <p className={styles.stateText}>Loading members…</p>
            ) : members.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className={styles.emptyTitle}>No members yet</p>
                <p className={styles.emptySubtitle}>Add your first affiliate member above.</p>
              </div>
            ) : (
              <ul className={styles.memberList}>
                {members.map((member) => (
                  <li key={member.id} className={styles.memberRow}>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{member.fullName}</span>
                      <span className={styles.memberMeta}>
                        @{member.instagram}
                        {member.tiktok && (
                          <>
                            <span className={styles.dot}>·</span>
                            @{member.tiktok}
                            <span className={styles.tiktokTag}>TikTok</span>
                          </>
                        )}
                        <span className={styles.dot}>·</span>
                        {member.phone}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const AddField = React.forwardRef(function AddField(
  { label, name, placeholder, value, onChange, error, optional },
  ref
) {
  return (
    <div className={styles.addField}>
      <label className={styles.addLabel} htmlFor={`add-${name}`}>
        {label}
        {optional && <span className={styles.optionalTag}> (optional)</span>}
      </label>
      <input
        ref={ref}
        id={`add-${name}`}
        name={name}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${styles.addInput} ${error ? styles.addInputError : ''}`}
        autoComplete="off"
      />
      {error && <span className={styles.addError}>{error}</span>}
    </div>
  )
})
