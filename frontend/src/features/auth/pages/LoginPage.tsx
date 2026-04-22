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
    <div className="min-h-screen grid place-items-center bg-cream overflow-hidden">
      <section className="w-full max-w-[1240px] h-[min(820px,100vh)] grid grid-cols-[380px_minmax(0,1fr)]">
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
