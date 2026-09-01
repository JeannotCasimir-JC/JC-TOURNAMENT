import { createContext, useContext, useEffect, useState } from 'react'
import { watchAuthState, listenUserDoc, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const unsub = watchAuthState((user) => {
      setAuthUser(user)
      setAuthLoading(false)
      if (!user) {
        setProfile(null)
        setProfileLoading(false)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!authUser) return
    setProfileLoading(true)
    const unsub = listenUserDoc(authUser.uid, (doc) => {
      setProfile(doc)
      setProfileLoading(false)
    })
    return unsub
  }, [authUser])

  const value = {
    user: authUser,
    profile,
    isAdmin: profile?.role === 'admin',
    loading: authLoading || (Boolean(authUser) && profileLoading),
    isBackendConfigured: isSupabaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
