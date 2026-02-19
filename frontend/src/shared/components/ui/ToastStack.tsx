import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { dismissToast } from '../../store/ui.store'

function ToastStack() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector((state) => state.ui.toasts)

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.variant}`}>
          <div>
            <h4>{toast.title}</h4>
            {toast.description ? <p>{toast.description}</p> : null}
          </div>
          <button
            type="button"
            className="icon-btn"
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
