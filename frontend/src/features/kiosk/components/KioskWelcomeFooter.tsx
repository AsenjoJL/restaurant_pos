import type { RefObject } from 'react'

type KioskWelcomeFooterProps = {
  orderLookup: string
  orderLookupRef: RefObject<HTMLInputElement | null>
  onLookupChange: (value: string) => void
  onLookupSubmit: () => void
}

function KioskWelcomeFooter({
  orderLookup,
  orderLookupRef,
  onLookupChange,
  onLookupSubmit,
}: KioskWelcomeFooterProps) {
  return (
    <div className="shrink-0 border-t border-divider bg-paper px-6 py-[10px] flex justify-between items-center animate-[fadeUp_0.5s_0.5s_ease_both]">
      <div className="flex items-center gap-[9px]">
        <span className="font-mono text-[10px] uppercase tracking-[.16em] text-muted">
          Check order
        </span>
        <input
          ref={orderLookupRef}
          className="border border-divider bg-cream rounded-[2px] font-mono text-[14px] text-body px-[11px] py-[8px] w-[170px] outline-none placeholder:text-[#BEB4A6] focus:border-brand"
          placeholder="Enter order no."
          value={orderLookup}
          onChange={(event) => onLookupChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onLookupSubmit()
            }
          }}
        />
        <button
          type="button"
          className="bg-brand text-paper rounded-[2px] font-sans font-bold text-[12px] uppercase tracking-[.08em] px-[16px] py-[9px] hover:bg-[#254D38] transition-colors"
          onClick={onLookupSubmit}
        >
          Look up
        </button>
      </div>
      <div className="flex items-center gap-[7px]">
        <span className="w-[6px] h-[6px] rounded-full bg-dim animate-[pulse-dot_2s_infinite]" />
        <span className="font-mono text-[11px] text-dim">A-623 · Now serving at counter</span>
      </div>
    </div>
  )
}

export default KioskWelcomeFooter
