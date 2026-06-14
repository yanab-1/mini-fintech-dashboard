import { formatCurrency, formatDate } from '../utils/format';

function TransactionList({ transactions = [], loading, onDelete, deletingId }) {
  return (
    <section className="card">
      <div className="border-b border-border p-5 sm:p-6">
        <h2 className="text-base font-semibold text-ink">Transactions</h2>
        <p className="mt-1 text-sm text-muted">
          {loading ? 'Loading…' : `${transactions.length} ${transactions.length === 1 ? 'entry' : 'entries'}`}
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted">Loading transactions…</div>
      ) : transactions.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted">
          No transactions match these filters yet. Add one above or adjust your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium sm:px-6">Date</th>
                <th className="px-5 py-3 font-medium sm:px-6">Category</th>
                <th className="px-5 py-3 font-medium sm:px-6">Note</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Amount</th>
                <th className="px-5 py-3 sm:px-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((t) => (
                <tr key={t._id} className="transition-colors hover:bg-paper">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-ink sm:px-6">{formatDate(t.date)}</td>
                  <td className="px-5 py-3 text-ink sm:px-6">{t.category}</td>
                  <td className="px-5 py-3 text-muted sm:px-6">{t.note || '—'}</td>
                  <td
                    className={`whitespace-nowrap px-5 py-3 text-right font-mono font-medium sm:px-6 ${
                      t.type === 'income' ? 'text-income' : 'text-expense'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '−'}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-3 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => onDelete(t._id)}
                      disabled={deletingId === t._id}
                      className="text-xs font-medium text-muted transition-colors hover:text-expense disabled:opacity-50"
                    >
                      {deletingId === t._id ? 'Removing…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default TransactionList;
