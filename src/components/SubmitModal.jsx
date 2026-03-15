import React, { useState, useEffect, useRef } from 'react'
import styles from './SubmitModal.module.css'

const EMPTY_FORM = { fullName: '', phone: '', instagram: '', videoLink: '' }

export default function SubmitModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const firstInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM)
      setErrors({})
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  function validate() {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    if (!form.instagram.trim()) errs.instagram = 'Instagram handle is required'
    if (!form.videoLink.trim()) errs.videoLink = 'Video link is required'
    return errs
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.title}>Submit a Video</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Field
            ref={firstInputRef}
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="Jane Doe"
            value={form.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
          <Field
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <Field
            label="Instagram Handle"
            name="instagram"
            type="text"
            placeholder="@yourhandle"
            value={form.instagram}
            onChange={handleChange}
            error={errors.instagram}
            hint="Include the @ symbol"
          />
          <Field
            label="Video Link"
            name="videoLink"
            type="url"
            placeholder="https://drive.google.com/... or YouTube link"
            value={form.videoLink}
            onChange={handleChange}
            error={errors.videoLink}
            hint="Google Drive, YouTube, or any public link"
          />

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Submit Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Field = React.forwardRef(function Field(
  { label, name, type, placeholder, value, onChange, error, hint },
  ref
) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>
        {label}
      </label>
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        autoComplete="off"
      />
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
})
