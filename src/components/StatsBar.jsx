import React from 'react'
import styles from './StatsBar.module.css'

export default function StatsBar({ members, tracking }) {
  const total = members.length
  const onMyelino = Object.values(tracking).filter((t) => t.posted_on_myelino).length
  const onInstagram = Object.values(tracking).filter((t) => t.posted_on_instagram).length
  const onTiktok = Object.values(tracking).filter((t) => t.posted_on_tiktok).length

  const stats = [
    { label: 'Members', value: total, className: styles.total },
    { label: 'On Myelino', value: onMyelino, className: styles.myelino },
    { label: 'On Instagram', value: onInstagram, className: styles.instagram },
    { label: 'On TikTok', value: onTiktok, className: styles.tiktok },
  ]

  return (
    <div className={styles.bar}>
      {stats.map(({ label, value, className }) => (
        <div key={label} className={`${styles.stat} ${className}`}>
          <span className={styles.value}>{value}</span>
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  )
}
