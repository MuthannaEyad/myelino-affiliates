import React, { useState, useEffect, useRef } from 'react'
import styles from './ConfirmModal.module.css'
import pwStyles from './PasswordConfirmModal.module.css'

// Delete confirmation that also requires the executive password
export default function PasswordConfirmModal({ isOpen, title, message, warning, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setPassword('')
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)

    function onKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  function submit(e) {
    e.preventDefault()
    if (password === import.meta.env.VITE_SUMMARY_PASSWORD) {
      onConfirm()
    } else {
      setError('Incorrect password.')
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <form className={styles.dialog} onSubmit={submit} role="alertdialog" aria-modal="true" aria-labelledby="pw-confirm-title">
        <div className={styles.iconWrap}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h3 id="pw-confirm-title" className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        {warning && (
          <div className={styles.warningBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{warning}</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="password"
          className={pwStyles.input}
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null) }}
          autoComplete="off"
        />
        {error && <p className={pwStyles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button type="submit" className={styles.deleteBtn}>{confirmLabel}</button>
        </div>
      </form>
    </div>
  )
}
