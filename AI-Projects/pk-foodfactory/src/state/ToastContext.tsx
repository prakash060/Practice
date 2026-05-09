import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  message: string
  kind: ToastKind
}

type ToastContextValue = {
  toast: (Toast & { phase: 'enter' | 'exit' }) | null
  showToast: (message: string, kind?: ToastKind) => void
  hideToast: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(Toast & { phase: 'enter' | 'exit' }) | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const exitTimerRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current)
      exitTimerRef.current = null
    }
  }, [])

  const hideToast = useCallback(() => {
    clearTimers()
    setToast((t) => (t ? { ...t, phase: 'exit' } : null))
    exitTimerRef.current = window.setTimeout(() => {
      setToast(null)
      exitTimerRef.current = null
    }, 650)
  }, [clearTimers])

  const showToast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      clearTimers()
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
      setToast({ id, message, kind, phase: 'enter' })
      hideTimerRef.current = window.setTimeout(() => {
        setToast((t) => (t ? { ...t, phase: 'exit' } : null))
        hideTimerRef.current = null
        exitTimerRef.current = window.setTimeout(() => {
          setToast(null)
          exitTimerRef.current = null
        }, 650)
      }, 3000)
    },
    [clearTimers]
  )

  const value = useMemo(() => ({ toast, showToast, hideToast }), [toast, showToast, hideToast])
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

