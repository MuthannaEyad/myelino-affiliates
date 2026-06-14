import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import styles from './BudgetBar.module.css'

const TOTAL_BUDGET = 500000

function fmt(n) {
  return n.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

async function fetchSpent() {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'budget_spent')
    .single()
  if (error) throw error
  return parseFloat(data.value) || 0
}

async function saveSpent(amount) {
  const { error } = await supabase
    .from('settings')
    .update({ value: String(amount), updated_at: new Date().toISOString() })
    .eq('key', 'budget_spent')
  if (error) throw error
}

export default function BudgetBar({ isExecutive }) {
  const [spent, setSpent] = useState(0)
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [saving, setSaving] = useState(false)

  // Password prompt state
  const [pwOpen, setPwOpen] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(null)
  const pwInputRef = useRef(null)
  const editInputRef = useRef(null)

  useEffect(() => {
    fetchSpent().then(setSpent).catch(() => {})
  }, [])

  useEffect(() => {
    if (editing) setTimeout(() => editInputRef.current?.focus(), 30)
  }, [editing])

  useEffect(() => {
    if (pwOpen) setTimeout(() => pwInputRef.current?.focus(), 50)
  }, [pwOpen])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closePw()
    }
    if (pwOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pwOpen])

  const pct = Math.min((spent / TOTAL_BUDGET) * 100, 100)
  const remaining = Math.max(TOTAL_BUDGET - spent, 0)
  const barClass = pct < 60 ? styles.barGreen : pct < 85 ? styles.barYellow : styles.barRed
  const pctClass = pct < 60 ? styles.pctGreen : pct < 85 ? styles.pctYellow : styles.pctRed

  function openPw() {
    setPwInput('')
    setPwError(null)
    setPwOpen(true)
  }

  function closePw() {
    setPwOpen(false)
    setPwInput('')
    setPwError(null)
  }

  function confirmPw() {
    if (pwInput === import.meta.env.VITE_SUMMARY_PASSWORD) {
      closePw()
      setInputVal(String(spent))
      setEditing(true)
    } else {
      setPwError('Incorrect password.')
    }
  }

  async function confirmEdit() {
    const val = Math.max(0, parseFloat(inputVal) || 0)
    setSaving(true)
    try {
      await saveSpent(val)
      setSpent(val)
      setEditing(false)
    } catch {
      // silently keep editing open on failure
    } finally {
      setSaving(false)
    }
  }

  function handleEditKey(e) {
    if (e.key === 'Enter') confirmEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={styles.titleRow}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className={styles.title}>Campaign Budget</span>
          </div>

          <div className={styles.amountRow}>
            {editing ? (
              <div className={styles.editGroup}>
                <span className={styles.editCurrency}>AED</span>
                <input
                  ref={editInputRef}
                  type="number"
                  min="0"
                  className={styles.editInput}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleEditKey}
                  disabled={saving}
                />
                <button className={styles.saveBtn} onClick={confirmEdit} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button className={styles.discardBtn} onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className={styles.spentGroup}>
                <span className={styles.spentValue}>AED {fmt(spent)}</span>
                <span className={styles.spentLabel}>spent</span>
                {isExecutive && (
                  <button className={styles.editBtn} onClick={openPw} title="Edit spent amount">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>
            )}
            <span className={styles.totalValue}>of AED {fmt(TOTAL_BUDGET)}</span>
          </div>
        </div>

        <div className={styles.track}>
          <div className={`${styles.fill} ${barClass}`} style={{ width: `${pct}%` }} />
        </div>

        <div className={styles.footer}>
          <span className={styles.remaining}>
            <span className={styles.remainingDot} />
            AED {fmt(remaining)} remaining
          </span>
          <span className={`${styles.pct} ${pctClass}`}>
            {pct.toFixed(1)}% used
          </span>
        </div>
      </div>

      {pwOpen && (
        <div
          className={styles.pwOverlay}
          onClick={(e) => e.target === e.currentTarget && closePw()}
        >
          <div className={styles.pwDialog} role="dialog" aria-modal="true">
            <div className={styles.pwIconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className={styles.pwTitle}>Enter Password</h3>
            <p className={styles.pwSubtitle}>Confirm your password to edit the campaign budget.</p>
            <input
              ref={pwInputRef}
              type="password"
              className={styles.pwInput}
              placeholder="Password"
              value={pwInput}
              onChange={(e) => { setPwInput(e.target.value); setPwError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && confirmPw()}
              autoComplete="off"
            />
            {pwError && <p className={styles.pwError}>{pwError}</p>}
            <div className={styles.pwActions}>
              <button className={styles.pwCancelBtn} onClick={closePw}>Cancel</button>
              <button className={styles.pwConfirmBtn} onClick={confirmPw}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
