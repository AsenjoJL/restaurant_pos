import LoginCredentialsPanel from '../components/LoginCredentialsPanel'
import LoginRolePanel from '../components/LoginRolePanel'
import useLoginPageController from './useLoginPageController'

function LoginPage() {
  const {
    canSubmit,
    handleNumpadPress,
    handleRoleSelect,
    handleSubmit,
    isShaking,
    isSubmitting,
    isVerifying,
    pin,
    roleName,
    selectedRole,
    setUsername,
    username,
  } = useLoginPageController()

  return (
    <div className="min-h-screen grid place-items-center overflow-hidden bg-[#f7f2e9] px-6 py-10">
      <section className="w-full max-w-[420px] rounded-[22px] border border-[#e7dbc9] bg-white px-9 py-10 shadow-[0_18px_48px_rgba(79,58,28,0.08)]">
        <div className="mb-7 text-center">
          <p className="m-0 font-serif text-[54px] leading-none text-[#17130f]">
            ASENTER
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#b4a58b]">
            Staff Access · POS System
          </p>
        </div>
        <div className="mb-6 border-t border-[#ece2d3]" />
        <LoginRolePanel
          onRoleSelect={handleRoleSelect}
          selectedRole={selectedRole}
        />
        <LoginCredentialsPanel
          canSubmit={canSubmit}
          isShaking={isShaking}
          isSubmitting={isSubmitting}
          isVerifying={isVerifying}
          onNumpadPress={handleNumpadPress}
          onSubmit={handleSubmit}
          onUsernameChange={setUsername}
          pin={pin}
          roleName={roleName}
          username={username}
        />
      </section>
    </div>
  )
}

export default LoginPage
