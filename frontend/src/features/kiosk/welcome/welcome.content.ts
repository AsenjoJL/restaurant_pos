import type { MenuProduct } from '../../pos/pos.types'

export type LandingBadge = 'Best Seller' | 'Popular' | 'New'

export type LandingTickerItem = {
  name: string
  price: string
  tone: string
  image: string
  badge?: LandingBadge
  wide?: boolean
}

export const tickerRows: LandingTickerItem[][] = [
  [
    {
      name: 'Chicken BBQ',
      badge: 'Best Seller',
      price: '₱1,299',
      tone: '#4A3020',
      image: '/chickenbbq.jpg',
      wide: true,
    },
    {
      name: 'Garlic Shrimp',
      badge: 'Popular',
      price: '₱1,599',
      tone: '#3A4A30',
      image: '/shrimp.jpg',
    },
    {
      name: 'Crispy Pata',
      badge: 'Best Seller',
      price: '₱1,899',
      tone: '#5A3A22',
      image: '/crispyPata.jpg',
    },
    {
      name: 'Ube Cheesecake',
      badge: 'New',
      price: '₱499',
      tone: '#5A3A6B',
      image: '/ube cheesecake.jpg',
    },
    {
      name: 'Beef Tapa',
      badge: 'Popular',
      price: '₱1,150',
      tone: '#2A3A4A',
      image: '/beef tapa.jpg',
      wide: true,
    },
    {
      name: 'Salmon Steak',
      badge: 'New',
      price: '₱1,349',
      tone: '#3A4A20',
      image: '/salmon.jpg',
    },
  ],
  [
    {
      name: 'Chicken Inasal',
      badge: 'Popular',
      price: '₱1,399',
      tone: '#6B3A1A',
      image: '/chicken inasal.jpg',
    },
    {
      name: 'Beef Kari Kari',
      badge: 'Best Seller',
      price: '₱1,475',
      tone: '#4A3A1A',
      image: '/beef kari kari.jpg',
      wide: true,
    },
    {
      name: 'Pork Sisig',
      badge: 'Popular',
      price: '₱1,350',
      tone: '#5E2A1A',
      image: '/pork sisig.jpg',
    },
    {
      name: 'Pancit Canton',
      badge: 'New',
      price: '₱899',
      tone: '#3A4A2A',
      image: '/spaghetti.jpg',
    },
    {
      name: 'Lumpia',
      badge: 'Best Seller',
      price: '₱649',
      tone: '#4A3A2A',
      image: '/lumpia.jpg',
    },
    {
      name: 'Adobo',
      badge: 'Popular',
      price: '₱1,250',
      tone: '#3A2A1A',
      image: '/adobo.jpg',
      wide: true,
    },
  ],
  [
    {
      name: 'Beef Kari Kari',
      badge: 'Best Seller',
      price: '₱1,475',
      tone: '#4A3A1A',
      image: '/beef kari kari.jpg',
      wide: true,
    },
    {
      name: 'Garlic Shrimp',
      badge: 'Popular',
      price: '₱1,599',
      tone: '#3A4A30',
      image: '/shrimp.jpg',
    },
    {
      name: 'Lumpia',
      badge: 'Best Seller',
      price: '₱649',
      tone: '#4A3A2A',
      image: '/lumpia.jpg',
    },
    {
      name: 'Salmon Steak',
      badge: 'New',
      price: '₱1,349',
      tone: '#3A4A20',
      image: '/salmon.jpg',
    },
    {
      name: 'Chicken BBQ',
      badge: 'Best Seller',
      price: '₱1,299',
      tone: '#4A3020',
      image: '/chickenbbq.jpg',
      wide: true,
    },
    {
      name: 'Adobo',
      badge: 'Popular',
      price: '₱1,250',
      tone: '#3A2A1A',
      image: '/adobo.jpg',
    },
  ],
]

const badgeCycle: LandingBadge[] = ['Best Seller', 'Popular', 'New']

const formatWelcomePrice = (price: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)

const toLandingTickerItem = (
  product: MenuProduct,
  index: number,
): LandingTickerItem | null => {
  if (!product.image) {
    return null
  }

  return {
    name: product.name,
    price: formatWelcomePrice(product.price),
    tone:
      product.tone === 'sun'
        ? '#4A3020'
        : product.tone === 'mint'
          ? '#3A4A30'
          : product.tone === 'berry'
            ? '#5A3A6B'
            : product.tone === 'ocean'
              ? '#2A3A4A'
              : product.tone === 'clay'
                ? '#5A3A22'
                : '#3A4A20',
    image: product.image,
    badge: badgeCycle[index % badgeCycle.length],
    wide: index % 5 === 0,
  }
}

const chunkTickerItems = (
  items: LandingTickerItem[],
  rowCount: number,
  itemsPerRow: number,
) => {
  if (items.length === 0) {
    return tickerRows
  }

  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const start = rowIndex * itemsPerRow
    const slice = items.slice(start, start + itemsPerRow)

    if (slice.length === itemsPerRow) {
      return slice
    }

    const fallbackRow = tickerRows[rowIndex % tickerRows.length]
    const needed = itemsPerRow - slice.length
    return [...slice, ...fallbackRow.slice(0, needed)]
  })
}

export const buildTickerRowsFromProducts = (
  products: MenuProduct[],
  rowCount = 3,
  itemsPerRow = 6,
) => {
  const featured = products
    .filter((product) => product.availability !== 'SOLD_OUT')
    .map(toLandingTickerItem)
    .filter((item): item is LandingTickerItem => item !== null)

  if (featured.length === 0) {
    return tickerRows
  }

  const needed = rowCount * itemsPerRow
  const repeated = Array.from({ length: needed }, (_, index) => featured[index % featured.length])

  return chunkTickerItems(repeated, rowCount, itemsPerRow)
}
