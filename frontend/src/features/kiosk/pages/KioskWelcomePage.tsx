import { useEffect, useState, useCallback } from 'react'
import type { SVGProps } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKiosk } from '../kiosk.context'

type SvgProps = SVGProps<SVGSVGElement>

const Svg = ({ children, ...props }: SvgProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
)

const Icons = {
  ArrowRight: (
    <Svg>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Svg>
  ),
  Check: (
    <Svg strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  ),
  Fingerprint: (
    <Svg>
      <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
      <path d="M5 19.5C5.5 18 6 15 6 12c0-2.5 1.5-4.5 4-5.5" />
      <path d="M10.5 7.5c1-.5 2-.5 3 0 2 1 2.5 3 2 5-1.5 5-3.5 7-4.5 9" />
      <path d="M2.5 17.5c.5-1.5.5-3 .5-5 0-1.5.5-2.5 1-3.5" />
      <path d="M22 12a10 10 0 0 1-1.5 5" />
    </Svg>
  ),
  Sliders: (
    <Svg>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </Svg>
  ),
  CreditCard: (
    <Svg>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </Svg>
  ),
  Zap: (
    <Svg>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Svg>
  ),
  RefreshCw: (
    <Svg>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Svg>
  ),
  ChefHat: (
    <Svg>
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </Svg>
  ),
  Beef: (
    <Svg>
      <circle cx="12.5" cy="8.5" r="2.5" />
      <path d="M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z" />
      <path d="m18.5 6 2.19 4.5a6.48 6.48 0 0 1 .31 2c0 3.58-2.96 6.5-6.5 6.5-.22 0-1.4 0-2 -.5" />
    </Svg>
  ),
  Fish: (
    <Svg>
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
      <path d="M18 12v.5" />
      <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 3.98-.23 7.23 1.73 8.92C5.08 15.51 6.56 15.83 8 15" />
      <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" />
    </Svg>
  ),
  Pizza: (
    <Svg>
      <path d="M15 11h.01" />
      <path d="M11 15h.01" />
      <path d="M16 16h.01" />
      <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
      <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
    </Svg>
  ),
  Salad: (
    <Svg>
      <path d="M7 21h10" />
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
      <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-3.19 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
      <path d="m13 12 4-4" />
      <path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2" />
    </Svg>
  ),
  Soup: (
    <Svg>
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
      <path d="M7 21h10" />
      <path d="M19.5 12 22 6" />
      <path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.06.78.34 1.24.73 1.62" />
      <path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62" />
      <path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.06.78.34 1.24.73 1.62" />
    </Svg>
  ),
  Coffee: (
    <Svg>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </Svg>
  ),
  Sandwich: (
    <Svg>
      <path d="M3 11v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3" />
      <path d="M12 19H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3.83" />
      <path d="m3 11 7.77-6.04a2 2 0 0 1 2.46 0L21 11H3Z" />
      <path d="M12.97 19.77 7 15h12.5l-3.75 4.5a2 2 0 0 1-2.78.27Z" />
    </Svg>
  ),
  IceCream: (
    <Svg>
      <path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11" />
      <path d="M17 7A5 5 0 0 0 7 7" />
      <path d="M11 3a3 3 0 0 0 0 6c.56 0 1.08-.15 1.53-.42" />
    </Svg>
  ),
  Wine: (
    <Svg>
      <path d="M8 22h8" />
      <path d="M7 10h10" />
      <path d="M12 15v7" />
      <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H7c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
    </Svg>
  ),
  Ticket: (
    <Svg>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </Svg>
  ),
  Star: (
    <Svg strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Svg>
  ),
  Sparkles: (
    <Svg>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </Svg>
  ),
  Asterisk: (
    <Svg>
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
    </Svg>
  ),
} as const

type IconKey = keyof typeof Icons

type FoodItem = {
  label: string
  bg: string
  icon: IconKey
  image?: string
}

type SlideItem = {
  title: string
  description: string
  iconKey: IconKey
  accent: string
}

type PerkItem = {
  iconKey: IconKey
  color: string
  bg: string
  title: string
  desc: string
}

const foodItems: FoodItem[] = [
  {
    label: 'Chicken',
    bg: 'linear-gradient(145deg,#8B2500,#5c1900)',
    icon: 'Beef',
    image: '/chickenbbq.jpg',
  },
  {
    label: 'Shrimp',
    bg: 'linear-gradient(145deg,#C05000,#8B3800)',
    icon: 'Fish',
    image: '/shrimp.jpg',
  },
  {
    label: 'Carbonara',
    bg: 'linear-gradient(145deg,#9A8200,#6b5a00)',
    icon: 'ChefHat',
    image: '/carbonara.jpg',
  },
  {
    label: 'Lumpia',
    bg: 'linear-gradient(145deg,#1A6B30,#0f4a20)',
    icon: 'Salad',
    image: '/lumpia.jpg',
  },
  {
    label: 'Chili Fish',
    bg: 'linear-gradient(145deg,#9A1A1A,#6b0f0f)',
    icon: 'Fish',
    image: '/chilliFish.jpg',
  },
  {
    label: 'Pizza',
    bg: 'linear-gradient(145deg,#B34A00,#7a3200)',
    icon: 'Pizza',
    image: '/pizza.jpg',
  },
  {
    label: 'Salmon',
    bg: 'linear-gradient(145deg,#C04A20,#8a3015)',
    icon: 'Fish',
    image: '/salmon.jpg',
  },
  {
    label: 'Spaghetti',
    bg: 'linear-gradient(145deg,#8B1A1A,#5c1010)',
    icon: 'Soup',
    image: '/spaghetti.jpg',
  },
  {
    label: 'Burger',
    bg: 'linear-gradient(145deg,#7A3000,#522000)',
    icon: 'Sandwich',
    image: '/burger.png',
  },
  {
    label: 'Drinks',
    bg: 'linear-gradient(145deg,#2E0D4A,#1a0830)',
    icon: 'Wine',
    image: '/rootBeer.jpg',
  },
]

const slides: SlideItem[] = [
  {
    title: 'Customize Every Order',
    description: 'Add extras, swap ingredients — make it entirely yours.',
    iconKey: 'Sliders',
    accent: '#ff6b35',
  },
  {
    title: 'Pay At The Counter',
    description: "Get your order number first. Pay when you're ready.",
    iconKey: 'CreditCard',
    accent: '#00c9a7',
  },
  {
    title: 'Straight To The Kitchen',
    description: 'Orders are dispatched the moment payment is confirmed.',
    iconKey: 'Zap',
    accent: '#f7b731',
  },
]

const perks: PerkItem[] = [
  {
    iconKey: 'Fingerprint',
    color: '#ff6b35',
    bg: 'rgba(255,107,53,0.11)',
    title: 'Touch-Friendly',
    desc: 'Large targets, minimal typing.',
  },
  {
    iconKey: 'Ticket',
    color: '#00c9a7',
    bg: 'rgba(0,201,167,0.11)',
    title: 'Order Slip',
    desc: 'Get a number, then proceed to pay.',
  },
  {
    iconKey: 'Sparkles',
    color: '#f7b731',
    bg: 'rgba(247,183,49,0.11)',
    title: 'Fresh Every Day',
    desc: 'Ingredients sourced each morning.',
  },
]

const chips = ['No queuing', 'Fully customizable', 'Pay when ready']

function KioskWelcomePage() {
  const navigate = useNavigate()
  const { reset } = useKiosk()
  const [activeSlide, setActiveSlide] = useState(0)
  const [pressed, setPressed] = useState(false)
  const [hoveredFood, setHoveredFood] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [])

  const handleStart = useCallback(() => {
    setPressed(true)
    window.setTimeout(() => setPressed(false), 300)
    reset()
    navigate('/kiosk/menu')
  }, [navigate, reset])

  const currentSlide = slides[activeSlide]

  return (
    <div className="kiosk-root">
      <svg className="kiosk-noise" aria-hidden="true">
        <filter id="kn">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.68"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#kn)" />
      </svg>

      <div className="kiosk-wrap">
        <div className="kiosk-badge">
          <span className="kiosk-badge-dot" aria-hidden="true" />
          Self-Order Kiosk · Open Now
        </div>

        <div
          className={`hero-card${pressed ? ' hero-card--pressed' : ''}`}
          onClick={handleStart}
          role="button"
          tabIndex={0}
          aria-label="Tap to start your order"
          onKeyDown={(event) => event.key === 'Enter' && handleStart()}
        >
          <p className="hero-eyebrow">Welcome</p>

          <h1 className="hero-title">
            Order
            <br />
            your <span className="hero-title__gradient">way.</span>
          </h1>

          <p className="hero-subtitle">
            Browse our full menu, customize each dish, and receive an order slip
            before paying at the counter.
          </p>

          <div className="hero-chips">
            {chips.map((label) => (
              <span key={label} className="hero-chip">
                <span className="hero-chip__icon" aria-hidden="true">
                  {Icons.Check}
                </span>
                {label}
              </span>
            ))}
          </div>

          <div className="hero-cta">
            <button
              className="btn-start"
              onClick={(event) => {
                event.stopPropagation()
                handleStart()
              }}
              aria-label="Start your order"
              type="button"
            >
              <span style={{ display: 'flex', flexShrink: 0 }}>{Icons.Fingerprint}</span>
              Tap to Start Order
              <span className="btn-start__arrow" aria-hidden="true">
                {Icons.ArrowRight}
              </span>
            </button>
          </div>

          <div className="hero-ornament" aria-hidden="true">
            {Icons.Asterisk}
          </div>
        </div>

        <div className="gallery-card">
          <p className="gallery-label">On the menu today</p>

          <div className="gallery-grid" role="list">
            {foodItems.map((food, index) => (
              <div
                key={food.label}
                className="food-tile"
                role="listitem"
                style={{ background: food.bg }}
                onMouseEnter={() => setHoveredFood(index)}
                onMouseLeave={() => setHoveredFood(null)}
                title={food.label}
                aria-label={food.label}
              >
                {food.image ? (
                  <img
                    className="food-tile__image"
                    src={food.image}
                    alt={food.label}
                    loading="lazy"
                  />
                ) : null}
                <div className="food-tile__content">
                  <span className="food-tile__icon" aria-hidden="true">
                    {Icons[food.icon]}
                  </span>
                  <span className="food-tile__label">{food.label}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="gallery-hovered-label" aria-live="polite">
            {hoveredFood !== null ? `— ${foodItems[hoveredFood].label}` : '\u00A0'}
          </p>
        </div>

        <div className="slides-card">
          <p className="slides-eyebrow">How it works</p>

          <div className="slide-display" key={activeSlide}>
            <div
              className="slide-icon-wrap"
              style={{
                background: `${currentSlide.accent}18`,
                color: currentSlide.accent,
              }}
              aria-hidden="true"
            >
              {Icons[currentSlide.iconKey]}
            </div>
            <div>
              <p className="slide-title">{currentSlide.title}</p>
              <p className="slide-desc">{currentSlide.description}</p>
            </div>
          </div>

          <div className="slide-dots" role="tablist" aria-label="Feature highlights">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                className="slide-dot"
                role="tab"
                aria-selected={index === activeSlide}
                aria-label={`Step ${index + 1}: ${slide.title}`}
                onClick={() => setActiveSlide(index)}
                style={{
                  width: index === activeSlide ? 30 : 8,
                  background:
                    index === activeSlide ? currentSlide.accent : 'rgba(255,255,255,0.12)',
                }}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="perks-row">
          {perks.map((perk) => (
            <div className="perk" key={perk.title}>
              <div
                className="perk-icon"
                style={{ background: perk.bg, color: perk.color }}
                aria-hidden="true"
              >
                {Icons[perk.iconKey]}
              </div>
              <div>
                <span className="perk__title">{perk.title}</span>
                <span className="perk__desc">{perk.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KioskWelcomePage
