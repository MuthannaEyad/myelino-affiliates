import React, { useState } from 'react'
import styles from './MemberSearch.module.css'

const EMPTY_FORM = { fullName: '', instagram: '', tiktok: '', phone: '' }

export default function MemberSearch({ members, loading, onSelect, onExecClick, addMember }) {
  const [query, setQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [adding, setAdding] = useState(false)

  const filtered = query.trim()
    ? members.filter((m) => m.fullName.toLowerCase().includes(query.toLowerCase()))
    : members

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleAddSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Required'
    if (!form.instagram.trim()) errs.instagram = 'Required'
    if (!form.phone.trim()) errs.phone = 'Required'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setAdding(true)
    // addMember returns the new member object on success, or false on error
    const result = await addMember(form)
    setAdding(false)
    if (result) {
      // Auto-select the newly added member
      onSelect(result)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        </div>

        <h2 className={styles.title}>Find Your Name</h2>
        <p className={styles.subtitle}>
          Search for your name below to view and update your daily activity tracking.
        </p>

        {!showAddForm ? (
          <>
            <button className={styles.addNameBtn} onClick={() => setShowAddForm(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Member
            </button>

            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Type your name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                autoComplete="off"
              />
              {query && (
                <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="Clear search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {loading ? (
              <div className={styles.state}>Loading members…</div>
            ) : filtered.length === 0 ? (
              <div className={styles.state}>
                {query ? `No results for "${query}"` : 'No members registered yet.'}
              </div>
            ) : (
              <ul className={styles.list}>
                {filtered.map((m) => (
                  <li key={m.id}>
                    <button className={styles.memberBtn} onClick={() => onSelect(m)}>
                      <div className={styles.memberAvatar}>
                        {m.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.memberName}>{m.fullName}</span>
                      <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

          </>
        ) : (
          <form className={styles.addForm} onSubmit={handleAddSubmit} noValidate>
            <p className={styles.addFormTitle}>Add Yourself</p>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ms-fullName">Full Name</label>
              <input
                id="ms-fullName"
                name="fullName"
                type="text"
                className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={handleChange}
                autoFocus
                autoComplete="off"
              />
              {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ms-instagram">Instagram Handle</label>
              <input
                id="ms-instagram"
                name="instagram"
                type="text"
                className={`${styles.input} ${errors.instagram ? styles.inputError : ''}`}
                placeholder="@handle"
                value={form.instagram}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.instagram && <span className={styles.fieldError}>{errors.instagram}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ms-tiktok">
                TikTok Username <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="ms-tiktok"
                name="tiktok"
                type="text"
                className={styles.input}
                placeholder="@tiktok"
                value={form.tiktok}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="ms-phone">Phone Number</label>
              <input
                id="ms-phone"
                name="phone"
                type="text"
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); setErrors({}) }}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={adding}>
                {adding ? 'Saving…' : 'Save & Continue'}
              </button>
            </div>
          </form>
        )}

        <div className={styles.execRow}>
          <button className={styles.execBtn} onClick={onExecClick}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Executive View
          </button>
        </div>
      </div>
    </div>
  )
}
