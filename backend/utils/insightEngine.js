/**
 * Rule-based insight engine.
 *
 * Given a list of transactions, returns a single, human-readable
 * observation about the user's spending. Rules are checked in order
 * of "usefulness" — the first rule whose condition is met wins.
 *
 * This keeps the logic transparent and easy to extend: add a new
 * rule object to the `rules` array with a `test` and `build` function.
 */

const round = (num) => Math.round(num * 100) / 100;

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const isSameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const generateInsight = (transactions = []) => {
  if (!transactions.length) {
    return {
      type: 'empty',
      message: 'Add a few transactions to start seeing personalized insights about your spending habits.',
    };
  }

  const expenses = transactions.filter((t) => t.type === 'expense');
  const income = transactions.filter((t) => t.type === 'income');

  const totalExpense = round(expenses.reduce((sum, t) => sum + t.amount, 0));
  const totalIncome = round(income.reduce((sum, t) => sum + t.amount, 0));

  // Category breakdown for expenses only
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  // Month-over-month comparison
  const now = new Date();
  const thisMonthExpenses = expenses.filter((t) => isSameMonth(new Date(t.date), now));
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthExpenses = expenses.filter((t) => isSameMonth(new Date(t.date), lastMonthDate));

  const thisMonthTotal = round(thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0));
  const lastMonthTotal = round(lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0));

  const rules = [
    {
      id: 'over-budget',
      test: () => totalIncome > 0 && totalExpense > totalIncome,
      build: () => ({
        type: 'warning',
        message: `Your expenses (${totalExpense.toFixed(2)}) currently exceed your income (${totalIncome.toFixed(
          2
        )}). You're running a deficit of ${(totalExpense - totalIncome).toFixed(2)}.`,
      }),
    },
    {
      id: 'month-over-month-increase',
      test: () => lastMonthTotal > 0 && thisMonthTotal > lastMonthTotal * 1.2,
      build: () => {
        const pctChange = round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);
        return {
          type: 'warning',
          message: `Your spending this month (${thisMonthTotal.toFixed(2)}) is ${pctChange}% higher than last month (${lastMonthTotal.toFixed(
            2
          )}).`,
        };
      },
    },
    {
      id: 'top-category-concentration',
      test: () => topCategoryEntry && totalExpense > 0 && topCategoryEntry[1] / totalExpense > 0.3,
      build: () => {
        const [category, amount] = topCategoryEntry;
        const pct = round((amount / totalExpense) * 100);
        return {
          type: 'info',
          message: `"${category}" is your biggest expense category, making up ${pct}% of your total spending (${amount.toFixed(
            2
          )}).`,
        };
      },
    },
    {
      id: 'month-over-month-decrease',
      test: () => lastMonthTotal > 0 && thisMonthTotal < lastMonthTotal * 0.8,
      build: () => {
        const pctChange = round(((lastMonthTotal - thisMonthTotal) / lastMonthTotal) * 100);
        return {
          type: 'positive',
          message: `Nice work! Your spending this month (${thisMonthTotal.toFixed(2)}) is down ${pctChange}% compared to last month.`,
        };
      },
    },
    {
      id: 'healthy-balance',
      test: () => totalIncome > 0 && totalExpense <= totalIncome,
      build: () => {
        const savedPct = round(((totalIncome - totalExpense) / totalIncome) * 100);
        return {
          type: 'positive',
          message: `You're keeping a healthy balance — you've saved about ${savedPct}% of your income so far.`,
        };
      },
    },
  ];

  const matched = rules.find((rule) => rule.test());

  if (matched) {
    return { id: matched.id, ...matched.build() };
  }

  return {
    type: 'info',
    message: 'Your spending looks fairly balanced across categories. Keep logging transactions to spot trends over time.',
  };
};

module.exports = { generateInsight };
