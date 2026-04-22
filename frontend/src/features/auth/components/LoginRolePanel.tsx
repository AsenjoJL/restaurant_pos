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
    <aside className="bg-brand p-10 flex flex-col justify-between">
      <div>
        <p
          className="font-mono text-[10px] uppercase tracking-[.22em] text-[#BFD3C6] mb-5 animate-[fadeUp_0.5s_ease_both]"
          style={{ animationDelay: '0s' }}
        >
          Staff Access · POS System
        </p>
        <div className="animate-[fadeUp_0.5s_ease_both]" style={{ animationDelay: '0.1s' }}>
          <p className="m-0 font-serif text-[52px] text-[#F5EDD6] leading-none whitespace-nowrap">
            Asenter<span className="italic text-[#8FC2A6]">.</span>
          </p>
          <p className="m-0 font-serif text-[20px] italic text-[#CDE3D6] mt-1">Restaurant</p>
        </div>
        <p
          className="font-mono text-[11px] text-[#A7C0B0] tracking-[.1em] mb-12 animate-[fadeUp_0.5s_ease_both]"
          style={{ animationDelay: '0.15s' }}
        >
          Urgello Branch
        </p>
        <h1
          className="font-serif text-[28px] text-[#EAF3EC] leading-[1.35] mb-3 animate-[fadeUp_0.5s_ease_both]"
          style={{ animationDelay: '0.2s' }}
        >
          Staff sign-in
        </h1>
        <p
          className="text-[15px] text-[#AFC4B7] leading-relaxed max-w-[295px] mb-9 animate-[fadeUp_0.5s_ease_both]"
          style={{ animationDelay: '0.25s' }}
        >
          Choose your role, then enter your username and PIN to open your workstation.
        </p>
        <p
          className="font-mono text-[10px] uppercase tracking-[.18em] text-[#BFD3C6] mb-4 animate-[fadeUp_0.5s_ease_both]"
          style={{ animationDelay: '0.3s' }}
        >
          Select your role
        </p>
        <div className="grid gap-3">
          {ROLE_CARDS.map((role, index) => {
            const active = selectedRole === role.id
            return (
              <button
                key={role.id}
                type="button"
                className={`flex items-center gap-4 p-4 border rounded-[3px] transition-colors animate-[fadeUp_0.5s_ease_both] ${
                  active
                    ? 'border-[#8FC2A6] bg-[rgba(168,212,186,0.14)]'
                    : 'border-[rgba(191,211,198,0.18)] hover:bg-white/5 hover:border-[#AFC4B7]'
                }`}
                style={{ animationDelay: `${0.35 + index * 0.05}s` }}
                onClick={() => onRoleSelect(role.id)}
              >
                <span
                  className={`w-[46px] h-[46px] rounded-[3px] grid place-items-center border ${
                    active ? 'bg-[#FFF8EA] border-[#DCC9A2]' : 'bg-[#F6F0E4] border-[#D0C4AE]'
                  }`}
                >
                  <img
                    src={role.iconSrc}
                    alt=""
                    aria-hidden="true"
                    className={`w-[26px] h-[26px] object-contain opacity-100 ${
                      role.id === 'cashier' ? '' : 'brightness-0'
                    }`}
                  />
                </span>
                <span className="grid gap-[1px] text-left">
                  <span
                    className={`font-sans text-[18px] font-semibold ${active ? 'text-[#F3F8F4]' : 'text-[#F5EDD6]'}`}
                  >
                    {role.name}
                  </span>
                  <span
                    className={`font-sans text-[13px] ${active ? 'text-[#CFE0D5]' : 'text-[#9FB6A7]'}`}
                  >
                    {role.description}
                  </span>
                </span>
                <span
                  className={`ml-auto w-5 h-5 rounded-full border-[1.5px] grid place-items-center ${
                    active ? 'border-[#8FC2A6] bg-[#8FC2A6]' : 'border-[rgba(191,211,198,0.28)]'
                  }`}
                >
                  <span
                    className={`w-[7px] h-[7px] rounded-full ${active ? 'bg-brand' : 'bg-transparent'}`}
                  />
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div />
    </aside>
  )
}

export default LoginRolePanel
