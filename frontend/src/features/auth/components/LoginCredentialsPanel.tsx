type LoginCredentialsPanelProps = {
  canSubmit: boolean
  isShaking: boolean
  isSubmitting: boolean
  isVerifying: boolean
  onPasswordChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onUsernameChange: (value: string) => void
  password: string
  username: string
}

function LoginCredentialsPanel({
  canSubmit,
  isShaking,
  isSubmitting,
  isVerifying,
  onPasswordChange,
  onSubmit,
  onUsernameChange,
  password,
  username,
}: LoginCredentialsPanelProps) {
  return (
    <main className="animate-[fadeIn_0.5s_0.1s_ease_both]">
      <form onSubmit={onSubmit} className="grid">
        <p className="mb-7 text-center text-[15px] leading-6 text-[#4b5563]">
          Welcome back. Sign in with your staff username and password.
        </p>
        <label
          className="mb-2 font-sans text-[14px] font-semibold text-[#374151]"
          htmlFor="staff-username"
        >
          Username
        </label>
        <input
          id="staff-username"
          name="username"
          className="mb-5 w-full rounded-[12px] border border-[#d1d5db] bg-white px-4 py-3 text-[17px] text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#285943] focus:ring-2 focus:ring-[#285943]/10"
          placeholder="Enter username"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          autoComplete="username"
          autoFocus
          required
          disabled={isSubmitting}
        />

        <label
          className="mb-2 font-sans text-[14px] font-semibold text-[#374151]"
          htmlFor="staff-password"
        >
          Password
        </label>
        <input
          id="staff-password"
          name="password"
          className={`mb-6 w-full rounded-[12px] border border-[#d1d5db] bg-white px-4 py-3 text-[17px] text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#285943] focus:ring-2 focus:ring-[#285943]/10 ${
            isShaking ? 'animate-[shake_0.4s_ease]' : ''
          }`}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          autoComplete="current-password"
          required
          disabled={isSubmitting}
        />

        <button
          className="w-full rounded-[12px] bg-[#285943] py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#214c39] active:scale-[.99] disabled:bg-[#d1d5db] disabled:text-[#6b7280]"
          type="submit"
          disabled={!canSubmit}
        >
          {isVerifying ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-center text-[13px] text-[#6b7280]">
        Need access? Contact your manager.
      </p>
    </main>
  )
}

export default LoginCredentialsPanel
