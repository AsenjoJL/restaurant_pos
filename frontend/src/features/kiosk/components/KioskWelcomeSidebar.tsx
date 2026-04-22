import type { CSSProperties } from 'react'

type KioskWelcomeSidebarProps = {
  isOpening: boolean
  clockLabel: string
  onStart: () => void
}

const fadeUpStyle = (delay: string): CSSProperties => ({ animationDelay: delay })

function KioskWelcomeSidebar({
  isOpening,
  clockLabel,
  onStart,
}: KioskWelcomeSidebarProps) {
  return (
    <div className="w-[370px] shrink-0 flex flex-col justify-between p-9 border-r border-faint">
      <div className="flex flex-col">
        <p
          className="font-mono text-[10px] uppercase tracking-[.22em] text-[#AFC4B7] mb-[18px] animate-[fadeUp_0.5s_ease_both]"
          style={fadeUpStyle('0s')}
        >
          Urgello Branch · Est. 2019
        </p>
        <div
          className="mb-1 animate-[fadeUp_0.5s_ease_both]"
          style={fadeUpStyle('0.1s')}
        >
          <div className="font-serif text-[58px] text-paper leading-none whitespace-nowrap">
            Asenter<span className="italic text-[#8FC2A6]">.</span>
          </div>
          <div className="font-serif text-[20px] italic text-mid mt-1">Restaurant</div>
        </div>
        <p
          className="font-mono text-[11px] text-[#A7C0B0] tracking-[.1em] mb-11 animate-[fadeUp_0.5s_ease_both]"
          style={fadeUpStyle('0.15s')}
        >
          Customer Order Kiosk
        </p>
        <h2
          className="font-serif text-[30px] text-[#EAF3EC] leading-[1.3] mb-3 animate-[fadeUp_0.5s_ease_both]"
          style={fadeUpStyle('0.2s')}
        >
          What would you like today?
        </h2>
        <p
          className="text-[17px] text-[#B7CBBE] leading-relaxed max-w-[290px] mb-8 animate-[fadeUp_0.5s_ease_both]"
          style={fadeUpStyle('0.25s')}
        >
          Tap a dish to begin. Pay at the counter when your order is ready.
        </p>
        <button
          type="button"
          className="w-full bg-paper text-brand rounded-[3px] font-sans font-bold text-[18px] uppercase tracking-[.09em] py-[18px] mb-[10px] hover:bg-[#E8E0CA] active:scale-[.98] transition-all animate-[fadeUp_0.5s_ease_both]"
          onClick={onStart}
          style={fadeUpStyle('0.3s')}
        >
          {isOpening ? 'Opening menu…' : 'Start Your Order'}
        </button>
      </div>

      <div
        className="flex justify-between items-center animate-[fadeUp_0.5s_ease_both]"
        style={fadeUpStyle('0.4s')}
      >
        <div className="flex items-center gap-[7px]">
          <span className="w-[7px] h-[7px] rounded-full bg-[#8FC2A6] animate-[pulse-dot_2s_infinite]" />
          <span className="font-mono text-[11px] uppercase tracking-[.1em] text-[#B7CBBE]">
            Open now
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#9FB6A7] tracking-[.06em]">
          {clockLabel}
        </span>
      </div>
    </div>
  )
}

export default KioskWelcomeSidebar
