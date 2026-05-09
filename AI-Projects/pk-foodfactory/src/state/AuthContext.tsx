import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, type UserPublic } from '../services/api'
import { getStoredToken, setStoredToken, setUnauthorizedHandler } from '../lib/authSession'

type RegisterBody = {
  name: string
  email: string
  password: string
  phone: string
  address: string
}

type AuthContextValue = {
  user: UserPublic | null
  token: string | null
  isReady: boolean
  login: (email: string, password: string) => Promise<void>
  register: (body: RegisterBody) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (body: { name: string; phone: string; address: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserPublic | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setStoredToken(null)
      setToken(null)
      setUser(null)
      navigate('/login', { replace: true })
    })
    return () => setUnauthorizedHandler(() => {})
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      const t = getStoredToken()
      if (!t) {
        setToken(null)
        if (!cancelled) setIsReady(true)
        return
      }
      try {
        const me = await authAPI.getMe()
        if (!cancelled) {
          setUser(me)
          setToken(t)
        }
      } catch {
        if (!cancelled) {
          setStoredToken(null)
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setIsReady(true)
      }
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login({ email, password })
    setStoredToken(res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (body: RegisterBody) => {
    const res = await authAPI.register(body)
    const { token: newToken, ...userPublic } = res
    setStoredToken(newToken)
    setToken(newToken)
    setUser(userPublic)
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const refreshUser = useCallback(async () => {
    const me = await authAPI.getMe()
    setUser(me)
  }, [])

  const updateProfile = useCallback(async (body: { name: string; phone: string; address: string }) => {
    const updated = await authAPI.updateMe(body)
    setUser(updated)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
    }),
    [user, token, isReady, login, register, logout, refreshUser, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
