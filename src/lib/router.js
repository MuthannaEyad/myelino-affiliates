import { useEffect, useState } from 'react'

// Hash-based routing (#/crm, #/affiliates) so deep links work on GitHub Pages,
// which has no server-side fallback to index.html.

function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/'
}

export function useHashPath() {
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    function onChange() {
      setPath(currentPath())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export function navigate(path) {
  window.location.hash = path
}
