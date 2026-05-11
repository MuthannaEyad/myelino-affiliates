import React, { useState, useEffect, useRef } from 'react'
import { generateDailySummary } from '../services/summaryService'
import styles from './DailySummary.module.css'

// Simple markdown → JSX renderer for the specific format Claude returns
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className={styles.mdH2}>{line.slice(3)}</h2>)
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={key++} className={styles.mdSectionHeader}>{line.slice(2, -2)}</p>)
    } else if (line.startsWith('- ')) {
      elements.push(<li key={key++} className={styles.mdLi}>{inlineBold(line.slice(2))}</li>)
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className={styles.mdSpacer} />)
    } else {
      elements.push(<p key={key++} className={styles.mdP}>{inlineBold(line)}</p>)
    }
  }

  return elements
}

function inlineBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function DailySummary({ members, tracking, selectedDate }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Password modal state
  const [pwOpen, setPwOpen] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(null)
  const pwInputRef = useRef(null)

  // Focus input when modal opens
  useEffect(() => {
    if (pwOpen) {
      setTimeout(() => pwInputRef.current?.focus(), 50)
    }
  }, [pwOpen])

  // Escape key closes modal
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closePwModal()
    }
    if (pwOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pwOpen])

  function openPwModal() {
    setPwInput('')
    setPwError(null)
    setPwOpen(true)
  }

  function closePwModal() {
    setPwOpen(false)
    setPwInput('')
    setPwError(null)
  }

  function handleConfirm() {
    if (pwInput === import.meta.env.VITE_SUMMARY_PASSWORD) {
      closePwModal()
      handleGenerate()
    } else {
      setPwError('Incorrect password. Access denied.')
    }
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const result = await generateDailySummary(members, tracking, selectedDate)
      setSummary(result)
    } catch (err) {
      setError(err.message ?? 'Failed to generate summary.')
    } finally {
      setLoading(false)
    }
  }

  function handleDismiss() {
    setSummary(null)
    setError(null)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.buttonRow}>
        <button
          className={styles.generateBtn}
          onClick={openPwModal}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              Generating summary…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
                <path d="M22 2 12 12" />
              </svg>
              {summary ? 'Regenerate Summary' : 'Generate Daily Summary'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {summary && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              AI Summary
            </span>
            <button className={styles.dismissBtn} onClick={handleDismiss} aria-label="Dismiss summary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className={styles.panelBody}>
            {renderMarkdown(summary)}
          </div>
        </div>
      )}

      {/* Password modal */}
      {pwOpen && (
        <div className={styles.pwOverlay} onClick={(e) => e.target === e.currentTarget && closePwModal()}>
          <div className={styles.pwDialog} role="dialog" aria-modal="true" aria-labelledby="pw-title">
            <div className={styles.pwIconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 id="pw-title" className={styles.pwTitle}>Enter Password</h3>
            <p className={styles.pwSubtitle}>This feature is restricted. Enter the password to continue.</p>
            <input
              ref={pwInputRef}
              type="password"
              className={styles.pwInput}
              placeholder="Password"
              value={pwInput}
              onChange={(e) => { setPwInput(e.target.value); setPwError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              autoComplete="off"
            />
            {pwError && (
              <p className={styles.pwError}>{pwError}</p>
            )}
            <div className={styles.pwActions}>
              <button className={styles.pwCancelBtn} onClick={closePwModal}>Cancel</button>
              <button className={styles.pwConfirmBtn} onClick={handleConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
