import LoginCredentialsPanel from '../components/LoginCredentialsPanel'
import useLoginPageController from './useLoginPageController'

function LoginPage() {
  const {
    canSubmit,
    handleSubmit,
    isShaking,
    isSubmitting,
    isVerifying,
    password,
    setPassword,
    setUsername,
    username,
  } = useLoginPageController()

  return (
    <div className="grid min-h-screen place-items-center overflow-hidden bg-white px-6 py-10 font-sans">
      <section className="w-full max-w-[440px] rounded-[18px] border border-[#e5e7eb] bg-white px-9 py-10 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-8 text-center">
          <p className="m-0 font-sans text-[40px] font-bold leading-none text-[#111827]">
            ASENTER
          </p>
          <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
            Staff Access · POS System
          </p>
        </div>
        <div className="mb-7 border-t border-[#e5e7eb]" />
        <LoginCredentialsPanel
          canSubmit={canSubmit}
          isShaking={isShaking}
          isSubmitting={isSubmitting}
          isVerifying={isVerifying}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          onUsernameChange={setUsername}
          password={password}
          username={username}
        />
      </section>
    </div>
  )
}

export default LoginPage
