import { Navigate, useLocation } from 'react-router-dom'
import { defaultLandingPath, useAuth } from '../state/AuthContext'
import type { ReactNode } from 'react'

function AuthLoading() {
  return (
    <div className="auth-loading">
      <p>Loading…</p>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) return <AuthLoading />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth()

  if (!isReady) return <AuthLoading />
  if (user) return <Navigate to={defaultLandingPath(user)} replace />
  return <>{children}</>
}

export function AuthCatchAll() {
  const { user, isReady } = useAuth()

  if (!isReady) return <AuthLoading />
  if (user) return <Navigate to={defaultLandingPath(user)} replace />
  return <Navigate to="/login" replace />
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) return <AuthLoading />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!user.isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
