import { useToast } from '../state/ToastContext'

export function ToastHost() {
  const { toast, hideToast } = useToast()
  if (!toast) return null

  return (
    <div className="toast-host" role="status" aria-live="polite" aria-atomic="true">
      <div className={`toast toast--${toast.kind} toast--${toast.phase}`} key={toast.id}>
        <p className="toast__message">{toast.message}</p>
        <button type="button" className="toast__close" onClick={hideToast} aria-label="Dismiss">
          ×
        </button>
      </div>
    </div>
  )
}

