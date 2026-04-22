import { NUMPAD_KEYS } from '../login.constants'

type LoginCredentialsPanelProps = {
  canSubmit: boolean
  isShaking: boolean
  isSubmitting: boolean
  isVerifying: boolean
  onNumpadPress: (key: (typeof NUMPAD_KEYS)[number]) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onUsernameChange: (value: string) => void
  pin: string
  roleName: string
  username: string
}

function LoginCredentialsPanel({
  canSubmit,
  isShaking,
  isSubmitting,
  isVerifying,
  onNumpadPress,
  onSubmit,
  onUsernameChange,
  pin,
  roleName,
  username,
}: LoginCredentialsPanelProps) {
  return (
    <main className="bg-cream px-14 py-12 flex items-center justify-center">
      <div className="w-full max-w-[520px] animate-[fadeIn_0.5s_0.1s_ease_both]">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted mb-3">
          Staff credentials
        </p>
        <h2 className="font-serif text-[40px] text-body mb-2">Sign in</h2>
        <p className="text-[16px] text-muted mb-8">
          Enter your username and PIN to access the system.
        </p>

        <div className="inline-flex items-center gap-2 bg-chip rounded-[2px] px-3 py-1.5 mb-8 font-mono text-[12px] uppercase tracking-[.08em] text-brand">
          <span className="w-[7px] h-[7px] rounded-full bg-brand" />
          <span>{roleName}</span>
        </div>

        <form onSubmit={onSubmit} className="grid">
          <label
            className="font-mono text-[10px] uppercase tracking-[.18em] text-muted mb-2"
            htmlFor="staff-username"
          >
            Username
          </label>
          <input
            id="staff-username"
            className="w-full border border-divider bg-paper rounded-[3px] font-mono text-[22px] text-body px-4 py-[14px] outline-none focus:border-brand mb-6 placeholder:text-[#C8BCA8]"
            placeholder="Enter username"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            autoComplete="username"
            required
            disabled={isSubmitting}
          />

          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted mb-2">PIN</p>
          <div className={`flex gap-3 mb-2 ${isShaking ? 'animate-[shake_0.4s_ease]' : ''}`}>
            {[0, 1, 2, 3].map((index) => {
              const filled = pin[index] !== undefined
              const active = index === pin.length && pin.length < 4
              return (
                <span
                  key={index}
                  className={`w-[56px] h-[58px] border rounded-[3px] grid place-items-center font-mono text-[28px] ${
                    filled ? 'border-brand text-body' : 'border-divider text-body'
                  } ${active ? 'border-brand bg-[#F0EBE0]' : 'bg-paper'}`}
                >
                  {filled ? '●' : ''}
                </span>
              )
            })}
          </div>
          <p className="font-mono text-[11px] text-[#BEB4A6] mb-6">
            Use the credential set by your admin
          </p>

          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {NUMPAD_KEYS.map((key) => {
              const isActionKey = key === 'Clear' || key === '⌫'
              return (
                <button
                  key={key}
                  type="button"
                  className={`border border-divider bg-paper rounded-[3px] py-4 text-center font-mono text-[26px] text-body hover:bg-[#F0EBE0] hover:border-[#A89880] active:scale-[.96] ${
                    isActionKey ? 'font-sans text-[18px] font-semibold text-muted' : ''
                  }`}
                  onClick={() => onNumpadPress(key)}
                  disabled={isSubmitting}
                >
                  {key}
                </button>
              )
            })}
          </div>

          <button
            className="w-full bg-brand text-paper rounded-[3px] font-sans font-bold text-[16px] uppercase tracking-[.1em] py-4 hover:bg-[#254D38] active:scale-[.99] disabled:bg-[#C8BCA8] disabled:text-[#9A8F7A]"
            type="submit"
            disabled={!canSubmit}
          >
            {isVerifying ? 'Verifying…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center font-mono text-[12px] text-muted">
          Need access? Contact your manager.
        </p>
      </div>
    </main>
  )
}

export default LoginCredentialsPanel
