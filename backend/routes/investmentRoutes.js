const express = require('express');
const { check } = require('express-validator');
const {
  createInvestment,
  getInvestments,
  getInvestmentById,
  getInvestmentsByUserId,
  getInvestmentsByCompanyId
} = require('../controllers/investmentController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/investments
// @desc    Create a new investment
// @access  Private
router.post(
  '/',
  [
    protect,
    check('investment_amount', 'Investment amount must be a positive number').isFloat({ min: 0.01 }),
    check('company_id', 'Company ID is required').not().isEmpty()
  ],
  createInvestment
);

// @route   GET /api/investments
// @desc    Get all investments (admin sees all, company owners see their company investments)
// @access  Private
router.get('/', protect, getInvestments);

// @route   GET /api/investments/:id
// @desc    Get investment by ID
// @access  Private
router.get('/:id', protect, getInvestmentById);

// @route   GET /api/investments/user/:userId
// @desc    Get investments by user ID
// @access  Private
router.get('/user/:userId', protect, getInvestmentsByUserId);

// @route   GET /api/investments/company/:companyId
// @desc    Get investments by company ID
// @access  Private
router.get('/company/:companyId', protect, getInvestmentsByCompanyId);

module.exports = router;