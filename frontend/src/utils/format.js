// Centralized currency formatting. Change `currency` here to localize
// the whole app to a different currency (e.g. 'USD', 'EUR').
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatCurrency = (value) => currencyFormatter.format(value || 0);

export const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Returns YYYY-MM-DD for <input type="date"> values
export const toDateInputValue = (value) => {
  const date = value ? new Date(value) : new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
};
