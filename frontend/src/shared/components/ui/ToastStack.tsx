import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { dismissToast } from '../../store/ui.store'

function ToastStack() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector((state) => state.ui.toasts)

  useEffect(() => {
    if (toasts.length === 0) {
      return
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dispatch(dismissToast(toast.id))
      }, 5000),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [dispatch, toasts])

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.variant} toast-auto-dismiss`}>
          <div className="toast-body">
            <div className="toast-title-row">
              <span className={`toast-indicator toast-indicator-${toast.variant}`} aria-hidden="true" />
              <h4>{toast.title}</h4>
            </div>
            {toast.description ? <p>{toast.description}</p> : null}
          </div>
          <button
            type="button"
            className="icon-btn toast-close-btn"
            onClick={() => dispatch(dismissToast(toast.id))}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
