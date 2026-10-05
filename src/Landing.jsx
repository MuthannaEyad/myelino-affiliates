import React from 'react'
import styles from './Landing.module.css'

const DESTINATIONS = [
  {
    href: '#/crm',
    title: 'Sales CRM',
    text: 'Leads, meetings, sign-ups and every rep’s next steps.',
    tone: styles.sales,
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </>
    ),
  },
  {
    href: '#/affiliates',
    title: 'Affiliates',
    text: 'Daily posting, downloads, budget and top creators.',
    tone: styles.affiliates,
    icon: (
      <>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </>
    ),
  },
]

export default function Landing() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <img src="logo.png" alt="Myelino" className={styles.logo} />
        <h1 className={styles.title}>Myelino team dashboard</h1>
        <p className={styles.subtitle}>Where are you headed?</p>

        <div className={styles.choices}>
          {DESTINATIONS.map((d) => (
            <a key={d.href} href={d.href} className={`${styles.choice} ${d.tone}`}>
              <span className={styles.icon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {d.icon}
                </svg>
              </span>
              <span className={styles.choiceTitle}>{d.title}</span>
              <span className={styles.choiceText}>{d.text}</span>
              <span className={styles.arrow} aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
