import type { CSSProperties } from 'react'

type KioskWelcomeSidebarProps = {
  isOpening: boolean
  onStart: () => void
}

const fadeUpStyle = (delay: string): CSSProperties => ({ animationDelay: delay })
const bubbleStyle = (animation: string): CSSProperties => ({ animation })

function KioskWelcomeSidebar({
  isOpening,
  onStart,
}: KioskWelcomeSidebarProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white px-8 text-center">
      <div className="flex w-full max-w-[420px] flex-col items-center">
        <div
          className="relative mb-10 flex h-[360px] w-full max-w-[560px] animate-[fadeUp_0.5s_ease_both] items-center justify-center overflow-visible"
          style={fadeUpStyle('0s')}
        >
          <span
            className="pointer-events-none absolute inset-x-[18%] top-[14%] z-0 h-[210px] rounded-full bg-[#f3eadb] opacity-70 blur-[12px]"
            style={bubbleStyle('kioskBubbleFloat 6.4s ease-in-out infinite')}
          />
          <div
            className="relative z-10 h-full w-full will-change-transform"
            style={bubbleStyle('kioskImageBubble 4.2s ease-in-out infinite')}
          >
            <img
              src="/BesMenu.png"
              alt="Best menu"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <h2
          className="mb-4 animate-[fadeUp_0.5s_ease_both] font-serif text-[34px] leading-[1.25] text-[#17130f]"
          style={fadeUpStyle('0.08s')}
        >
          What would you like today?
        </h2>
        <p
          className="mb-10 max-w-[320px] animate-[fadeUp_0.5s_ease_both] text-[16px] leading-relaxed text-[#8f8068]"
          style={fadeUpStyle('0.14s')}
        >
          Start your order and choose whether you want dine-in or takeout.
        </p>
        <button
          type="button"
          className="w-full max-w-[260px] animate-[fadeUp_0.5s_ease_both] rounded-[10px] bg-[#17130f] py-4 font-sans text-[16px] uppercase tracking-[.08em] text-white transition-all hover:bg-[#2a221c] active:scale-[.98]"
          onClick={onStart}
          style={fadeUpStyle('0.2s')}
        >
          {isOpening ? 'Opening menu…' : 'Start Your Order'}
        </button>
      </div>
    </div>
  )
}

export default KioskWelcomeSidebar
