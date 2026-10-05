import React from 'react'
import { STAGES, getAction, dueInfo, initials } from '../constants'
import styles from './Pills.module.css'

export function ActionPill({ actionKey }) {
  const action = getAction(actionKey)
  if (!action) return null
  return <span className={`${styles.action} ${styles[action.tone]}`}>{action.label}</span>
}

export function DueLabel({ date }) {
  const info = dueInfo(date)
  if (!info) return null
  return <span className={`${styles.due} ${styles[info.state]}`}>{info.label}</span>
}

export function Avatar({ name, size = 40 }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name) || '?'}
    </span>
  )
}

// Counts per stage; when onSelect is given each stage becomes a button
export function StageSummary({ leads, onSelect, compact = false }) {
  return (
    <div className={`${styles.summary} ${compact ? styles.summaryCompact : ''}`}>
      {STAGES.map((stage) => {
        const count = leads.filter((l) => l.stage === stage.key).length
        const content = (
          <>
            <span className={`${styles.stageDot} ${styles[`stage_${stage.key}`]}`} />
            <span className={styles.stageCount}>{count}</span>
            <span className={styles.stageLabel}>{stage.label}</span>
          </>
        )
        return onSelect ? (
          <button key={stage.key} className={styles.stage} onClick={() => onSelect(stage.key)}>
            {content}
          </button>
        ) : (
          <div key={stage.key} className={styles.stage}>{content}</div>
        )
      })}
    </div>
  )
}
