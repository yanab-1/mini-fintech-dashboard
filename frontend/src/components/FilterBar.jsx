import { ALL_CATEGORIES } from '../constants/categories';

function FilterBar({ filters, onChange, onClear }) {
  const handleChange = (field) => (e) => {
    onChange({ ...filters, [field]: e.target.value });
  };

  const hasActiveFilters = filters.category || filters.startDate || filters.endDate || filters.type;

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Filters</h2>
        {hasActiveFilters && (
          <button type="button" onClick={onClear} className="text-xs font-medium text-brand hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="filter-type" className="label-text">
            Type
          </label>
          <select id="filter-type" value={filters.type} onChange={handleChange('type')} className="input-field">
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-category" className="label-text">
            Category
          </label>
          <select id="filter-category" value={filters.category} onChange={handleChange('category')} className="input-field">
            <option value="">All categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-start" className="label-text">
            From
          </label>
          <input
            id="filter-start"
            type="date"
            value={filters.startDate}
            onChange={handleChange('startDate')}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="filter-end" className="label-text">
            To
          </label>
          <input
            id="filter-end"
            type="date"
            value={filters.endDate}
            onChange={handleChange('endDate')}
            className="input-field"
          />
        </div>
      </div>
    </section>
  );
}

export default FilterBar;
