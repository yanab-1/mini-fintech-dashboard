const express = require('express');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getInsight,
} = require('../controllers/transactionController');
const {
  validateCreateTransaction,
  validateUpdateTransaction,
} = require('../middleware/validateTransaction');

const router = express.Router();

// IMPORTANT: specific routes (/summary, /insight) must be declared
// BEFORE the generic '/:id' route, otherwise Express would treat
// "summary" / "insight" as an :id value.
router.get('/summary', getSummary);
router.get('/insight', getInsight);

router.route('/').get(getTransactions).post(validateCreateTransaction, createTransaction);

router
  .route('/:id')
  .get(getTransactionById)
  .put(validateUpdateTransaction, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
