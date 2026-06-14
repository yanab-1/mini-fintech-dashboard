const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateInsight } = require('../utils/insightEngine');

const round = (num) => Math.round(num * 100) / 100;

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Builds a Mongoose filter object from query params.
 * Supported filters:
 *  - category: exact match (case-insensitive)
 *  - type: 'income' | 'expense'
 *  - startDate / endDate: inclusive date range filter on `date`
 */
const buildFilter = (query) => {
  const filter = {};

  if (query.category) {
    filter.category = { $regex: `^${escapeRegex(query.category)}$`, $options: 'i' };
  }

  if (query.type && ['income', 'expense'].includes(query.type)) {
    filter.type = query.type;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  return filter;
};

const createTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, note } = req.body;

  const transaction = await Transaction.create({
    amount,
    type,
    category,
    date,
    note,
  });

  res.status(201).json({ success: true, data: transaction });
});

const getTransactions = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);

  const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });

  res.json({ success: true, count: transactions.length, data: transactions });
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  res.json({ success: true, data: transaction });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { amount, type, category, date, note } = req.body;

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  if (amount !== undefined) transaction.amount = amount;
  if (type !== undefined) transaction.type = type;
  if (category !== undefined) transaction.category = category;
  if (date !== undefined) transaction.date = date;
  if (note !== undefined) transaction.note = note;

  await transaction.save();

  res.json({ success: true, data: transaction });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  await transaction.deleteOne();

  res.json({ success: true, data: { id: req.params.id } });
});

const getSummary = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);
  const transactions = await Transaction.find(filter);

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  transactions.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total: round(total) }))
    .sort((a, b) => b.total - a.total);

  const topSpendingCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : null;

  res.json({
    success: true,
    data: {
      totalIncome: round(totalIncome),
      totalExpense: round(totalExpense),
      netBalance: round(totalIncome - totalExpense),
      topSpendingCategory,
      categoryBreakdown,
      transactionCount: transactions.length,
    },
  });
});

const getInsight = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);
  const transactions = await Transaction.find(filter);

  const insight = generateInsight(transactions);

  res.json({ success: true, data: insight });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getInsight,
};
