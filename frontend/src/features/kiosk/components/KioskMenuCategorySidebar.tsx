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
  return (
    <aside className="w-[170px] shrink-0 bg-paper border-r border-divider py-3 overflow-y-auto">
      <p className="px-3 mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted">
        Category
      </p>
      <div className="flex flex-col gap-[2px]">
        <button
          type="button"
          className={`w-full min-h-[44px] px-3 flex items-center justify-between text-[15px] border-l-2 transition-colors ${
            activeCategory === 'all'
              ? 'border-brand bg-chip text-brand font-semibold'
              : 'border-transparent text-body hover:bg-[#EFE9DE]'
          }`}
          onClick={() => onCategoryChange('all')}
        >
          <span>All</span>
          <span className="font-mono text-[13px] text-muted">{totalCount}</span>
        </button>
        {categories.map((category) => {
          const isActive = activeCategory === category.id
          return (
            <button
              key={category.id}
              type="button"
              className={`w-full min-h-[44px] px-3 flex items-center justify-between text-[15px] border-l-2 transition-colors ${
                isActive
                  ? 'border-brand bg-chip text-brand font-semibold'
                  : 'border-transparent text-body hover:bg-[#EFE9DE]'
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              <span>{category.name}</span>
              <span className="font-mono text-[13px] text-muted">
                {categoryCounts.get(category.id) ?? 0}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default KioskMenuCategorySidebar
