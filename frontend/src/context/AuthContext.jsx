import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'assetflow_auth'

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth)

  const persistAuth = useCallback((nextAuth) => {
    if (nextAuth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setAuth(nextAuth)
  }, [])

  const loginAdmin = useCallback(
    async (email, password) => {
      const data = await api.adminLogin(email, password)
      persistAuth(data)
      return data.user
    },
    [persistAuth],
  )

  const registerEmployee = useCallback(
    async (email, password) => {
      const data = await api.employeeRegister(email, password)
      persistAuth(data)
      return data.user
    },
    [persistAuth],
  )

  const loginEmployee = useCallback(
    async (email, password) => {
      const data = await api.employeeLogin(email, password)
      persistAuth(data)
      return data.user
    },
    [persistAuth],
  )

  const completeProfile = useCallback(
    async (profile) => {
      const user = await api.completeProfile(auth.access_token, profile)
      persistAuth({ ...auth, user })
      return user
    },
    [auth, persistAuth],
  )

  const logout = useCallback(() => {
    persistAuth(null)
  }, [persistAuth])

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      token: auth?.access_token ?? null,
      isAuthenticated: Boolean(auth?.access_token),
      loginAdmin,
      registerEmployee,
      loginEmployee,
      completeProfile,
      logout,
    }),
    [
      auth,
      loginAdmin,
      registerEmployee,
      loginEmployee,
      completeProfile,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
