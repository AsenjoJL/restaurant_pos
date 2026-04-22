import KioskWelcomeTickerCard from './KioskWelcomeTickerCard'
import type { LandingTickerItem } from '../welcome/welcome.content'

type KioskWelcomeTickerBoardProps = {
  brokenImages: Record<string, boolean>
  rowAnimationMap: readonly string[]
  tracks: LandingTickerItem[][]
  onImageError: (image: string) => void
  onViewMenu: () => void
}

function KioskWelcomeTickerBoard({
  brokenImages,
  rowAnimationMap,
  tracks,
  onImageError,
  onViewMenu,
}: KioskWelcomeTickerBoardProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-cream text-body">
      <header className="px-6 py-5 border-b border-divider flex justify-between items-end shrink-0 animate-[fadeIn_0.5s_0.1s_ease_both]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted mb-1">
            Menu highlights
          </p>
          <h3 className="font-serif text-[30px] text-body">Popular right now</h3>
        </div>
        <button
          type="button"
          className="font-mono text-[11px] uppercase text-muted border-b border-divider pb-[1px] hover:text-brand hover:border-brand cursor-pointer"
          onClick={onViewMenu}
        >
          View full menu
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col gap-px bg-divider">
        {tracks.map((items, rowIndex) => (
          <div key={`ticker-${rowIndex}`} className="flex-1 flex overflow-hidden bg-cream">
            <div className={`flex gap-px h-full ${rowAnimationMap[rowIndex] ?? rowAnimationMap[0]}`}>
              {items.map((item, index) => (
                <KioskWelcomeTickerCard
                  key={`${item.name}-${rowIndex}-${index}`}
                  item={item}
                  onSelect={onViewMenu}
                  imageBroken={Boolean(brokenImages[item.image])}
                  onImageError={onImageError}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KioskWelcomeTickerBoard
