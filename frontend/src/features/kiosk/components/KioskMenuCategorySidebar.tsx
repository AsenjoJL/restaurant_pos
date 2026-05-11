import type { MenuCategory } from '../../pos/pos.types'

type KioskMenuCategorySidebarProps = {
  activeCategory: string
  categories: MenuCategory[]
  categoryCounts: Map<string, number>
  totalCount: number
  onCategoryChange: (categoryId: string) => void
}

function KioskMenuCategorySidebar({
  activeCategory,
  categories,
  categoryCounts,
  totalCount,
  onCategoryChange,
}: KioskMenuCategorySidebarProps) {
  const items = [
    { id: 'all', name: 'All', count: totalCount },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      count: categoryCounts.get(category.id) ?? 0,
    })),
  ]

  return (
    <aside className="h-full min-h-0 overflow-y-auto bg-white px-2 py-4 text-black">
      <div className="mb-3 px-2">
        <p className="m-0 text-[10px] uppercase tracking-[0.18em] text-[#5f5a4f]">Category</p>
      </div>

      <div className="grid gap-2">
        {items.map((item) => {
          const isActive = activeCategory === item.id

          return (
            <button
              key={item.id}
              type="button"
              className={`w-full rounded-[10px] px-3 py-2 text-left transition-colors ${
                isActive
                  ? 'bg-[#dfeade] text-black'
                  : 'bg-transparent text-black hover:bg-[#f4f6f1]'
              }`}
              onClick={() => onCategoryChange(item.id)}
            >
              <span className="block text-[13px] font-bold leading-tight">{item.name}</span>
              <span className="mt-1 block text-[10px] text-[#6f6a5f]">
                {item.count} item{item.count === 1 ? '' : 's'}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default KioskMenuCategorySidebar
