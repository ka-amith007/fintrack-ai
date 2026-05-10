const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTransactions);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required')
], createTransaction);

router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
