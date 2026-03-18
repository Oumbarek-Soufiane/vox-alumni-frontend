/**
 * context/UserContext.jsx
 *
 * Provides the current visitor's display name to the whole app.
 * Name is persisted in localStorage so it survives page refreshes.
 *
 * Usage:
 *   const { name, setName, clearName } = useUser();
 */

import { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'vox_visitor_name'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [name, setNameState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })

  const setName = useCallback((value) => {
    const trimmed = value.trim()
    setNameState(trimmed)
    try {
      if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed)
      else         localStorage.removeItem(STORAGE_KEY)
    } catch { /* storage blocked */ }
  }, [])

  const clearName = useCallback(() => setName(''), [setName])

  return (
    <UserContext.Provider value={{ name, setName, clearName }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>')
  return ctx
}
