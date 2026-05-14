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
import { agentAuthAPI, type DeliveryAgentDoc } from '../services/api'
import {
  getStoredAgentToken,
  setAgentUnauthorizedHandler,
  setStoredAgentToken,
} from '../lib/agentSession'

type DeliveryAuthContextValue = {
  agent: DeliveryAgentDoc | null
  token: string | null
  isReady: boolean
  login: (phone: string, passcode: string) => Promise<DeliveryAgentDoc>
  logout: () => void
  refresh: () => Promise<void>
}

const DeliveryAuthContext = createContext<DeliveryAuthContextValue | null>(null)

export function DeliveryAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [agent, setAgent] = useState<DeliveryAgentDoc | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredAgentToken())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setAgentUnauthorizedHandler(() => {
      setStoredAgentToken(null)
      setToken(null)
      setAgent(null)
      navigate('/delivery/login', { replace: true })
    })
    return () => setAgentUnauthorizedHandler(() => {})
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      const t = getStoredAgentToken()
      if (!t) {
        if (!cancelled) {
          setToken(null)
          setIsReady(true)
        }
        return
      }
      try {
        const me = await agentAuthAPI.me()
        if (!cancelled) {
          setAgent(me)
          setToken(t)
        }
      } catch {
        if (!cancelled) {
          setStoredAgentToken(null)
          setToken(null)
          setAgent(null)
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

  const login = useCallback(async (phone: string, passcode: string) => {
    const res = await agentAuthAPI.login({ phone, passcode })
    setStoredAgentToken(res.token)
    setToken(res.token)
    setAgent(res.agent)
    return res.agent
  }, [])

  const logout = useCallback(() => {
    setStoredAgentToken(null)
    setToken(null)
    setAgent(null)
    navigate('/delivery/login', { replace: true })
  }, [navigate])

  const refresh = useCallback(async () => {
    const me = await agentAuthAPI.me()
    setAgent(me)
  }, [])

  const value = useMemo(
    () => ({ agent, token, isReady, login, logout, refresh }),
    [agent, token, isReady, login, logout, refresh]
  )

  return <DeliveryAuthContext.Provider value={value}>{children}</DeliveryAuthContext.Provider>
}

export function useDeliveryAuth(): DeliveryAuthContextValue {
  const ctx = useContext(DeliveryAuthContext)
  if (!ctx) throw new Error('useDeliveryAuth must be used within DeliveryAuthProvider')
  return ctx
}
