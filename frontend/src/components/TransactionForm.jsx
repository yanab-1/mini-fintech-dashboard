import { useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { toDateInputValue } from '../utils/format';

const emptyForm = {
  type: 'expense',
  amount: '',
  category: EXPENSE_CATEGORIES[0],
  date: toDateInputValue(new Date()),
  note: '',
};

function TransactionForm({ onAdd, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const categoryOptions = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type) => {
    const nextCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm((prev) => ({
      ...prev,
      type,
      category: nextCategories[0],
    }));
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }

    try {
      await onAdd({
        amount,
        type: form.type,
        category: form.category,
        date: form.date,
        note: form.note.trim(),
      });
      setForm((prev) => ({ ...emptyForm, type: prev.type, category: prev.category }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not add transaction. Please try again.');
    }
  };

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-ink">Add a transaction</h2>
      <p className="mt-1 text-sm text-muted">Log income or an expense to keep your ledger current.</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <span className="label-text">Type</span>
          <div className="grid grid-cols-2 gap-2">
            {['expense', 'income'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                aria-pressed={form.type === type}
                className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  form.type === type
                    ? type === 'income'
                      ? 'border-income bg-income/10 text-income'
                      : 'border-expense bg-expense/10 text-expense'
                    : 'border-border bg-paper text-muted hover:text-ink'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="amount" className="label-text">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange('amount')}
              className="input-field font-mono"
              required
            />
          </div>
          <div>
            <label htmlFor="date" className="label-text">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={handleChange('date')}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="label-text">
            Category
          </label>
          <select id="category" value={form.category} onChange={handleChange('category')} className="input-field">
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="note" className="label-text">
            Note <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="note"
            type="text"
            maxLength={280}
            placeholder="e.g. Dinner with friends"
            value={form.note}
            onChange={handleChange('note')}
            className="input-field"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-expense">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add transaction'}
        </button>
      </form>
    </section>
  );
}

export default TransactionForm;
