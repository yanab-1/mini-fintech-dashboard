/**
 * Seeds the database with sample transactions so the dashboard has
 * data to display immediately after setup.
 *
 * Usage:  npm run seed
 * Add --reset to wipe existing transactions first:  npm run seed -- --reset
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Transaction = require('../models/Transaction');

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const sampleTransactions = [
  { amount: 55000, type: 'income', category: 'Salary', date: daysAgo(35), note: 'Monthly salary' },
  { amount: 4500, type: 'expense', category: 'Housing', date: daysAgo(33), note: 'Rent' },
  { amount: 1200, type: 'expense', category: 'Food', date: daysAgo(32), note: 'Groceries' },
  { amount: 800, type: 'expense', category: 'Transport', date: daysAgo(30), note: 'Fuel' },
  { amount: 2200, type: 'expense', category: 'Shopping', date: daysAgo(28), note: 'New shoes' },
  { amount: 600, type: 'expense', category: 'Entertainment', date: daysAgo(25), note: 'Movie night' },
  { amount: 1500, type: 'expense', category: 'Utilities', date: daysAgo(20), note: 'Electricity bill' },
  { amount: 3000, type: 'income', category: 'Freelance', date: daysAgo(15), note: 'Logo design project' },
  { amount: 900, type: 'expense', category: 'Food', date: daysAgo(10), note: 'Dining out' },
  { amount: 55000, type: 'income', category: 'Salary', date: daysAgo(5), note: 'Monthly salary' },
  { amount: 5200, type: 'expense', category: 'Housing', date: daysAgo(3), note: 'Rent' },
  { amount: 1100, type: 'expense', category: 'Food', date: daysAgo(2), note: 'Groceries' },
  { amount: 750, type: 'expense', category: 'Health', date: daysAgo(1), note: 'Pharmacy' },
];

const run = async () => {
  await connectDB();

  if (process.argv.includes('--reset')) {
    await Transaction.deleteMany({});
    console.log('Existing transactions removed.');
  }

  await Transaction.insertMany(sampleTransactions);
  console.log(`Inserted ${sampleTransactions.length} sample transactions.`);

  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
