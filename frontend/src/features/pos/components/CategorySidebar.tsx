import { categories } from '../../../mock/data'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectActiveCategory, selectSearchTerm } from '../pos.selectors'
import { setActiveCategoryId, setSearchTerm } from '../pos.store'

function CategorySidebar() {
  const dispatch = useAppDispatch()
  const activeCategoryId = useAppSelector(selectActiveCategory)
  const searchTerm = useAppSelector(selectSearchTerm)

  return (
    <aside className="pos-sidebar panel">
      <div className="sidebar-header">
        <div>
          <h2>Categories</h2>
          <p className="muted">Tap to filter the menu</p>
        </div>
        <span className="status-chip">Open</span>
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
              <span className="category-indicator" />
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default CategorySidebar
