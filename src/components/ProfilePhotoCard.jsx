import React, { useState, useRef } from 'react'
import { getMemberPhoto, saveMemberPhoto } from '../utils/memberPhotos'
import { resizeImage } from '../utils/imageUtils'
import styles from './ProfilePhotoCard.module.css'

export default function ProfilePhotoCard({ member }) {
  const [photo, setPhoto] = useState(() => getMemberPhoto(member.id))
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  async function applyFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const dataUrl = await resizeImage(file, 300)
    saveMemberPhoto(member.id, dataUrl)
    setPhoto(dataUrl)
  }

  async function handleFileChange(e) {
    await applyFile(e.target.files?.[0])
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    applyFile(e.dataTransfer.files?.[0])
  }

  function handleRemove() {
    saveMemberPhoto(member.id, null)
    setPhoto(null)
  }

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload profile photo"
        >
          {photo ? (
            <>
              <img src={photo} alt={member.fullName} className={styles.photo} />
              <div className={styles.photoOverlay}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Change</span>
              </div>
            </>
          ) : (
            <div className={styles.emptyZone}>
              <div className={styles.initials}>{member.fullName.charAt(0).toUpperCase()}</div>
              <div className={styles.uploadHint}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Add photo</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <p className={styles.name}>{member.fullName}</p>
        <p className={styles.desc}>
          Your profile photo appears on the org chart next to your name.
          {!photo && ' Upload one so your team can recognize you!'}
        </p>
        <div className={styles.actions}>
          <button className={styles.uploadBtn} onClick={() => inputRef.current?.click()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {photo ? 'Change photo' : 'Upload photo'}
          </button>
          {photo && (
            <button className={styles.removeBtn} onClick={handleRemove}>
              Remove
            </button>
          )}
        </div>
        <p className={styles.hint}>Drag & drop or click to upload · JPG, PNG, WEBP</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
