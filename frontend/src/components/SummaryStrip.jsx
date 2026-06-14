import { formatCurrency } from '../utils/format';

function Stat({ label, value, accent, sign }) {
  return (
    <div className="flex-1 px-5 py-4 sm:px-6">
      <p className="label-text">{label}</p>
      <p className={`font-mono text-2xl sm:text-3xl font-medium ${accent}`}>
        {sign}
        {formatCurrency(Math.abs(value)).replace('₹', '₹')}
      </p>
    </div>
  );
}

function SummaryStrip({ summary, loading }) {
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const netBalance = summary?.netBalance ?? 0;
  const topCategory = summary?.topSpendingCategory;

  const netAccent = netBalance >= 0 ? 'text-income' : 'text-expense';
  const netSign = netBalance > 0 ? '+' : netBalance < 0 ? '−' : '';

  return (
    <section aria-label="Financial summary" className="card overflow-hidden">
      <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
        <Stat label="Total income" value={totalIncome} accent="text-income" sign="" />
        <Stat label="Total expenses" value={totalExpense} accent="text-expense" sign="" />
        <Stat label="Net balance" value={netBalance} accent={netAccent} sign={netSign} />
      </div>
      <div className="flex items-center justify-between border-t border-border bg-paper px-5 py-3 sm:px-6">
        <span className="text-xs text-muted">
          {loading ? 'Updating…' : 'Top spending category'}
        </span>
        <span className="text-sm font-medium text-ink">
          {topCategory || '—'}
        </span>
      </div>
    </section>
  );
}

export default SummaryStrip;
