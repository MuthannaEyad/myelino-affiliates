import React, { useState, useEffect, useRef } from 'react'
import { useManagers } from '../hooks/useManagers'
import { getMemberPhoto } from '../utils/memberPhotos'
import { resizeImage } from '../utils/imageUtils'
import styles from './OrgChart.module.css'

const EMPTY_MEMBER = { fullName: '', instagram: '', tiktok: '', phone: '', managerId: '' }

function Avatar({ photo, name, size = 40 }) {
  const fontSize = size <= 28 ? '0.7rem' : size <= 36 ? '0.85rem' : '1rem'
  if (photo) {
    return <img src={photo} alt={name} className={styles.avatarImg} style={{ width: size, height: size }} />
  }
  return (
    <div className={styles.avatarInitial} style={{ width: size, height: size, fontSize }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function OrgChart({ members, loading, onSelect, onExecClick, addMember, assignMember }) {
  const { managers, addManager, removeManager, updateManagerPhoto } = useManagers()

  // Remove manager password prompt state
  const [removePending, setRemovePending] = useState(null) // manager object
  const [removePw, setRemovePw] = useState('')
  const [removePwError, setRemovePwError] = useState(null)
  const removePwRef = useRef(null)

  // Add Manager modal state
  const [addMgrOpen, setAddMgrOpen] = useState(false)
  const [mgrForm, setMgrForm] = useState({ name: '', title: '' })
  const [mgrErrors, setMgrErrors] = useState({})
  const [mgrPhoto, setMgrPhoto] = useState(null)
  const mgrNameRef = useRef(null)
  const mgrPhotoInputRef = useRef(null)
  const managerPhotoInputRefs = useRef({})

  // Add Member modal state
  const [addMemOpen, setAddMemOpen] = useState(false)
  const [memForm, setMemForm] = useState(EMPTY_MEMBER)
  const [memErrors, setMemErrors] = useState({})
  const [memAdding, setMemAdding] = useState(false)
  const memNameRef = useRef(null)

  // Assign dropdown
  const [assigningTo, setAssigningTo] = useState(null)
  const assignDropdownRef = useRef(null)

  // Group members by manager
  const membersByManager = {}
  managers.forEach((mg) => { membersByManager[mg.id] = [] })
  members.forEach((m) => {
    if (m.managerId && membersByManager[m.managerId]) membersByManager[m.managerId].push(m)
  })
  const unassigned = members.filter((m) => !m.managerId)

  // Focus helpers
  useEffect(() => { if (addMgrOpen) setTimeout(() => mgrNameRef.current?.focus(), 50) }, [addMgrOpen])
  useEffect(() => { if (addMemOpen) setTimeout(() => memNameRef.current?.focus(), 50) }, [addMemOpen])
  useEffect(() => { if (removePending) setTimeout(() => removePwRef.current?.focus(), 50) }, [removePending])

  // Close assign dropdown on outside click
  useEffect(() => {
    if (!assigningTo) return
    function onClick(e) { if (!assignDropdownRef.current?.contains(e.target)) setAssigningTo(null) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [assigningTo])

  // Escape closes whichever modal is open
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (removePending) closeRemovePrompt()
      else if (addMgrOpen) closeMgrModal()
      else if (addMemOpen) closeMemModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [addMgrOpen, addMemOpen, removePending])

  // ── Remove manager password prompt ──
  function openRemovePrompt(manager) { setRemovePending(manager); setRemovePw(''); setRemovePwError(null) }
  function closeRemovePrompt() { setRemovePending(null); setRemovePw(''); setRemovePwError(null) }
  function confirmRemove() {
    if (removePw === import.meta.env.VITE_SUMMARY_PASSWORD) {
      removeManager(removePending.id)
      closeRemovePrompt()
    } else {
      setRemovePwError('Incorrect password.')
    }
  }

  // ── Manager modal handlers ──
  function closeMgrModal() { setAddMgrOpen(false); setMgrForm({ name: '', title: '' }); setMgrErrors({}); setMgrPhoto(null) }

  function handleMgrChange(e) {
    const { name, value } = e.target
    setMgrForm((p) => ({ ...p, [name]: value }))
    if (mgrErrors[name]) setMgrErrors((p) => ({ ...p, [name]: undefined }))
  }

  async function handleMgrPhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMgrPhoto(await resizeImage(file))
    e.target.value = ''
  }

  async function handleMgrSubmit(e) {
    e.preventDefault()
    if (!mgrForm.name.trim()) { setMgrErrors({ name: 'Required' }); return }
    await addManager(mgrForm.name.trim(), mgrForm.title.trim(), mgrPhoto)
    closeMgrModal()
  }

  async function handleManagerPhotoChange(managerId, e) {
    const file = e.target.files?.[0]
    if (!file) return
    updateManagerPhoto(managerId, await resizeImage(file))
    e.target.value = ''
  }

  // ── Member modal handlers ──
  function closeMemModal() { setAddMemOpen(false); setMemForm(EMPTY_MEMBER); setMemErrors({}) }

  function handleMemChange(e) {
    const { name, value } = e.target
    setMemForm((p) => ({ ...p, [name]: value }))
    if (memErrors[name]) setMemErrors((p) => ({ ...p, [name]: undefined }))
  }

  async function handleMemSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!memForm.fullName.trim()) errs.fullName = 'Required'
    if (!memForm.instagram.trim()) errs.instagram = 'Required'
    if (!memForm.phone.trim()) errs.phone = 'Required'
    if (Object.keys(errs).length) { setMemErrors(errs); return }

    setMemAdding(true)
    const result = await addMember({ ...memForm, managerId: memForm.managerId || null })
    setMemAdding(false)
    if (result) {
      onSelect(result)
      closeMemModal()
    }
  }

  return (
    <div className={styles.wrap}>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Team Org Chart</h1>
          <p className={styles.pageSubtitle}>Select your name to view and update your daily tracking.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addMemberBtn} onClick={() => setAddMemOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Add Member
          </button>
          <button className={styles.addManagerBtn} onClick={() => setAddMgrOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Manager
          </button>
          <button className={styles.execBtn} onClick={onExecClick}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Executive View
          </button>
        </div>
      </div>

      {/* Manager cards */}
      {managers.length === 0 ? (
        <div className={styles.emptyManagers}>
          <div className={styles.emptyIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>No managers yet</p>
          <p className={styles.emptySubtitle}>Click "Add Manager" to build your org chart.</p>
        </div>
      ) : (
        <div className={styles.managerGrid}>
          {managers.map((manager) => {
            const managerMembers = membersByManager[manager.id] || []
            const unassignedForDropdown = members.filter((m) => !m.managerId)

            return (
              <div key={manager.id} className={styles.managerCard}>
                <div className={styles.managerHeader}>
                  <button
                    className={styles.managerAvatarBtn}
                    onClick={() => managerPhotoInputRefs.current[manager.id]?.click()}
                    title="Change photo"
                  >
                    <Avatar photo={manager.photo} name={manager.name} size={44} />
                    <span className={styles.cameraOverlay}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </span>
                    <input
                      ref={(el) => { managerPhotoInputRefs.current[manager.id] = el }}
                      type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => handleManagerPhotoChange(manager.id, e)}
                    />
                  </button>

                  <div className={styles.managerInfo}>
                    <span className={styles.managerName}>{manager.name}</span>
                    {manager.title && <span className={styles.managerTitle}>{manager.title}</span>}
                  </div>

                  <button className={styles.removeManagerBtn} onClick={() => openRemovePrompt(manager)} title="Remove manager">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.memberList}>
                  {managerMembers.length === 0 ? (
                    <p className={styles.noMembers}>No affiliates assigned yet</p>
                  ) : (
                    <ul className={styles.memberUl}>
                      {managerMembers.map((m) => (
                        <li key={m.id} className={styles.memberItem}>
                          <button className={styles.memberBtn} onClick={() => onSelect(m)}>
                            <Avatar photo={getMemberPhoto(m.id)} name={m.fullName} size={28} />
                            <span className={styles.memberName}>{m.fullName}</span>
                            <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                          <button className={styles.unassignBtn} onClick={() => assignMember(m.id, null)} title="Remove from manager">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {unassignedForDropdown.length > 0 && (
                  <div className={styles.assignWrap}>
                    <button
                      className={styles.assignBtn}
                      onClick={() => setAssigningTo(assigningTo === manager.id ? null : manager.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Assign affiliate
                    </button>

                    {assigningTo === manager.id && (
                      <ul className={styles.assignDropdown} ref={assignDropdownRef}>
                        {unassignedForDropdown.map((m) => (
                          <li key={m.id}>
                            <button
                              className={styles.assignOption}
                              onClick={() => { assignMember(m.id, manager.id); setAssigningTo(null) }}
                            >
                              <Avatar photo={getMemberPhoto(m.id)} name={m.fullName} size={24} />
                              {m.fullName}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Unassigned members */}
      {!loading && unassigned.length > 0 && managers.length > 0 && (
        <div className={styles.unassignedSection}>
          <p className={styles.sectionLabel}>
            Unassigned affiliates
            <span className={styles.sectionCount}>{unassigned.length}</span>
          </p>
          <ul className={styles.unassignedList}>
            {unassigned.map((m) => (
              <li key={m.id}>
                <button className={styles.memberBtn} onClick={() => onSelect(m)}>
                  <Avatar photo={getMemberPhoto(m.id)} name={m.fullName} size={28} />
                  <span className={styles.memberName}>{m.fullName}</span>
                  <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fallback: no managers yet, show all members */}
      {!loading && managers.length === 0 && members.length > 0 && (
        <div className={styles.unassignedSection}>
          <p className={styles.sectionLabel}>All affiliates</p>
          <ul className={styles.unassignedList}>
            {members.map((m) => (
              <li key={m.id}>
                <button className={styles.memberBtn} onClick={() => onSelect(m)}>
                  <Avatar photo={getMemberPhoto(m.id)} name={m.fullName} size={28} />
                  <span className={styles.memberName}>{m.fullName}</span>
                  <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && <div className={styles.loadingMsg}>Loading affiliates…</div>}

      {/* ── Add Member modal ── */}
      {addMemOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeMemModal()}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="add-mem-title">
            <h3 id="add-mem-title" className={styles.dialogTitle}>Add Member</h3>

            <form onSubmit={handleMemSubmit} noValidate>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="mem-name">Full Name</label>
                  <input
                    ref={memNameRef}
                    id="mem-name" name="fullName" type="text"
                    className={`${styles.input} ${memErrors.fullName ? styles.inputError : ''}`}
                    placeholder="Jane Doe"
                    value={memForm.fullName} onChange={handleMemChange} autoComplete="off"
                  />
                  {memErrors.fullName && <span className={styles.fieldError}>{memErrors.fullName}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="mem-instagram">Instagram Handle</label>
                  <input
                    id="mem-instagram" name="instagram" type="text"
                    className={`${styles.input} ${memErrors.instagram ? styles.inputError : ''}`}
                    placeholder="@handle"
                    value={memForm.instagram} onChange={handleMemChange} autoComplete="off"
                  />
                  {memErrors.instagram && <span className={styles.fieldError}>{memErrors.instagram}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="mem-tiktok">
                    TikTok <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    id="mem-tiktok" name="tiktok" type="text"
                    className={styles.input} placeholder="@tiktok"
                    value={memForm.tiktok} onChange={handleMemChange} autoComplete="off"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="mem-phone">Phone Number</label>
                  <input
                    id="mem-phone" name="phone" type="text"
                    className={`${styles.input} ${memErrors.phone ? styles.inputError : ''}`}
                    placeholder="+1 (555) 000-0000"
                    value={memForm.phone} onChange={handleMemChange} autoComplete="off"
                  />
                  {memErrors.phone && <span className={styles.fieldError}>{memErrors.phone}</span>}
                </div>
              </div>

              <div className={styles.field} style={{ marginTop: 4 }}>
                <label className={styles.label} htmlFor="mem-manager">
                  Manager <span className={styles.optional}>(optional)</span>
                </label>
                <select
                  id="mem-manager" name="managerId"
                  className={styles.select}
                  value={memForm.managerId} onChange={handleMemChange}
                >
                  <option value="">— No manager —</option>
                  {managers.map((mg) => (
                    <option key={mg.id} value={mg.id}>{mg.name}{mg.title ? ` · ${mg.title}` : ''}</option>
                  ))}
                </select>
              </div>

              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeMemModal}>Cancel</button>
                <button type="submit" className={styles.confirmBtn} disabled={memAdding}>
                  {memAdding ? 'Saving…' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Remove Manager password prompt ── */}
      {removePending && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeRemovePrompt()}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="remove-mgr-title" style={{ maxWidth: 360 }}>
            <div className={styles.removeMgrIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 id="remove-mgr-title" className={styles.dialogTitle}>Remove Manager?</h3>
            <p className={styles.removeMgrSubtitle}>
              Enter the executive password to remove <strong>{removePending.name}</strong> and unassign all their affiliates.
            </p>
            <input
              ref={removePwRef}
              type="password"
              className={styles.removePwInput}
              placeholder="Password"
              value={removePw}
              onChange={(e) => { setRemovePw(e.target.value); setRemovePwError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && confirmRemove()}
              autoComplete="off"
            />
            {removePwError && <p className={styles.removePwError}>{removePwError}</p>}
            <div className={styles.dialogActions}>
              <button className={styles.cancelBtn} onClick={closeRemovePrompt}>Cancel</button>
              <button className={styles.removeConfirmBtn} onClick={confirmRemove}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Manager modal ── */}
      {addMgrOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeMgrModal()}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="add-mgr-title">
            <h3 id="add-mgr-title" className={styles.dialogTitle}>Add Manager</h3>

            <div className={styles.photoPickerWrap}>
              <button type="button" className={styles.photoPickerBtn} onClick={() => mgrPhotoInputRef.current?.click()}>
                {mgrPhoto ? (
                  <img src={mgrPhoto} alt="Preview" className={styles.photoPreview} />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                )}
                <span className={styles.photoPickerLabel}>{mgrPhoto ? 'Change photo' : 'Add photo'}</span>
              </button>
              <input ref={mgrPhotoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMgrPhotoChange} />
            </div>

            <form onSubmit={handleMgrSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="mgr-name">Full Name</label>
                <input
                  ref={mgrNameRef}
                  id="mgr-name" name="name" type="text"
                  className={`${styles.input} ${mgrErrors.name ? styles.inputError : ''}`}
                  placeholder="Jane Doe"
                  value={mgrForm.name} onChange={handleMgrChange} autoComplete="off"
                />
                {mgrErrors.name && <span className={styles.fieldError}>{mgrErrors.name}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="mgr-title">
                  Title <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="mgr-title" name="title" type="text"
                  className={styles.input} placeholder="e.g. Regional Lead"
                  value={mgrForm.title} onChange={handleMgrChange} autoComplete="off"
                />
              </div>

              <div className={styles.dialogActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeMgrModal}>Cancel</button>
                <button type="submit" className={styles.confirmBtn}>Add Manager</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
