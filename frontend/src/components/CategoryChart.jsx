import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from '../constants/categories';
import { formatCurrency } from '../utils/format';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { category, total } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-card">
      <p className="font-medium text-ink">{category}</p>
      <p className="font-mono text-muted">{formatCurrency(total)}</p>
    </div>
  );
}

function CategoryChart({ data = [], loading }) {
  const hasData = data.length > 0;

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-ink">Spending by category</h2>
      <p className="mt-1 text-sm text-muted">Where your expenses are going right now.</p>

      <div className="mt-4 h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">Loading chart…</div>
        ) : !hasData ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted">
            No expenses yet. Add a transaction to see your breakdown here.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || DEFAULT_CATEGORY_COLOR} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: '#6B7A72' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export default CategoryChart;
