import React from 'react'
import styles from './TypeFilter.module.css'

const TAGS = [
  { value: 'all',     label: 'All' },
  { value: 'social',  label: 'Social Media' },
  { value: 'myelino', label: 'Myelino' },
  { value: 'today',   label: 'Today' },
]

export default function TypeFilter({ value, onChange }) {
  return (
    <div className={styles.bar}>
      {TAGS.map((tag) => (
        <button
          key={tag.value}
          className={`${styles.tag} ${value === tag.value ? styles.active : ''}`}
          onClick={() => onChange(tag.value)}
        >
          {tag.label}
        </button>
      ))}
    </div>
  )
}
