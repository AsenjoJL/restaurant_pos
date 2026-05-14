import type { LandingBadge, LandingTickerItem } from '../welcome/welcome.content'

const getBadgeClassName = (badge?: LandingBadge) => {
  if (badge === 'Best Seller') {
    return 'bg-brand text-sage'
  }
  if (badge === 'Popular') {
    return 'bg-body text-[#C8BCA8]'
  }
  return 'bg-[#3A5A2A] text-sage'
}

type KioskWelcomeTickerCardProps = {
  item: LandingTickerItem
  onSelect: () => void
  onImageError: (image: string) => void
  imageBroken: boolean
}

function KioskWelcomeTickerCard({
  item,
  onSelect,
  onImageError,
  imageBroken,
}: KioskWelcomeTickerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`bg-paper shrink-0 flex flex-col overflow-hidden rounded-[8px] cursor-pointer hover:bg-[#F0EAE0] transition-colors ${
        item.wide ? 'w-[240px]' : 'w-[180px]'
      }`}
    >
      <div
        className="flex-1 min-h-[92px] relative flex items-center justify-center overflow-hidden"
        style={{ background: item.tone }}
      >
        {item.badge ? (
          <span
            className={`absolute top-2 left-2 z-20 font-mono text-[9px] uppercase tracking-[.12em] px-2.5 py-1 rounded-[2px] ${getBadgeClassName(item.badge)}`}
          >
            {item.badge}
          </span>
        ) : null}

        {!imageBroken ? (
          <img
            src={encodeURI(item.image)}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={() => onImageError(item.image)}
          />
        ) : null}

        <div className="absolute inset-0 bg-[rgba(20,14,10,0.08)]" />
        <svg
          className="relative z-10 opacity-15"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="44" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="px-4 py-2.5 border-t border-divider flex justify-between items-center shrink-0 gap-3">
        <span className="font-sans text-[15px] font-semibold text-body leading-tight">{item.name}</span>
        <span className="font-mono text-[14px] text-brand whitespace-nowrap">{item.price}</span>
      </div>
    </button>
  )
}

export default KioskWelcomeTickerCard
