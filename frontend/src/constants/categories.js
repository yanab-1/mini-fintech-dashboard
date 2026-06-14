export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Other',
];

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

export const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));

// Stable color per category for the chart, falling back to a default
// for any custom category the user might type in.
export const CATEGORY_COLORS = {
  Food: '#2F9E5B',
  Transport: '#1F5C4D',
  Housing: '#C1483B',
  Utilities: '#D98E04',
  Entertainment: '#7C5CBF',
  Shopping: '#3B82C4',
  Health: '#D9647B',
  Education: '#5B8C5A',
  Salary: '#2F9E5B',
  Freelance: '#3B82C4',
  Investment: '#7C5CBF',
  Gift: '#D9647B',
  Other: '#8C9A94',
};

export const DEFAULT_CATEGORY_COLOR = '#8C9A94';
