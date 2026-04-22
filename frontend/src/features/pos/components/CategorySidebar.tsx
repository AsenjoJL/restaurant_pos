import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectRuntimeMenuCategories, selectRuntimeMenuProducts } from '../menu.selectors'
import { selectActiveCategory, selectSearchTerm } from '../pos.selectors'
import { setActiveCategoryId, setSearchTerm } from '../pos.store'

function CategorySidebar() {
  const dispatch = useAppDispatch()
  const activeCategoryId = useAppSelector(selectActiveCategory)
  const searchTerm = useAppSelector(selectSearchTerm)
  const categories = useAppSelector(selectRuntimeMenuCategories)
  const products = useAppSelector(selectRuntimeMenuProducts)

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    products.forEach((product) => {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
    })
    counts.set('all', products.length)
    return counts
  }, [products])

  return (
    <aside className="pos-sidebar panel">
      <div className="sidebar-status-banner">
        <span className="sidebar-status-dot" />
        <span>Open for service</span>
      </div>

      <div className="sidebar-header">
        <div>
          <h2>Categories</h2>
          <p className="muted">Tap to filter the menu</p>
        </div>
      </div>

      <label className="search-field">
        <span className="search-label">Search</span>
        <input
          className="search-input"
          type="search"
          placeholder="Search menu items"
          value={searchTerm}
          onChange={(event) => dispatch(setSearchTerm(event.target.value))}
        />
      </label>

      <div className="category-list">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id
          return (
            <button
              key={category.id}
              type="button"
              className={`category-button${isActive ? ' is-active' : ''}`}
              onClick={() => dispatch(setActiveCategoryId(category.id))}
              aria-pressed={isActive}
            >
              <span>{category.name}</span>
              <span className="category-count">{categoryCounts.get(category.id) ?? 0}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default CategorySidebar
