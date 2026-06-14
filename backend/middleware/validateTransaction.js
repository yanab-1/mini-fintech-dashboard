const AppError = require('../utils/AppError');

const normalizeAmount = (value) => {
  if (value === undefined || value === null || value === '') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
};

const normalizeDate = (value) => {
  if (value === undefined || value === null || value === '') return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
};

const validateCreateTransaction = (req, res, next) => {
  const errors = [];

  req.body.amount = normalizeAmount(req.body.amount);
  req.body.date = normalizeDate(req.body.date);
  req.body.category = typeof req.body.category === 'string' ? req.body.category.trim() : req.body.category;
  req.body.note = typeof req.body.note === 'string' ? req.body.note.trim() : req.body.note;

  const { amount, type, category, date } = req.body;

  if (amount === undefined || amount === null || amount === '') {
    errors.push('Amount is required');
  } else if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!type || !['income', 'expense'].includes(type)) {
    errors.push('Type must be either "income" or "expense"');
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('Category is required');
  }

  if (!date || Number.isNaN(new Date(date).getTime())) {
    errors.push('A valid date is required');
  }

  if (errors.length) {
    return next(new AppError(errors.join(', '), 400));
  }

  next();
};

const validateUpdateTransaction = (req, res, next) => {
  const errors = [];

  if (req.body.amount !== undefined) {
    req.body.amount = normalizeAmount(req.body.amount);
  }
  if (req.body.date !== undefined) {
    req.body.date = normalizeDate(req.body.date);
  }
  if (typeof req.body.category === 'string') {
    req.body.category = req.body.category.trim();
  }
  if (typeof req.body.note === 'string') {
    req.body.note = req.body.note.trim();
  }

  const { amount, type, category, date } = req.body;

  if (amount !== undefined && (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0)) {
    errors.push('Amount must be a positive number');
  }

  if (type !== undefined && !['income', 'expense'].includes(type)) {
    errors.push('Type must be either "income" or "expense"');
  }

  if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
    errors.push('Category cannot be empty');
  }

  if (date !== undefined && Number.isNaN(new Date(date).getTime())) {
    errors.push('Date is invalid');
  }

  if (errors.length) {
    return next(new AppError(errors.join(', '), 400));
  }

  next();
};

module.exports = { validateCreateTransaction, validateUpdateTransaction };
