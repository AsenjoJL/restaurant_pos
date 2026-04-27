function KioskWelcomeFooter() {
  return (
    <div className="shrink-0 border-t border-divider bg-paper px-6 py-[10px] flex justify-end items-center animate-[fadeUp_0.5s_0.5s_ease_both]">
      <div className="flex items-center gap-[7px]">
        <span className="w-[6px] h-[6px] rounded-full bg-dim animate-[pulse-dot_2s_infinite]" />
        <span className="font-mono text-[11px] text-dim">A-623 · Now serving at counter</span>
      </div>
    </div>
  )
}

export default KioskWelcomeFooter
