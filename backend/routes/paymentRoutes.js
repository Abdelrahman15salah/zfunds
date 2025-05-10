const express = require('express');
const { check } = require('express-validator');
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
  getPaymentsByUserId
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/payments
// @desc    Create a new payment
// @access  Private
router.post(
  '/',
  [
    protect,
    check('payment_amount', 'Payment amount must be a positive number').isFloat({ min: 0.01 }),
    check('payment_status', 'Payment status is required').not().isEmpty()
  ],
  createPayment
);

// @route   GET /api/payments
// @desc    Get all payments (admin sees all, users see only their own)
// @access  Private
router.get('/', protect, getPayments);

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', protect, getPaymentById);

// @route   PUT /api/payments/:id
// @desc    Update payment status
// @access  Private/Admin
router.put(
  '/:id',
  [
    protect,
    admin,
    check('payment_status', 'Payment status is required').not().isEmpty()
  ],
  updatePaymentStatus
);

// @route   GET /api/payments/user/:userId
// @desc    Get payments by user ID
// @access  Private
router.get('/user/:userId', protect, getPaymentsByUserId);

module.exports = router;