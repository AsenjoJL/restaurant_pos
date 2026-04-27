import { ROLE_CARDS } from '../login.constants'
import type { Role } from '../auth.types'

type LoginRolePanelProps = {
  onRoleSelect: (role: Role) => void
  selectedRole: Role
}

function LoginRolePanel({
  onRoleSelect,
  selectedRole,
}: LoginRolePanelProps) {
  return (
    <div className="mb-6">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#b2a28b]">
        Select your role
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {ROLE_CARDS.map((role, index) => {
          const active = selectedRole === role.id
          return (
            <button
              key={role.id}
              type="button"
              className={`grid min-h-[78px] place-items-center gap-1 rounded-[10px] border px-2 py-3 text-center transition-all animate-[fadeUp_0.5s_ease_both] ${
                active
                  ? 'border-[#17130f] bg-[#17130f]'
                  : 'border-[#e0d2bc] bg-white hover:border-[#c9b99d] hover:bg-[#fcf8f1]'
              }`}
              style={{ animationDelay: `${0.06 + index * 0.05}s` }}
              onClick={() => onRoleSelect(role.id)}
            >
              <img
                src={role.iconSrc}
                alt=""
                aria-hidden="true"
                className={`h-[22px] w-[22px] object-contain ${
                  active ? 'brightness-0 invert' : role.id === 'cashier' ? '' : ''
                }`}
              />
              <span
                className={`text-[15px] leading-none ${
                  active ? 'text-white' : 'text-[#8f8068]'
                }`}
              >
                {role.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LoginRolePanel
