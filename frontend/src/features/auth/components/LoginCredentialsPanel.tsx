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
    <main className="animate-[fadeIn_0.5s_0.1s_ease_both]">
      <form onSubmit={onSubmit} className="grid">
        <div className="mb-5 font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b2a28b]">
          {roleName}
        </div>
        <label
          className="mb-2 font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b2a28b]"
          htmlFor="staff-username"
        >
          Username
        </label>
        <input
          id="staff-username"
          className="mb-5 w-full rounded-[10px] border border-[#e0d2bc] bg-[#fcf8f2] px-4 py-3 text-[18px] text-[#17130f] outline-none placeholder:text-[#c4b59b] focus:border-[#c8ae73]"
          placeholder="Enter username"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          autoComplete="username"
          required
          disabled={isSubmitting}
        />

        <p className="mb-2 font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b2a28b]">PIN</p>
        <div className={`mb-2 flex gap-2.5 ${isShaking ? 'animate-[shake_0.4s_ease]' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const filled = pin[index] !== undefined
            const active = index === pin.length && pin.length < 4
            return (
              <span
                key={index}
                className={`grid h-[46px] w-[46px] place-items-center rounded-[10px] border text-[18px] ${
                  filled ? 'border-[#c8ae73] text-[#17130f]' : 'border-[#e0d2bc] text-[#17130f]'
                } ${active ? 'bg-[#f4ede2] border-[#c8ae73]' : 'bg-[#fbf7f0]'}`}
              >
                {filled ? '●' : ''}
              </span>
            )
          })}
        </div>
        <p className="mb-6 text-[10px] text-[#b2a28b]">
          Use the credential set by your admin
        </p>

        <div className="mb-5 grid grid-cols-3 gap-2.5">
          {NUMPAD_KEYS.map((key) => {
            const isActionKey = key === 'Clear' || key === '⌫'
            return (
              <button
                key={key}
                type="button"
                className={`rounded-[10px] border border-[#e0d2bc] bg-white py-3.5 text-center text-[14px] text-[#17130f] transition-colors hover:bg-[#faf5ec] hover:border-[#c9b99d] active:scale-[.98] ${
                  isActionKey ? 'text-[13px] text-[#9f9078]' : ''
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
          className="w-full rounded-[10px] bg-[#17130f] py-3.5 text-[12px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#231c16] active:scale-[.99] disabled:bg-[#d9ccb8] disabled:text-[#9a8b76]"
          type="submit"
          disabled={!canSubmit}
        >
          {isVerifying ? 'Verifying…' : 'Sign In'}
        </button>
      </form>
      <p className="mt-4 text-center text-[10px] text-[#b2a28b]">
        Need access? Contact your manager.
      </p>
    </main>
  )
}

export default LoginCredentialsPanel
