const key = (id) => `myelino_photo_${id}`

export function getMemberPhoto(memberId) {
  return localStorage.getItem(key(memberId)) || null
}

export function saveMemberPhoto(memberId, dataUrl) {
  if (dataUrl) localStorage.setItem(key(memberId), dataUrl)
  else localStorage.removeItem(key(memberId))
}
