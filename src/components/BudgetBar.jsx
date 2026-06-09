import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import styles from './BudgetBar.module.css'

const TOTAL_BUDGET = 30000

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
  const inputRef = useRef(null)

  useEffect(() => {
    fetchSpent().then(setSpent).catch(() => {})
  }, [])

  useEffect(() => {
    if (editing) setTimeout(() => inputRef.current?.focus(), 30)
  }, [editing])

  const pct = Math.min((spent / TOTAL_BUDGET) * 100, 100)
  const remaining = Math.max(TOTAL_BUDGET - spent, 0)
  const barClass = pct < 60 ? styles.barGreen : pct < 85 ? styles.barYellow : styles.barRed
  const pctClass = pct < 60 ? styles.pctGreen : pct < 85 ? styles.pctYellow : styles.pctRed

  function startEdit() {
    setInputVal(String(spent))
    setEditing(true)
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

  function handleKey(e) {
    if (e.key === 'Enter') confirmEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.titleRow}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span className={styles.title}>Monthly Budget</span>
        </div>

        <div className={styles.amountRow}>
          {editing ? (
            <div className={styles.editGroup}>
              <span className={styles.editCurrency}>AED</span>
              <input
                ref={inputRef}
                type="number"
                min="0"
                className={styles.editInput}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKey}
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
                <button className={styles.editBtn} onClick={startEdit} title="Edit spent amount">
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
  )
}
