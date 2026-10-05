import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './ContactInfo.module.css'

const CLOSE_DELAY_MS = 150
const POPOVER_WIDTH = 280

// ⓘ button that shows the contact-stage details for a lead. Opens on hover,
// focus or tap. Rendered in a portal so the table's horizontal scroll
// container doesn't clip it.
export default function ContactInfo({ lead }) {
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)
  const popoverRef = useRef(null)
  const closeTimer = useRef(null)
  const overPopover = useRef(false)

  function open() {
    clearTimeout(closeTimer.current)
    const rect = btnRef.current.getBoundingClientRect()
    const left = Math.min(Math.max(8, rect.left - 12), window.innerWidth - POPOVER_WIDTH - 8)
    setPos({ top: rect.bottom + 8, left })
  }

  function scheduleClose() {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setPos(null), CLOSE_DELAY_MS)
  }

  useEffect(() => {
    if (!pos) return
    const close = () => { overPopover.current = false; setPos(null) }
    function onScroll(e) {
      if (!popoverRef.current?.contains(e.target)) close()
    }
    function onKey(e) {
      if (e.key === 'Escape') close()
    }
    function onPointerDown(e) {
      if (!btnRef.current?.contains(e.target) && !popoverRef.current?.contains(e.target)) close()
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [pos])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const rows = [
    { label: 'Spoke to', value: lead.contactName },
    { label: 'Phone', value: lead.phone, href: lead.phone && `tel:${lead.phone.replace(/\s+/g, '')}` },
    { label: 'Email', value: lead.email, href: lead.email && `mailto:${lead.email}` },
    { label: 'Instagram', value: lead.instagram && `@${lead.instagram}`, href: lead.instagram && `https://instagram.com/${lead.instagram}` },
  ].filter((r) => r.value)

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.infoBtn} ${pos ? styles.infoBtnActive : ''}`}
        aria-label="Contact details"
        aria-expanded={!!pos}
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onFocus={open}
        onBlur={() => !overPopover.current && scheduleClose()}
        onClick={open}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="11" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>

      {pos && createPortal(
        <div
          ref={popoverRef}
          className={styles.popover}
          style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
          role="tooltip"
          onMouseEnter={() => { overPopover.current = true; clearTimeout(closeTimer.current) }}
          onMouseLeave={() => { overPopover.current = false; scheduleClose() }}
        >
          <p className={styles.heading}>Contact details</p>
          {rows.length === 0 && !lead.notes ? (
            <p className={styles.empty}>No contact details were added at the contact stage.</p>
          ) : (
            <dl className={styles.list}>
              {rows.map((r) => (
                <React.Fragment key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>
                    {r.href ? (
                      <a href={r.href} target={r.label === 'Instagram' ? '_blank' : undefined} rel="noreferrer">{r.value}</a>
                    ) : r.value}
                  </dd>
                </React.Fragment>
              ))}
              {lead.notes && (
                <>
                  <dt>Notes</dt>
                  <dd className={styles.notes}>{lead.notes}</dd>
                </>
              )}
            </dl>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
